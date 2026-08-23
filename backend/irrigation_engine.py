"""
Smart Irrigation Scheduling Engine
===================================
Combines soil moisture, temperature, humidity, and time-of-day rules
to produce an explainable irrigation recommendation.

Decision logic (in priority order):
  1. Soil moisture thresholds (primary signal)
  2. Temperature — avoid peak heat (11 AM – 4 PM) to cut evaporation loss
  3. Humidity — high ambient humidity reduces crop water demand
  4. Time-of-day preference — early morning (5–9 AM) is most efficient

Each recommendation includes human-readable `reasons` and `warnings`
so farmers understand *why* the system is making a suggestion.
"""

from datetime import datetime, timezone
from typing import Optional


# Soil moisture thresholds (%)
THRESHOLDS = {
    "critical_dry": 20,  # irrigate immediately regardless of time
    "dry": 35,           # irrigate within 1–2 hours
    "watch": 45,         # monitor; mild deficit
    "optimal_high": 70,  # no irrigation needed
    "wet": 80,           # soil saturated; skip
}

FLOW_RATE_LPM = 12.5  # litres per minute (matches IrrigationPage constant)


def recommend(
    soil: float,
    temp: float,
    humidity: float,
    hour: Optional[int] = None,
) -> dict:
    """
    Return an irrigation recommendation dict.

    Parameters
    ----------
    soil     : Soil moisture percentage (0–100)
    temp     : Air temperature in °C
    humidity : Relative humidity percentage (0–100)
    hour     : Hour of day 0–23 (defaults to current UTC hour)

    Returns
    -------
    dict with keys:
        should_irrigate      bool
        urgency              "none" | "low" | "medium" | "high" | "critical"
        delay_hours          float  — how many hours to wait before irrigating
        duration_minutes     int    — recommended run time
        estimated_water_liters float
        reasons              list[str]  — why this decision was made
        warnings             list[str]  — cautions for the farmer
        confidence           float (0–1)
        computed_at          ISO-8601 UTC timestamp
    """
    if hour is None:
        hour = datetime.now(timezone.utc).hour

    reasons: list[str] = []
    warnings: list[str] = []
    confidence = 0.92

    # ── 1. Core moisture decision ───────────────────────────────────────────
    if soil <= THRESHOLDS["critical_dry"]:
        should, urgency, delay = True, "critical", 0.0
        reasons.append(
            f"Soil moisture critically low at {soil:.0f}% "
            f"(critical threshold: {THRESHOLDS['critical_dry']}%) — immediate irrigation required"
        )
    elif soil <= THRESHOLDS["dry"]:
        should, urgency, delay = True, "high", 1.0
        reasons.append(
            f"Soil moisture low at {soil:.0f}% "
            f"(dry threshold: {THRESHOLDS['dry']}%) — irrigate within 1–2 hours"
        )
    elif soil <= THRESHOLDS["watch"]:
        should, urgency, delay = True, "medium", 3.0
        reasons.append(
            f"Soil moisture at {soil:.0f}% — mild deficit detected, "
            f"monitor and irrigate within {3} hours"
        )
    elif soil >= THRESHOLDS["wet"]:
        should, urgency, delay = False, "none", 24.0
        reasons.append(
            f"Soil moisture at {soil:.0f}% — soil is sufficiently wet, "
            "irrigation not needed for at least 24 hours"
        )
    else:
        should, urgency, delay = False, "low", 6.0
        reasons.append(
            f"Soil moisture at {soil:.0f}% — within optimal range "
            f"({THRESHOLDS['watch']}–{THRESHOLDS['optimal_high']}%), no action needed"
        )

    # ── 2. Temperature adjustment ───────────────────────────────────────────
    if temp > 38:
        warnings.append(
            f"High temperature ({temp:.0f}°C) — irrigating during peak heat increases "
            "evaporation by up to 30%; shift to early morning or evening"
        )
        if 11 <= hour <= 16 and should and urgency not in ("critical",):
            shift = float(17 - hour)
            delay = max(delay, shift)
            reasons.append(
                f"Irrigation shifted by {shift:.0f}h to avoid peak evaporation window (11 AM–4 PM)"
            )
        confidence -= 0.04

    elif temp < 10:
        warnings.append(
            f"Low temperature ({temp:.0f}°C) — cold soil reduces water uptake efficiency; "
            "consider delaying until mid-morning"
        )
        confidence -= 0.04

    # ── 3. Humidity adjustment ──────────────────────────────────────────────
    if humidity > 85 and should:
        extra = 2.0
        delay = max(delay, delay + extra)
        reasons.append(
            f"High ambient humidity ({humidity:.0f}%) reduces crop evapotranspiration — "
            f"irrigation delayed by {extra:.0f} additional hours"
        )
        confidence -= 0.03

    # ── 4. Time-of-day preference ───────────────────────────────────────────
    if should and urgency not in ("critical", "high"):
        if 5 <= hour <= 9:
            reasons.append(
                "Current time is within the optimal irrigation window (5–9 AM) — "
                "lower evaporation, better root absorption"
            )
        elif 11 <= hour <= 16 and delay < 2:
            delay = max(delay, float(17 - hour))
            warnings.append(
                "Recommendation deferred to evening to avoid mid-day heat losses"
            )

    # ── 5. Duration & water estimate ────────────────────────────────────────
    if should:
        deficit_pct = max(0.0, float(THRESHOLDS["optimal_high"]) - soil)
        duration = max(15, int(deficit_pct * 1.3))
        water = round(duration * FLOW_RATE_LPM, 1)
    else:
        duration = 0
        water = 0.0

    return {
        "should_irrigate": should,
        "urgency": urgency,
        "delay_hours": round(delay, 1),
        "duration_minutes": duration,
        "estimated_water_liters": water,
        "reasons": reasons,
        "warnings": warnings,
        "confidence": round(max(0.5, confidence), 2),
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }
