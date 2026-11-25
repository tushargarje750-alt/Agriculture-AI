"""
AgriIrrigation backend (Flask).

Endpoints
    GET  /health                 what is configured (model, chatbot, auth)
    GET  /model/info             classifier details and recorded metrics
    POST /predict                leaf photo -> disease label, confidence, advice
    POST /chat                   farming question -> Gemini answer in Hinglish
    POST /irrigation/recommend   sensor + forecast values -> irrigation advice
    POST /anomaly/detect         sensor reading + history -> faulty-reading report

Settings come from backend/.env (see .env.example).
"""

import logging
import os
from functools import wraps

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

import numpy as np
import tf_keras
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

import firebase_admin
from firebase_admin import auth as firebase_auth

from anomaly_detector import detect as anomaly_detect
from disease_info import info_for
from irrigation_engine import recommend as irrigation_recommend
from model_utils import DEFAULT_CLASSES, MODEL_PATH, load_metrics, preprocess_image

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("agri")

# ── Settings ───────────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "false").lower() in ("1", "true", "yes")

MAX_UPLOAD_MB = 10
MAX_CHAT_CHARS = 1000
# Below this top-class probability the result is reported as uncertain.
UNCERTAIN_BELOW = 0.60

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024
CORS(app, origins=CORS_ORIGINS)

# ── Disease detection model ────────────────────────────────────────────────────

model = tf_keras.models.load_model(MODEL_PATH, compile=False)
# The class order must match the model's outputs; model_metrics.json records it.
CLASSES = load_metrics().get("classes") or DEFAULT_CLASSES
if len(CLASSES) != model.output_shape[-1]:
    raise RuntimeError(
        f"model_metrics.json lists {len(CLASSES)} classes but the model has "
        f"{model.output_shape[-1]} outputs"
    )

# ── Gemini chatbot ─────────────────────────────────────────────────────────────

CHAT_SYSTEM_PROMPT = (
    "You are an agriculture assistant for small farmers in India. "
    "Give short, practical advice in simple Hinglish. "
    "For pesticides or fertiliser doses, tell the farmer to confirm with the local "
    "agriculture officer or Krishi Vigyan Kendra. "
    "If a question is not about farming, politely say you can only help with farming."
)

chat_client = None
if GEMINI_API_KEY:
    from google import genai
    from google.genai import types as genai_types

    chat_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    log.warning("API_KEY is not set in backend/.env: /chat will return 503.")

# ── Firebase Admin (auth) ──────────────────────────────────────────────────────

auth_enabled = False
creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
if creds_path and os.path.exists(creds_path):
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    auth_enabled = True
elif AUTH_REQUIRED:
    raise RuntimeError(
        "AUTH_REQUIRED is set but GOOGLE_APPLICATION_CREDENTIALS does not point to a "
        "Firebase service-account file."
    )
else:
    log.warning(
        "Firebase Admin is not configured: API endpoints accept requests without a "
        "login token. This is only acceptable for local development."
    )


def require_auth(f):
    """Check the Firebase ID token sent as `Authorization: Bearer <token>`."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        if not auth_enabled:
            return f(*args, **kwargs)
        header = request.headers.get("Authorization", "")
        token = header[7:].strip() if header.startswith("Bearer ") else ""
        if not token:
            return jsonify({"error": "Missing Authorization header"}), 401
        try:
            firebase_auth.verify_id_token(token)
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)

    return wrapper


# ── Helpers ────────────────────────────────────────────────────────────────────


def number(data: dict, key: str, required: bool = True):
    """Read a numeric field from a JSON body, raising ValueError with a clear message."""
    value = data.get(key)
    if value is None or value == "":
        if required:
            raise ValueError(f"'{key}' is required")
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{key}' must be a number") from None


# ── Routes ─────────────────────────────────────────────────────────────────────


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": True,
        "chat_configured": chat_client is not None,
        "auth_enabled": auth_enabled,
    })


@app.route("/predict", methods=["POST"])
@require_auth
def predict():
    """Classify a crop leaf photo and return the disease, confidence and advice."""
    file = request.files.get("image")
    if file is None:
        return jsonify({"error": "Send the photo as form field 'image'"}), 400
    try:
        img = Image.open(file.stream).convert("RGB")
    except UnidentifiedImageError:
        return jsonify({"error": "The file is not a readable image"}), 400

    probs = model.predict(preprocess_image(img), verbose=0)[0]
    order = np.argsort(probs)[::-1]
    best = int(order[0])
    confidence = float(probs[best])
    label = CLASSES[best]

    return jsonify({
        "disease": label,
        "confidence": round(confidence * 100, 1),
        "uncertain": confidence < UNCERTAIN_BELOW,
        "top": [
            {"disease": CLASSES[int(i)], "confidence": round(float(probs[i]) * 100, 1)}
            for i in order[:3]
        ],
        "info": info_for(label),
        "note": (
            "The model only knows these 11 diseases and has no 'healthy' class, so any "
            "leaf gets one of these labels. Treat low-confidence results as unknown."
        ),
    })


@app.route("/chat", methods=["POST"])
@require_auth
def chat():
    """Agricultural chatbot powered by Gemini."""
    if chat_client is None:
        return jsonify({"error": "Chatbot is not configured: set API_KEY in backend/.env"}), 503

    data = request.get_json(silent=True) or {}
    user_msg = str(data.get("message", "")).strip()
    if not user_msg:
        return jsonify({"error": "'message' is required"}), 400
    if len(user_msg) > MAX_CHAT_CHARS:
        return jsonify({"error": f"Keep questions under {MAX_CHAT_CHARS} characters"}), 400

    try:
        response = chat_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_msg,
            config=genai_types.GenerateContentConfig(system_instruction=CHAT_SYSTEM_PROMPT),
        )
        return jsonify({"reply": response.text})
    except Exception:
        log.exception("Gemini request failed")
        return jsonify({"error": "The chatbot could not answer right now. Try again."}), 502


@app.route("/irrigation/recommend", methods=["POST"])
@require_auth
def irrigation_recommendation():
    """
    Irrigation advice from sensor readings and, when sent, the weather forecast.

    JSON body:
        soil        soil moisture %                     (required)
        temp        air temperature °C                  (required)
        humidity    relative humidity %                 (required)
        hour        local hour 0–23                     (optional, default: server time)
        et0_mm      today's reference evapotranspiration, mm (optional)
        rain_mm_24h forecast rain over the next 24 h, mm      (optional)
    """
    data = request.get_json(silent=True) or {}
    try:
        hour = number(data, "hour", required=False)
        result = irrigation_recommend(
            soil=number(data, "soil"),
            temp=number(data, "temp"),
            humidity=number(data, "humidity"),
            hour=int(hour) % 24 if hour is not None else None,
            et0_mm=number(data, "et0_mm", required=False),
            rain_mm_24h=number(data, "rain_mm_24h", required=False),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(result)


@app.route("/anomaly/detect", methods=["POST"])
@require_auth
def anomaly_detection():
    """
    Flag faulty sensor readings with range checks and a rolling Z-score.

    JSON body:
        reading  current values {soil, temp, humidity, gas}
        history  recent readings, oldest first (optional)
    """
    data = request.get_json(silent=True) or {}
    reading = data.get("reading")
    history = data.get("history") or []
    if not isinstance(reading, dict) or not isinstance(history, list):
        return jsonify({"error": "'reading' must be an object and 'history' a list"}), 400
    try:
        return jsonify(anomaly_detect(reading=reading, history=history[-200:]))
    except (TypeError, ValueError):
        return jsonify({"error": "Sensor values must be numbers"}), 400


@app.route("/model/info", methods=["GET"])
def model_info():
    """Classifier details and whatever accuracy metrics have been recorded."""
    metrics = load_metrics()
    metrics.setdefault("classes", CLASSES)
    metrics.setdefault("num_classes", len(CLASSES))
    return jsonify(metrics)


@app.errorhandler(413)
def too_large(_):
    return jsonify({"error": f"File too large (limit {MAX_UPLOAD_MB} MB)"}), 413


if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
