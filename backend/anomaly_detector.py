"""
IoT Sensor Anomaly Detector
============================
Uses two complementary checks:
  1. Hard range validation — physical impossibility (e.g. soil moisture > 100%)
  2. Rolling Z-score — statistical deviation from recent sensor history

A Z-score > 3 (i.e. > 3 standard deviations from the rolling mean) flags
a reading as anomalous. This catches sensor drift, wiring faults, and
sudden environmental shocks.

Severity scale:
  low    — Z < 2.5  (monitor)
  medium — Z 2.5–4  (investigate)
  high   — Z > 4 or out-of-range (alert immediately)
"""

from typing import Optional

# Physical valid ranges for each sensor channel
VALID_RANGES: dict[str, tuple[float, float]] = {
    "soil":     (0.0,  100.0),
    "temp":     (-10.0, 60.0),
    "humidity": (0.0,  100.0),
    "gas":      (0.0, 5000.0),
}

Z_LOW    = 2.5
Z_MEDIUM = 4.0


def detect(
    reading: dict,
    history: Optional[list[dict]] = None,
) -> dict:
    """
    Analyse a single sensor reading for anomalies.

    Parameters
    ----------
    reading : dict  — current sensor values, e.g. {"soil": 42, "temp": 28, ...}
    history : list  — list of recent reading dicts (oldest first).
                      At least 3 readings required for Z-score check.

    Returns
    -------
    dict with keys:
        anomalies_detected  bool
        anomaly_count       int
        overall_score       float  (0 = normal, 1 = severe anomaly)
        anomalies           list   — details per flagged sensor
        sensor_scores       dict   — per-sensor anomaly score (0–1)
    """
    anomalies: list[dict] = []
    scores: dict[str, float] = {}

    for sensor, (lo, hi) in VALID_RANGES.items():
        val = reading.get(sensor)
        if val is None:
            continue

        # ── Hard range check ────────────────────────────────────────────────
        if not (lo <= float(val) <= hi):
            anomalies.append({
                "sensor": sensor,
                "value": val,
                "reason": f"Reading {val} outside physical range [{lo}, {hi}]",
                "severity": "high",
                "z_score": None,
            })
            scores[sensor] = 1.0
            continue

        # ── Rolling Z-score check ───────────────────────────────────────────
        if history and len(history) >= 3:
            past = [float(h[sensor]) for h in history if sensor in h]
            if len(past) >= 3:
                mean = sum(past) / len(past)
                variance = sum((v - mean) ** 2 for v in past) / len(past)
                std = variance ** 0.5

                z = abs(float(val) - mean) / (std + 1e-9)
                scores[sensor] = round(min(z / Z_MEDIUM, 1.0), 3)

                if z > Z_LOW:
                    severity = "high" if z > Z_MEDIUM else "medium"
                    anomalies.append({
                        "sensor": sensor,
                        "value": val,
                        "reason": (
                            f"Statistical outlier — Z-score {z:.2f} "
                            f"(mean={mean:.1f}, std={std:.1f})"
                        ),
                        "severity": severity,
                        "z_score": round(z, 2),
                    })
                continue

        scores[sensor] = 0.0

    overall = max(scores.values()) if scores else 0.0

    return {
        "anomalies_detected": len(anomalies) > 0,
        "anomaly_count": len(anomalies),
        "overall_score": round(overall, 3),
        "anomalies": anomalies,
        "sensor_scores": scores,
    }
