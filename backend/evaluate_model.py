"""
Evaluate existing keras_model.h5 and export model_metrics.json
Run: python evaluate_model.py
"""

import json
import numpy as np
import tf_keras as keras

MODEL_PATH = "keras_model.h5"

CLASS_NAMES = [
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

def main():
    print("Loading model...")
    model = keras.models.load_model(MODEL_PATH)

    total_params = model.count_params()
    trainable = int(sum(np.prod(w.shape) for w in model.trainable_weights))

    metrics = {
        "architecture": "MobileNetV2 (Transfer Learning, ImageNet weights)",
        "task": "Multi-class Plant Disease Classification",
        "num_classes": len(CLASS_NAMES),
        "classes": CLASS_NAMES,
        "input_shape": list(model.input_shape[1:]),
        "output_activation": "softmax",
        "total_parameters": int(total_params),
        "trainable_parameters": trainable,
        "total_layers": len(model.layers),
        "note": (
            "Model trained on a custom agricultural disease dataset. "
            "Run train_model.py with a labelled dataset to regenerate with full accuracy metrics."
        ),
    }

    with open("model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(json.dumps(metrics, indent=2))
    print("\nSaved: model_metrics.json")

if __name__ == "__main__":
    main()
