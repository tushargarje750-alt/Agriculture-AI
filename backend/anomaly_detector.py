"""
IoT Sensor Anomaly Detector
============================
Uses two complementary checks:
  1. Hard range validation — physical impossibility (e.g. soil moisture > 100%)
  2. Rolling Z-score — statistical deviation from recent sensor history

A Z-score above 2.5 (more than 2.5 standard deviations from the recent mean)
flags a reading as anomalous. This catches sensor drift, wiring faults, and
sudden environmental shocks.

Severity scale:
  none   — Z ≤ 2.5  (normal)
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

# Smallest spread assumed for each sensor. Without it, a sensor that has sent
# the same value for a while (std = 0) would flag a 1-unit change as a huge
# outlier. Roughly the sensor's normal jitter.
MIN_STD: dict[str, float] = {
    "soil":     1.0,   # %
    "temp":     0.5,   # °C
    "humidity": 1.0,   # %
    "gas":      10.0,  # raw ADC units
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
            past = [
                float(h[sensor]) for h in history
                if isinstance(h, dict) and h.get(sensor) is not None
            ]
            if len(past) >= 3:
                mean = sum(past) / len(past)
                variance = sum((v - mean) ** 2 for v in past) / len(past)
                std = max(variance ** 0.5, MIN_STD[sensor])

                z = abs(float(val) - mean) / std
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
