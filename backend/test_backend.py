"""
Backend test suite — run from the backend folder with:
    python test_backend.py

Sections 1–2 test the irrigation engine and anomaly detector directly.
Section 3 calls every API endpoint through Flask's test client, so no server
needs to be running. Auth is switched off for the test run; /chat is only
called when API_KEY is set (it uses your Gemini quota).
"""

import io
import os
import sys

PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"
SKIP = "\033[93m SKIP\033[0m"
HEAD = "\033[94m"
RESET = "\033[0m"

passed = 0
failed = 0


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  {PASS}  {label}")
        passed += 1
    else:
        print(f"  {FAIL}  {label}" + (f"  →  {detail}" if detail else ""))
        failed += 1


def section(title):
    print(f"\n{HEAD}{'─'*55}{RESET}")
    print(f"{HEAD}  {title}{RESET}")
    print(f"{HEAD}{'─'*55}{RESET}")


# ══════════════════════════════════════════════════════════════
# 1. IRRIGATION ENGINE (unit tests)
# ══════════════════════════════════════════════════════════════
section("1. Irrigation Engine — irrigation_engine.py")

from irrigation_engine import recommend

# Critical dry soil → must irrigate immediately
r = recommend(soil=15, temp=28, humidity=60, hour=10)
check("Critical dry (15%) → should_irrigate=True",  r["should_irrigate"])
check("Critical dry (15%) → urgency=critical",       r["urgency"] == "critical")
check("Critical dry (15%) → delay_hours=0",          r["delay_hours"] == 0.0)

# Wet soil → no irrigation
r = recommend(soil=85, temp=25, humidity=65, hour=8)
check("Wet soil (85%) → should_irrigate=False",      not r["should_irrigate"])
check("Wet soil (85%) → urgency=none",               r["urgency"] == "none")

# Dry soil during peak heat → delay to evening
r = recommend(soil=30, temp=40, humidity=50, hour=13)
check("Hot day peak hour (13:00) → irrigation delayed", r["delay_hours"] >= 1.0)
check("Hot day → warning about evaporation present",
      any("evaporat" in w.lower() or "heat" in w.lower() for w in r["warnings"]))

# High humidity → extra delay applied (only when ET₀ is unknown)
r_base = recommend(soil=40, temp=28, humidity=50, hour=10)
r_humid = recommend(soil=40, temp=28, humidity=90, hour=10)
check("High humidity (90%) → delay > base delay",    r_humid["delay_hours"] > r_base["delay_hours"])

# Healthy range → no irrigation
r = recommend(soil=60, temp=25, humidity=65, hour=14)
check("Healthy soil (60%) → should_irrigate=False",  not r["should_irrigate"])

# Reasons list must never be empty; inputs are listed
r = recommend(soil=38, temp=35, humidity=55, hour=12)
check("Reasons list is never empty",                  len(r["reasons"]) > 0)
check("inputs_used lists soil moisture",              "soil moisture" in r["inputs_used"])

# Duration must be 0 when no irrigation needed
r = recommend(soil=75, temp=25, humidity=60, hour=8)
check("No irrigation → duration_minutes=0",           r["duration_minutes"] == 0)

# Duration must be positive when irrigation needed
r = recommend(soil=25, temp=25, humidity=60, hour=8)
check("Needs irrigation → duration_minutes > 0",      r["duration_minutes"] > 0)
check("Needs irrigation → water estimate > 0",        r["estimated_water_liters"] > 0)

# Weather forecast inputs
r_dry = recommend(soil=40, temp=30, humidity=60, hour=7)
r_rain = recommend(soil=40, temp=30, humidity=60, hour=7, rain_mm_24h=12)
check("Mild deficit + 12 mm rain → skip irrigation",  r_dry["should_irrigate"] and not r_rain["should_irrigate"])
check("Rain forecast listed in inputs_used",          "rain forecast" in r_rain["inputs_used"])

r = recommend(soil=15, temp=30, humidity=60, hour=7, rain_mm_24h=20)
check("Critical dry + rain → still irrigate, with warning",
      r["should_irrigate"] and any("rain" in w for w in r["warnings"]))

r_plain = recommend(soil=30, temp=30, humidity=60, hour=7)
r_short = recommend(soil=30, temp=30, humidity=60, hour=7, rain_mm_24h=8)
check("Dry soil + rain → shorter run",                r_short["duration_minutes"] < r_plain["duration_minutes"])

r = recommend(soil=42, temp=33, humidity=40, hour=7, et0_mm=7.5)
check("Mild deficit + high ET₀ → urgency raised to high", r["urgency"] == "high")

r_low = recommend(soil=42, temp=24, humidity=70, hour=7, et0_mm=2.0)
r_none = recommend(soil=42, temp=24, humidity=70, hour=7)
check("Mild deficit + low ET₀ → longer delay",       r_low["delay_hours"] > r_none["delay_hours"])

try:
    recommend(soil=140, temp=25, humidity=60)
    check("soil=140 → ValueError", False, "no error raised")
except ValueError:
    check("soil=140 → ValueError", True)


# ══════════════════════════════════════════════════════════════
# 2. ANOMALY DETECTOR (unit tests)
# ══════════════════════════════════════════════════════════════
section("2. Anomaly Detector — anomaly_detector.py")

from anomaly_detector import detect

# Out-of-range reading → flagged as high severity
r = detect({"soil": 150, "temp": 28, "humidity": 60})
check("soil=150 (out of range) → anomaly detected",  r["anomalies_detected"])
check("soil=150 → severity=high",
      any(a["severity"] == "high" for a in r["anomalies"]))
check("soil=150 → sensor_scores['soil']=1.0",        r["sensor_scores"].get("soil") == 1.0)

# Normal reading → no anomaly
r = detect({"soil": 45, "temp": 28, "humidity": 65})
check("Normal reading → no anomaly",                  not r["anomalies_detected"])
check("Normal reading → overall_score=0.0",           r["overall_score"] == 0.0)

# Statistical outlier detected via Z-score
history = [{"soil": 45}, {"soil": 46}, {"soil": 44}, {"soil": 45}, {"soil": 47}]
r_normal = detect({"soil": 46}, history)
r_spike  = detect({"soil": 2},  history)
check("Gradual reading → no Z-score anomaly",         not r_normal["anomalies_detected"])
check("Sudden spike → Z-score anomaly detected",      r_spike["anomalies_detected"],
      f"score={r_spike['overall_score']}")

# Flat history + 1-unit change must not be flagged (minimum spread)
flat = [{"soil": 45, "temp": 28}] * 10
r = detect({"soil": 46, "temp": 28.5}, flat)
check("Flat history + 1-unit change → no anomaly",    not r["anomalies_detected"],
      str(r["anomalies"]))

# Negative temp (below -10) → out of range
r = detect({"soil": 50, "temp": -15, "humidity": 60})
check("temp=-15 (out of range) → anomaly detected",   r["anomalies_detected"])

# Missing keys are gracefully skipped
r = detect({"soil": 50})
check("Missing sensors → no crash, normal result",    not r["anomalies_detected"])


# ══════════════════════════════════════════════════════════════
# 3. API ENDPOINTS (Flask test client, no server needed)
# ══════════════════════════════════════════════════════════════
section("3. API endpoints — app.py")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""  # auth off for tests
os.environ["AUTH_REQUIRED"] = "false"

from PIL import Image

import app as backend

client = backend.app.test_client()

r = client.get("/health")
check("/health → 200",                               r.status_code == 200)

r = client.post("/irrigation/recommend", json={"soil": 30, "temp": 42, "humidity": 55, "hour": 13})
body = r.get_json()
check("/irrigation/recommend → 200",                 r.status_code == 200, body)
check("soil=30 → should_irrigate=True",              body.get("should_irrigate") is True)
check("temp=42 → heat warning",
      any("evaporat" in w.lower() or "heat" in w.lower() for w in body.get("warnings", [])))

r = client.post("/irrigation/recommend", json={"temp": 30, "humidity": 50})
check("/irrigation/recommend without soil → 400",    r.status_code == 400)

r = client.post("/irrigation/recommend", json={"soil": "wet", "temp": 30, "humidity": 50})
check("/irrigation/recommend soil='wet' → 400",      r.status_code == 400)

r = client.post("/anomaly/detect", json={"reading": {"soil": 200, "temp": 28, "humidity": 60}, "history": []})
body = r.get_json()
check("/anomaly/detect → 200",                       r.status_code == 200)
check("soil=200 → anomalies_detected, score 1.0",    body["anomalies_detected"] and body["overall_score"] == 1.0)

r = client.post("/anomaly/detect", json={"reading": "nope"})
check("/anomaly/detect bad body → 400",              r.status_code == 400)

r = client.get("/model/info")
body = r.get_json()
check("/model/info → 11 classes",                    len(body.get("classes", [])) == 11)
check("/model/info names its source",                "source" in body)

buf = io.BytesIO()
Image.new("RGB", (300, 200), (40, 140, 40)).save(buf, format="JPEG")
buf.seek(0)
r = client.post("/predict", data={"image": (buf, "leaf.jpg")}, content_type="multipart/form-data")
body = r.get_json()
check("/predict → 200",                              r.status_code == 200, body)
check("/predict → disease, confidence, top-3, info",
      {"disease", "confidence", "top", "info", "uncertain"} <= set(body or {}))
check("/predict → top-3 confidences add up ≤ 100",   sum(t["confidence"] for t in body["top"]) <= 100.1)

r = client.post("/predict", data={"image": (io.BytesIO(b"not an image"), "x.jpg")},
                content_type="multipart/form-data")
check("/predict non-image → 400",                    r.status_code == 400)

r = client.post("/predict", data={}, content_type="multipart/form-data")
check("/predict without file → 400",                 r.status_code == 400)

r = client.post("/chat", json={"message": ""})
check("/chat empty message → 400 (or 503 without key)", r.status_code in (400, 503))

if backend.chat_client is None:
    print(f"  {SKIP}  /chat live reply (API_KEY not set)")
else:
    r = client.post("/chat", json={"message": "When should I water tomatoes?"})
    body = r.get_json()
    check("/chat → reply received", r.status_code == 200 and len(body.get("reply", "")) > 5, body)


# ══════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════
total = passed + failed
print(f"\n{'═'*55}")
print(f"  Results: {passed}/{total} passed", end="")
if failed == 0:
    print("  \033[92m✓ All tests passed\033[0m")
else:
    print(f"  \033[91m✗ {failed} failed\033[0m")
print(f"{'═'*55}\n")

sys.exit(0 if failed == 0 else 1)
