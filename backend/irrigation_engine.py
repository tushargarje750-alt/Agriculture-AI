"""
Irrigation Scheduling Engine
============================
Rule-based and explainable: every recommendation lists the reasons behind it,
so the farmer can see why the system says what it says.

Inputs, in priority order:
  1. Soil moisture from the field sensor (the primary signal).
  2. Weather forecast, when the app sends it (from Open-Meteo):
       - ET₀, today's reference evapotranspiration (FAO-56 Penman-Monteith,
         mm/day): how fast the crop is losing water today.
       - Rain forecast for the next 24 hours: rain can replace a light irrigation.
  3. Air temperature and humidity from the sensor.
  4. Time of day: early morning loses the least water to evaporation.

The thresholds below are starting values. Calibrate them for your soil, crop
and sensor: capacitive soil sensors read differently in clay and in sand.
"""

from datetime import datetime, timezone
from typing import Optional

# Soil moisture thresholds (%)
THRESHOLDS = {
    "critical_dry": 20,  # irrigate immediately regardless of time
    "dry": 35,           # irrigate within 1–2 hours
    "watch": 45,         # mild deficit; irrigate within a few hours
    "optimal_high": 70,  # refill target
    "wet": 80,           # soil saturated; skip
}

# Weather thresholds
RAIN_SKIP_MM = 5.0   # forecast rain in the next 24 h that can cover a mild deficit
ET0_HIGH_MM = 6.0    # mm/day: high evaporative demand, soil dries quickly
ET0_LOW_MM = 3.0     # mm/day: low evaporative demand

# Run-time estimate
FLOW_RATE_LPM = 12.5           # pump flow in litres per minute (matches IrrigationPage)
MINUTES_PER_PCT_DEFICIT = 1.3  # run time per % of moisture below the target; calibrate per field
MIN_RUN_MINUTES = 15


def recommend(
    soil: float,
    temp: float,
    humidity: float,
    hour: Optional[int] = None,
    et0_mm: Optional[float] = None,
    rain_mm_24h: Optional[float] = None,
) -> dict:
    """
    Return an irrigation recommendation.

    Parameters
    ----------
    soil        : soil moisture % (0–100)
    temp        : air temperature °C
    humidity    : relative humidity % (0–100)
    hour        : local hour 0–23 at the farm (defaults to the server's local time)
    et0_mm      : today's reference evapotranspiration in mm (optional)
    rain_mm_24h : forecast rain over the next 24 hours in mm (optional)

    Returns
    -------
    dict with keys:
        should_irrigate         bool
        urgency                 "none" | "low" | "medium" | "high" | "critical"
        delay_hours             float — hours to wait before irrigating (or before re-checking)
        duration_minutes        int   — recommended run time
        estimated_water_liters  float
        reasons                 list[str] — why this decision was made
        warnings                list[str] — cautions for the farmer
        inputs_used             list[str] — which signals the decision was based on
        computed_at             ISO-8601 UTC timestamp
    """
    if not 0 <= soil <= 100:
        raise ValueError("'soil' must be between 0 and 100 (check the sensor)")
    if not 0 <= humidity <= 100:
        raise ValueError("'humidity' must be between 0 and 100 (check the sensor)")
    if hour is None:
        hour = datetime.now().hour

    reasons: list[str] = []
    warnings: list[str] = []
    inputs_used = ["soil moisture", "air temperature", "humidity", "time of day"]
    shorter_run = False

    # ── 1. Core moisture decision ───────────────────────────────────────────
    if soil <= THRESHOLDS["critical_dry"]:
        should, urgency, delay = True, "critical", 0.0
        reasons.append(
            f"Soil moisture critically low at {soil:.0f}% "
            f"(critical threshold: {THRESHOLDS['critical_dry']}%) — irrigate immediately"
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
            f"Soil moisture at {soil:.0f}% — mild deficit, irrigate within 3 hours"
        )
    elif soil >= THRESHOLDS["wet"]:
        should, urgency, delay = False, "none", 24.0
        reasons.append(
            f"Soil moisture at {soil:.0f}% — soil is wet enough, "
            "no irrigation needed for at least 24 hours"
        )
    else:
        should, urgency, delay = False, "low", 6.0
        reasons.append(
            f"Soil moisture at {soil:.0f}% — within the healthy range "
            f"({THRESHOLDS['watch']}–{THRESHOLDS['wet']}%), no action needed"
        )

    # ── 2. Evapotranspiration (how fast the crop is losing water today) ────
    if et0_mm is not None:
        inputs_used.append("evapotranspiration (ET₀)")
        if et0_mm >= ET0_HIGH_MM:
            if should and urgency == "medium":
                urgency, delay = "high", 1.0
                reasons.append(
                    f"High evaporative demand today (ET₀ {et0_mm:.1f} mm/day) — "
                    "the soil will dry quickly, so irrigate sooner"
                )
            elif not should and soil < THRESHOLDS["optimal_high"]:
                delay = min(delay, 3.0)
                reasons.append(
                    f"High evaporative demand today (ET₀ {et0_mm:.1f} mm/day) — "
                    "check moisture again in 3 hours"
                )
        elif et0_mm <= ET0_LOW_MM and should and urgency == "medium":
            delay += 3.0
            reasons.append(
                f"Low evaporative demand today (ET₀ {et0_mm:.1f} mm/day) — "
                "the crop is using little water, so irrigation can wait a few hours"
            )

    # ── 3. Rain forecast ────────────────────────────────────────────────────
    if rain_mm_24h is not None:
        inputs_used.append("rain forecast")
        if should and rain_mm_24h >= RAIN_SKIP_MM:
            if urgency == "critical":
                warnings.append(
                    f"{rain_mm_24h:.0f} mm of rain is forecast in the next 24 hours, "
                    "but the soil is too dry to wait for it"
                )
            elif urgency == "high":
                shorter_run = True
                reasons.append(
                    f"{rain_mm_24h:.0f} mm of rain forecast in the next 24 hours — "
                    "run a shorter cycle and let the rain do the rest"
                )
            else:
                should, urgency, delay = False, "low", 12.0
                reasons.append(
                    f"{rain_mm_24h:.0f} mm of rain forecast in the next 24 hours — "
                    "enough for a mild deficit; skip irrigation and re-check after the rain"
                )

    # ── 4. Temperature ──────────────────────────────────────────────────────
    if temp > 38:
        warnings.append(
            f"High temperature ({temp:.0f}°C) — water applied in the midday heat "
            "evaporates faster; prefer early morning or evening"
        )
        if 11 <= hour <= 16 and should and urgency != "critical":
            shift = float(17 - hour)
            delay = max(delay, shift)
            reasons.append(
                f"Irrigation shifted by {shift:.0f}h to avoid the peak evaporation window (11 AM–4 PM)"
            )
    elif temp < 10:
        warnings.append(
            f"Low temperature ({temp:.0f}°C) — cold soil reduces water uptake; "
            "consider waiting until mid-morning"
        )

    # ── 5. Humidity (only when ET₀ is unknown; ET₀ already accounts for it) ─
    if et0_mm is None and humidity > 85 and should and urgency not in ("critical", "high"):
        delay += 2.0
        reasons.append(
            f"High humidity ({humidity:.0f}%) slows crop water loss — "
            "irrigation delayed by 2 more hours"
        )

    # ── 6. Time of day ──────────────────────────────────────────────────────
    if should and urgency not in ("critical", "high"):
        if 5 <= hour <= 9:
            reasons.append(
                "It is within the best irrigation window (5–9 AM): "
                "less evaporation, better root uptake"
            )
        elif 11 <= hour <= 16 and delay < 2:
            delay = max(delay, float(17 - hour))
            warnings.append("Deferred to the evening to avoid midday evaporation losses")

    # ── 7. Run time and water estimate ──────────────────────────────────────
    if should:
        deficit_pct = max(0.0, float(THRESHOLDS["optimal_high"]) - soil)
        duration = max(MIN_RUN_MINUTES, int(deficit_pct * MINUTES_PER_PCT_DEFICIT))
        if shorter_run:
            duration = max(MIN_RUN_MINUTES, duration // 2)
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
        "inputs_used": inputs_used,
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }
