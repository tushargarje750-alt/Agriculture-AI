"""
Plant Disease Detection — Model Training Pipeline
==================================================
Architecture : MobileNetV2 (Transfer Learning, ImageNet weights)
Task         : Multi-class image classification (11 plant disease categories)
Dataset      : Custom agricultural disease dataset
               Expected layout:
                 dataset/
                   train/
                     Rice_Leaf_Blast/        *.jpg
                     Tomato_Late_Blight/     *.jpg
                     ...
                   val/
                     Rice_Leaf_Blast/        *.jpg
                     ...
Training     : Two-phase — (1) train classifier head, (2) fine-tune top layers
Outputs      : keras_model.h5, training_curves.png, confusion_matrix.png, model_metrics.json

Usage:
    python train_model.py
    python train_model.py --epochs 50 --batch_size 64 --data_dir my_dataset
"""

import argparse
import json
import os
import sys

import matplotlib
matplotlib.use("Agg")  # non-interactive backend for servers
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix

import tensorflow as tf
import tf_keras as keras
from tf_keras.applications import MobileNetV2
from tf_keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tf_keras.models import Model
from tf_keras.preprocessing.image import ImageDataGenerator

# ── Constants ──────────────────────────────────────────────────────────────────

IMG_SIZE = (224, 224)
NUM_CLASSES = 11
FLOW_RATE_LPM = 12.5

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


# ── Data Pipeline ──────────────────────────────────────────────────────────────

def build_generators(data_dir: str, batch_size: int):
    """
    Build train/val data generators with augmentation on training set.

    Augmentation strategy:
      - Geometric: rotation ±30°, horizontal flip, shift, zoom
      - Photometric: brightness variation ±20%
    This improves generalisation across different lighting conditions and
    leaf orientations typical in field photography.
    """
    train_aug = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )
    val_aug = ImageDataGenerator(rescale=1.0 / 255)

    train_gen = train_aug.flow_from_directory(
        os.path.join(data_dir, "train"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=True,
        seed=42,
    )
    val_gen = val_aug.flow_from_directory(
        os.path.join(data_dir, "val"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )
    return train_gen, val_gen


# ── Model ─────────────────────────────────────────────────────────────────────

def build_model(learning_rate: float) -> Model:
    """
    MobileNetV2 with a custom classification head.

    MobileNetV2 was chosen because:
      - Pre-trained on ImageNet (1.4M images) — strong feature extractor
      - Lightweight (3.4M params) — deployable on edge devices
      - Depthwise-separable convolutions — fast inference on Raspberry Pi / Jetson

    Head architecture:
      GlobalAveragePooling → Dense(256, ReLU) → Dropout(0.4) → Dense(11, Softmax)
    """
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # freeze during phase 1

    x = GlobalAveragePooling2D()(base.output)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.4)(x)
    out = Dense(NUM_CLASSES, activation="softmax")(x)

    model = Model(inputs=base.input, outputs=out)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ── Training ──────────────────────────────────────────────────────────────────

def get_callbacks(output_path: str):
    return [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=6,
            restore_best_weights=True,
            verbose=1,
        ),
        keras.callbacks.ModelCheckpoint(
            output_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
    ]


def train(args) -> tuple[Model, dict]:
    """
    Two-phase transfer learning:

    Phase 1 — classifier warmup (5–10 epochs, base frozen)
        Only the new head learns. This prevents the pretrained weights
        from being corrupted by large initial gradients.

    Phase 2 — fine-tuning (up to 15 epochs, top 30 base layers unfrozen)
        Low LR (÷10) so pretrained features are refined rather than destroyed.
    """
    train_gen, val_gen = build_generators(args.data_dir, args.batch_size)
    model = build_model(args.lr)
    model.summary()
    callbacks = get_callbacks(args.output)

    print("\n─── Phase 1: Warming up classifier head ───")
    h1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=args.epochs,
        callbacks=callbacks,
        verbose=1,
    )

    print("\n─── Phase 2: Fine-tuning top 30 base layers ───")
    base = model.layers[0]
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(args.lr / 10),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    h2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=15,
        callbacks=callbacks,
        verbose=1,
    )

    # Merge histories for plotting
    history = {}
    for key in ("accuracy", "val_accuracy", "loss", "val_loss"):
        history[key] = h1.history.get(key, []) + h2.history.get(key, [])

    return model, history, val_gen


# ── Evaluation & Plots ────────────────────────────────────────────────────────

def evaluate(model: Model, val_gen, history: dict):
    """Generate classification report, confusion matrix, and training curves."""

    val_gen.reset()
    y_pred = np.argmax(model.predict(val_gen, verbose=0), axis=1)
    y_true = val_gen.classes

    report = classification_report(
        y_true, y_pred, target_names=CLASS_NAMES, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred)

    # ── Training curves ────────────────────────────────────────────────────────
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    epochs = range(1, len(history["accuracy"]) + 1)

    ax1.plot(epochs, history["accuracy"], label="Train", linewidth=2)
    ax1.plot(epochs, history["val_accuracy"], label="Validation", linewidth=2)
    ax1.set_title("Model Accuracy", fontsize=14)
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(epochs, history["loss"], label="Train", linewidth=2)
    ax2.plot(epochs, history["val_loss"], label="Validation", linewidth=2)
    ax2.set_title("Model Loss", fontsize=14)
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("training_curves.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("Saved: training_curves.png")

    # ── Confusion matrix ───────────────────────────────────────────────────────
    short_names = [c.split("(")[0].strip() for c in CLASS_NAMES]
    plt.figure(figsize=(13, 10))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="YlOrRd",
        xticklabels=short_names,
        yticklabels=short_names,
    )
    plt.title("Confusion Matrix — Plant Disease Classifier", fontsize=14)
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("Saved: confusion_matrix.png")

    # ── Metrics JSON ───────────────────────────────────────────────────────────
    metrics = {
        "architecture": "MobileNetV2 (Transfer Learning, ImageNet)",
        "task": "Multi-class Plant Disease Classification",
        "num_classes": NUM_CLASSES,
        "classes": CLASS_NAMES,
        "input_shape": [224, 224, 3],
        "overall": {
            "accuracy": round(report["accuracy"], 4),
            "macro_precision": round(report["macro avg"]["precision"], 4),
            "macro_recall": round(report["macro avg"]["recall"], 4),
            "macro_f1": round(report["macro avg"]["f1-score"], 4),
        },
        "final_val_accuracy": round(history["val_accuracy"][-1], 4),
        "final_val_loss": round(history["val_loss"][-1], 4),
        "epochs_trained": len(history["accuracy"]),
        "per_class": {
            cls: {
                "precision": round(report[cls]["precision"], 4),
                "recall": round(report[cls]["recall"], 4),
                "f1_score": round(report[cls]["f1-score"], 4),
                "support": int(report[cls]["support"]),
            }
            for cls in CLASS_NAMES
            if cls in report
        },
    }

    with open("model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("Saved: model_metrics.json")

    print(f"\n{'─'*50}")
    print(f"  Val Accuracy  : {metrics['final_val_accuracy']:.4f}")
    print(f"  Val Loss      : {metrics['final_val_loss']:.4f}")
    print(f"  Macro F1      : {metrics['overall']['macro_f1']:.4f}")
    print(f"{'─'*50}\n")

    return metrics


# ── Entry Point ───────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="Train plant disease detection model")
    p.add_argument("--data_dir", default="dataset", help="Root directory with train/val folders")
    p.add_argument("--epochs", type=int, default=30)
    p.add_argument("--batch_size", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-4)
    p.add_argument("--output", default="keras_model.h5")
    return p.parse_args()


if __name__ == "__main__":
    print(f"TensorFlow {tf.__version__} | tf-keras loaded")
    args = parse_args()

    if not os.path.isdir(args.data_dir):
        print(f"[ERROR] Dataset directory '{args.data_dir}' not found.")
        print("Expected structure:")
        print("  dataset/train/<ClassName>/*.jpg")
        print("  dataset/val/<ClassName>/*.jpg")
        sys.exit(1)

    model, history, val_gen = train(args)
    evaluate(model, val_gen, history)
    print(f"Model saved to: {args.output}")
