"""
Backend test suite — run with:
    python test_backend.py

Tests every new component and live API endpoint.
"""

import json
import sys
import urllib.request
import urllib.error

PASS = "\033[92m PASS\033[0m"
FAIL = "\033[91m FAIL\033[0m"
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

def post(url, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())

def get(url):
    with urllib.request.urlopen(url, timeout=10) as r:
        return json.loads(r.read())


# ══════════════════════════════════════════════════════════════
# 1. IRRIGATION ENGINE (unit tests, no server needed)
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
check("Hot day peak hour (13:00) → irrigate delayed", r["delay_hours"] >= 1.0)
check("Hot day → warning about evaporation present",
      any("evaporation" in w.lower() or "heat" in w.lower() for w in r["warnings"]))

# High humidity → extra delay applied
r_base = recommend(soil=40, temp=28, humidity=50, hour=10)
r_humid = recommend(soil=40, temp=28, humidity=90, hour=10)
check("High humidity (90%) → delay >= base delay",   r_humid["delay_hours"] >= r_base["delay_hours"])

# Optimal range → no irrigation
r = recommend(soil=60, temp=25, humidity=65, hour=14)
check("Optimal soil (60%) → should_irrigate=False",  not r["should_irrigate"])

# Confidence must be between 0.5 and 1.0
r = recommend(soil=38, temp=35, humidity=55, hour=12)
check("Confidence in range [0.5, 1.0]",              0.5 <= r["confidence"] <= 1.0)

# Reasons list must never be empty
check("Reasons list is never empty",                  len(r["reasons"]) > 0)

# Duration must be 0 when no irrigation needed
r = recommend(soil=75, temp=25, humidity=60, hour=8)
check("No irrigation → duration_minutes=0",           r["duration_minutes"] == 0)

# Duration must be positive when irrigation needed
r = recommend(soil=25, temp=25, humidity=60, hour=8)
check("Needs irrigation → duration_minutes > 0",      r["duration_minutes"] > 0)
check("Needs irrigation → water estimate > 0",        r["estimated_water_liters"] > 0)


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

# Negative temp (below -10) → out of range
r = detect({"soil": 50, "temp": -15, "humidity": 60})
check("temp=-15 (out of range) → anomaly detected",   r["anomalies_detected"])

# Missing keys are gracefully skipped
r = detect({"soil": 50})
check("Missing sensors → no crash, normal result",    not r["anomalies_detected"])


# ══════════════════════════════════════════════════════════════
# 3. LIVE API ENDPOINTS (requires backend running on :5000)
# ══════════════════════════════════════════════════════════════
section("3. Live API — http://localhost:5000")

BASE = "http://localhost:5000"

try:
    # /irrigation/recommend — temp=42 triggers heat warning (threshold is >38)
    r = post(f"{BASE}/irrigation/recommend", {"soil": 30, "temp": 42, "humidity": 55})
    check("/irrigation/recommend → 200 OK",            True)
    check("Response has 'should_irrigate' key",        "should_irrigate" in r)
    check("Response has 'urgency' key",                "urgency" in r)
    check("Response has 'reasons' list",               isinstance(r.get("reasons"), list))
    check("Response has 'warnings' list",              isinstance(r.get("warnings"), list))
    check("soil=30 → should_irrigate=True",            r["should_irrigate"])
    check("soil=30, temp=42 → heat evaporation warning",
          any("evaporation" in w.lower() or "heat" in w.lower()
              for w in r.get("warnings", [])))

    # /anomaly/detect
    r = post(f"{BASE}/anomaly/detect",
             {"reading": {"soil": 200, "temp": 28, "humidity": 60}, "history": []})
    check("/anomaly/detect → 200 OK",                  True)
    check("soil=200 → anomalies_detected=True",        r["anomalies_detected"])
    check("overall_score = 1.0",                       r["overall_score"] == 1.0)

    # /model/info
    r = get(f"{BASE}/model/info")
    check("/model/info → 200 OK",                      True)
    check("model/info has 'architecture' key",         "architecture" in r)
    check("model/info has 'classes' list of 11",       len(r.get("classes", [])) == 11)

    # /chat — tested separately so a key error doesn't block other checks
    try:
        r = post(f"{BASE}/chat", {"message": "hello"})
        check("/chat → reply received",                "reply" in r and len(r["reply"]) > 5)
    except Exception as e:
        check("/chat → reply received", False, f"API error (check API_KEY in .env): {e}")

except urllib.error.URLError as e:
    print(f"\n  WARNING  Backend not reachable at {BASE}: {e.reason}")
    print("     Start it with: python app.py")
    failed += 4


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
