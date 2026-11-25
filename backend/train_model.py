"""
Plant Disease Detection — Model Training Pipeline
==================================================
Architecture : MobileNetV2 (Transfer Learning, ImageNet weights)
Task         : Multi-class image classification
Dataset      : Your own labelled photos, one folder per class:
                 dataset/
                   train/
                     Rice_Leaf_Blast/        *.jpg
                     Tomato_Late_Blight/     *.jpg
                     ...
                   val/
                     Rice_Leaf_Blast/        *.jpg
                     ...
               Folder names become the class labels (underscores -> spaces).
               Use field photos, not only plain-background lab photos, or the
               model will not work on real farm images.
Training     : Two-phase — (1) train classifier head, (2) fine-tune top layers
Outputs      : keras_model.h5, training_curves.png, confusion_matrix.png, model_metrics.json

The shipped keras_model.h5 was NOT produced by this script (it is a Teachable
Machine export). Running this script replaces it with a model you trained and
records measured accuracy in model_metrics.json.

Usage:
    python train_model.py
    python train_model.py --epochs 10 --finetune_epochs 15 --batch_size 64 --data_dir my_dataset
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
from tf_keras.applications.mobilenet_v2 import preprocess_input
from tf_keras.layers import Dense, Dropout, GlobalAveragePooling2D, Input
from tf_keras.models import Model
from tf_keras.preprocessing.image import ImageDataGenerator

# ── Constants ──────────────────────────────────────────────────────────────────

IMG_SIZE = (224, 224)
FINE_TUNE_LAYERS = 30  # top layers of the base unfrozen in phase 2


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
    # preprocess_input scales pixels to [-1, 1], the range MobileNetV2's
    # ImageNet weights were trained on. app.py uses the same scaling.
    train_aug = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )
    val_aug = ImageDataGenerator(preprocessing_function=preprocess_input)

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

def build_model(learning_rate: float, num_classes: int) -> tuple[Model, Model]:
    """
    MobileNetV2 with a custom classification head. Returns (model, base).

    MobileNetV2 was chosen because:
      - Pre-trained on ImageNet (1.4M images) — strong feature extractor
      - Lightweight (about 2.3M parameters without the top) — deployable on edge devices
      - Depthwise-separable convolutions — fast inference on Raspberry Pi / Jetson

    Head architecture:
      GlobalAveragePooling → Dense(256, ReLU) → Dropout(0.4) → Dense(num_classes, Softmax)

    The base is called with training=False so its BatchNorm layers stay in
    inference mode during fine-tuning, as the Keras transfer-learning guide advises.
    """
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # freeze during phase 1

    inputs = Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.4)(x)
    out = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=inputs, outputs=out)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model, base


def class_names(gen) -> list[str]:
    """Class labels in the model's output order (flow_from_directory sorts folders)."""
    by_index = sorted(gen.class_indices.items(), key=lambda kv: kv[1])
    return [folder.replace("_", " ") for folder, _ in by_index]


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


def train(args) -> tuple[Model, dict, object, list[str]]:
    """
    Two-phase transfer learning:

    Phase 1 — classifier warmup (--epochs, default 10, base frozen)
        Only the new head learns. This prevents the pretrained weights
        from being corrupted by large initial gradients.

    Phase 2 — fine-tuning (--finetune_epochs, default 15, top 30 base layers unfrozen)
        Low LR (÷10) so pretrained features are refined rather than destroyed.
    """
    train_gen, val_gen = build_generators(args.data_dir, args.batch_size)
    if train_gen.class_indices != val_gen.class_indices:
        sys.exit("[ERROR] train/ and val/ must contain the same class folders.")
    names = class_names(train_gen)

    model, base = build_model(args.lr, len(names))
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

    print(f"\n─── Phase 2: Fine-tuning top {FINE_TUNE_LAYERS} base layers ───")
    base.trainable = True
    for layer in base.layers[:-FINE_TUNE_LAYERS]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(args.lr / 10),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    h2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=args.finetune_epochs,
        callbacks=callbacks,
        verbose=1,
    )

    # Merge histories for plotting
    history = {}
    for key in ("accuracy", "val_accuracy", "loss", "val_loss"):
        history[key] = h1.history.get(key, []) + h2.history.get(key, [])

    # Evaluate the checkpoint that was actually saved (best val_accuracy).
    best = keras.models.load_model(args.output)
    return best, history, val_gen, names


# ── Evaluation & Plots ────────────────────────────────────────────────────────

def evaluate(model: Model, val_gen, history: dict, names: list[str]):
    """Generate classification report, confusion matrix, and training curves."""

    val_gen.reset()
    y_pred = np.argmax(model.predict(val_gen, verbose=0), axis=1)
    y_true = val_gen.classes

    report = classification_report(
        y_true, y_pred, labels=list(range(len(names))), target_names=names,
        output_dict=True, zero_division=0,
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
    short_names = [c.split("(")[0].strip() for c in names]
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
        "source": "train_model.py (MobileNetV2 transfer learning, ImageNet weights)",
        "architecture": "MobileNetV2 + GlobalAveragePooling + Dense(256) + Dropout(0.4) + Dense(softmax)",
        "task": "Multi-class Plant Disease Classification",
        "num_classes": len(names),
        "classes": names,
        "input_shape": [224, 224, 3],
        "input_scaling": "[-1, 1] (pixel / 127.5 - 1)",
        "evaluation": {
            "dataset": "validation split (val/ folder)",
            "num_images": int(len(y_true)),
            "accuracy": round(report["accuracy"], 4),
            "macro_precision": round(report["macro avg"]["precision"], 4),
            "macro_recall": round(report["macro avg"]["recall"], 4),
            "macro_f1": round(report["macro avg"]["f1-score"], 4),
        },
        "epochs_trained": len(history["accuracy"]),
        "per_class": {
            cls: {
                "precision": round(report[cls]["precision"], 4),
                "recall": round(report[cls]["recall"], 4),
                "f1_score": round(report[cls]["f1-score"], 4),
                "support": int(report[cls]["support"]),
            }
            for cls in names
            if cls in report
        },
        "note": (
            "Measured on the validation folder only. Accuracy on real field photos "
            "will be lower if the training photos were taken in a lab or on plain backgrounds."
        ),
    }

    with open("model_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print("Saved: model_metrics.json")

    ev = metrics["evaluation"]
    print(f"\n{'─'*50}")
    print(f"  Val Accuracy  : {ev['accuracy']:.4f}  ({ev['num_images']} images)")
    print(f"  Macro F1      : {ev['macro_f1']:.4f}")
    print(f"{'─'*50}\n")

    return metrics


# ── Entry Point ───────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="Train plant disease detection model")
    p.add_argument("--data_dir", default="dataset", help="Root directory with train/val folders")
    p.add_argument("--epochs", type=int, default=10, help="Phase 1 (head only) epochs")
    p.add_argument("--finetune_epochs", type=int, default=15, help="Phase 2 (fine-tuning) epochs")
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

    model, history, val_gen, names = train(args)
    evaluate(model, val_gen, history, names)
    print(f"Model saved to: {args.output}")
