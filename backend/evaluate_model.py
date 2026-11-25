"""
Describe the current keras_model.h5 and, if you give it labelled photos,
measure its accuracy. Writes model_metrics.json, which app.py reads.

    python evaluate_model.py                       # model details only
    python evaluate_model.py --data_dir test_set   # also measure accuracy

test_set/ needs one sub-folder per class, named with the class number first,
for example:

    test_set/
      00_rice_leaf_blast/      *.jpg
      01_tomato_late_blight/   *.jpg
      ...

The script prints the number for each class. Use photos the model has never
seen, ideally taken in the field, so the accuracy means something.
"""

import argparse
import json
import os
import re

import numpy as np
import tf_keras as keras
from PIL import Image, UnidentifiedImageError

from model_utils import DEFAULT_CLASSES, METRICS_PATH, MODEL_PATH, load_metrics, preprocess_image

IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp")


def describe(model, classes: list[str], previous: dict) -> dict:
    retrained = previous.get("source", "").startswith("train_model.py")
    return {
        "source": previous["source"] if retrained else "Google Teachable Machine (image project, Keras export)",
        "architecture": previous.get("architecture") if retrained else (
            "MobileNetV2 feature extractor (width 0.35, ImageNet weights) + "
            "Dense(100) + Dense(softmax), the standard Teachable Machine export"
        ),
        "task": "Multi-class Plant Disease Classification",
        "num_classes": len(classes),
        "classes": classes,
        "input_shape": list(model.input_shape[1:]),
        "input_scaling": "[-1, 1] (pixel / 127.5 - 1), centre-cropped to a square",
        "total_parameters": int(model.count_params()),
        "evaluation": None,
        "note": (
            "No held-out accuracy has been recorded for this model yet. Measure it with "
            "`python evaluate_model.py --data_dir <labelled photos>` or retrain with "
            "train_model.py, which records accuracy, macro F1 and per-class scores."
        ),
    }


def evaluate(model, classes: list[str], data_dir: str) -> dict:
    y_true, y_pred = [], []
    for folder in sorted(os.listdir(data_dir)):
        path = os.path.join(data_dir, folder)
        match = re.match(r"^(\d+)", folder)
        if not os.path.isdir(path) or not match:
            continue
        label = int(match.group(1))
        if label >= len(classes):
            raise SystemExit(f"Folder '{folder}': class number {label} does not exist")
        for name in sorted(os.listdir(path)):
            if not name.lower().endswith(IMAGE_EXT):
                continue
            try:
                img = Image.open(os.path.join(path, name))
            except UnidentifiedImageError:
                print(f"  skipped unreadable file {folder}/{name}")
                continue
            probs = model.predict(preprocess_image(img), verbose=0)[0]
            y_true.append(label)
            y_pred.append(int(np.argmax(probs)))

    if not y_true:
        raise SystemExit(f"No labelled images found in {data_dir}")

    y_true_arr, y_pred_arr = np.array(y_true), np.array(y_pred)
    per_class = {}
    for i, cls in enumerate(classes):
        support = int((y_true_arr == i).sum())
        if support == 0:
            continue
        tp = int(((y_true_arr == i) & (y_pred_arr == i)).sum())
        predicted = int((y_pred_arr == i).sum())
        per_class[cls] = {
            "support": support,
            "recall": round(tp / support, 4),
            "precision": round(tp / predicted, 4) if predicted else 0.0,
        }

    return {
        "dataset": os.path.basename(os.path.normpath(data_dir)),
        "num_images": len(y_true),
        "accuracy": round(float((y_true_arr == y_pred_arr).mean()), 4),
        "per_class": per_class,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--data_dir", help="Folder of labelled test photos (see above)")
    args = parser.parse_args()

    model = keras.models.load_model(MODEL_PATH, compile=False)
    previous = load_metrics()
    classes = previous.get("classes") or DEFAULT_CLASSES

    print("Class numbers for test folders:")
    for i, cls in enumerate(classes):
        print(f"  {i:02d}  {cls}")

    metrics = describe(model, classes, previous)
    if args.data_dir:
        metrics["evaluation"] = evaluate(model, classes, args.data_dir)
        metrics["note"] = (
            "Accuracy measured with evaluate_model.py on the photos in "
            f"'{metrics['evaluation']['dataset']}'."
        )
        print(f"\nAccuracy: {metrics['evaluation']['accuracy']:.4f} "
              f"on {metrics['evaluation']['num_images']} images")

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print(f"\nSaved: {os.path.basename(METRICS_PATH)}")


if __name__ == "__main__":
    main()
