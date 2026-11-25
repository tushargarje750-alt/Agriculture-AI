"""Shared helpers for loading the disease model and preparing images for it."""

import json
import os

import numpy as np
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "keras_model.h5")
METRICS_PATH = os.path.join(BASE_DIR, "model_metrics.json")
IMG_SIZE = (224, 224)

# Output order of the shipped Teachable Machine model.
DEFAULT_CLASSES = [
    "Rice Leaf Blast (Magnaporthe grisea)",
    "Tomato Late Blight (Phytophthora infestans)",
    "Banana Bunchy Top Virus (BBTV)",
    "Wheat Brown Rust",
    "Wheat Yellow Rust",
    "Potato Early Blight (Alternaria solani)",
    "Tomato Yellow Leaf Curl Virus (ToLCNDV)",
    "Citrus Canker (Xanthomonas axonopodis)",
    "Corn/Maize Common Rust (Puccinia sorghi)",
    "Sugarcane Red Rot (Colletotrichum falcatum)",
    "Cucumber/Muskmelon Downy Mildew",
]


def load_metrics() -> dict:
    """Return model_metrics.json as a dict, or {} if it does not exist."""
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def preprocess_image(img: Image.Image) -> np.ndarray:
    """
    Centre-crop to a square, resize to 224x224 and scale pixels to [-1, 1].

    Both the Teachable Machine export and models from train_model.py
    (MobileNetV2 preprocess_input) expect pixels in [-1, 1].
    """
    img = ImageOps.fit(img.convert("RGB"), IMG_SIZE, Image.Resampling.LANCZOS)
    arr = np.asarray(img, dtype=np.float32) / 127.5 - 1.0
    return np.expand_dims(arr, axis=0)
