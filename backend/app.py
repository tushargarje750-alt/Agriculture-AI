import json
import os
from functools import wraps

import tf_keras
import google.generativeai as genai
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

import firebase_admin
from firebase_admin import auth as firebase_auth

from irrigation_engine import recommend as irrigation_recommend
from anomaly_detector import detect as anomaly_detect

# ── Config ─────────────────────────────────────────────────────────────────────

API_KEY = os.getenv("API_KEY")
genai.configure(api_key=API_KEY)
model_chat = genai.GenerativeModel("gemini-2.5-flash")

app = Flask(__name__)
CORS(app)

# ── Disease detection model ────────────────────────────────────────────────────

model = tf_keras.models.load_model("keras_model.h5")

LABELS = {
    0:  "Rice Leaf Blast (Magnaporthe grisea)",
    1:  "Tomato Late Blight (Phytophthora infestans)",
    2:  "Banana Bunchy Top Virus (BBTV)",
    3:  "Wheat Brown Rust",
    4:  "Wheat Yellow Rust",
    5:  "Potato Early Blight (Alternaria solani)",
    6:  "Tomato Yellow Leaf Curl Virus (ToLCNDV)",
    7:  "Citrus Canker (Xanthomonas axonopodis)",
    8:  "Corn/Maize Common Rust (Puccinia sorghi)",
    9:  "Sugarcane Red Rot (Colletotrichum falcatum)",
    10: "Cucumber/Muskmelon Downy Mildew",
}

# ── Firebase Admin (auth middleware) ───────────────────────────────────────────
# Initialise only if GOOGLE_APPLICATION_CREDENTIALS is set.
# In production: set this env var to your Firebase service-account JSON path.
# In local dev: auth middleware is skipped automatically.

_firebase_ready = False
try:
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if creds_path and os.path.exists(creds_path):
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        _firebase_ready = True
except Exception:
    pass


def require_auth(f):
    """
    JWT middleware — verifies Firebase ID token sent as Bearer token.
    Passes through in local dev when Firebase Admin is not configured.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not _firebase_ready:
            return f(*args, **kwargs)
        token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
        if not token:
            return jsonify({"error": "Missing Authorization header"}), 401
        try:
            firebase_auth.verify_id_token(token)
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "detail": str(e)}), 401
        return f(*args, **kwargs)
    return wrapper


# ── Helpers ────────────────────────────────────────────────────────────────────

def preprocess_image(img: Image.Image) -> np.ndarray:
    img = img.resize((224, 224))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict():
    """Classify a crop leaf image and return disease name + confidence."""
    try:
        file = request.files["image"]
        img = Image.open(file).convert("RGB")
        processed = preprocess_image(img)
        prediction = model.predict(processed)
        class_index = int(np.argmax(prediction))
        confidence = float(np.max(prediction))
        return jsonify({
            "disease": LABELS[class_index],
            "confidence": round(confidence * 100, 2),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """Agricultural AI chatbot powered by Gemini."""
    try:
        data = request.get_json()
        user_msg = data.get("message", "")
        prompt = (
            "You are an expert agriculture assistant. "
            "Give practical advice to farmers.\n\n"
            f"Question: {user_msg}\n"
            "Answer in simple Hinglish."
        )
        response = model_chat.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "Error in chatbot", "error": str(e)}), 500


@app.route("/irrigation/recommend", methods=["POST"])
@require_auth
def irrigation_recommendation():
    """
    Smart irrigation scheduling.

    Request body (JSON):
        soil     : float  — soil moisture %
        temp     : float  — air temperature °C
        humidity : float  — relative humidity %
        hour     : int    — (optional) hour override 0–23

    Response: IrrigationRecommendation dict with reasons + warnings.
    """
    try:
        data = request.get_json() or {}
        result = irrigation_recommend(
            soil=float(data.get("soil", 50)),
            temp=float(data.get("temp", 25)),
            humidity=float(data.get("humidity", 60)),
            hour=data.get("hour"),
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/anomaly/detect", methods=["POST"])
@require_auth
def anomaly_detection():
    """
    Detect anomalous sensor readings using range checks and rolling Z-score.

    Request body (JSON):
        reading : dict  — current sensor values {soil, temp, humidity, gas}
        history : list  — optional list of recent readings (oldest first)

    Response: anomaly report with per-sensor scores.
    """
    try:
        data = request.get_json() or {}
        result = anomaly_detect(
            reading=data.get("reading", {}),
            history=data.get("history", []),
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/model/info", methods=["GET"])
def model_info():
    """Return model architecture metadata and performance metrics."""
    if os.path.exists("model_metrics.json"):
        with open("model_metrics.json") as f:
            return jsonify(json.load(f))
    return jsonify({
        "architecture": "MobileNetV2 (Transfer Learning, ImageNet weights)",
        "task": "Multi-class Plant Disease Classification",
        "num_classes": len(LABELS),
        "classes": list(LABELS.values()),
        "input_shape": [224, 224, 3],
        "note": "Run evaluate_model.py to generate full metrics",
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
