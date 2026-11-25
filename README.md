# AgriIrrigation — Smart Farming & Irrigation Platform

A web app that connects a low-cost **ESP32 field controller** to a dashboard, so a farmer can
see live soil and weather conditions, get an **explainable irrigation recommendation**, switch
the pump on or off, check a **leaf photo for common crop diseases**, and ask a **farming
chatbot** in Hinglish.

It is a student project, built and tested with one field controller. It has not been run on
working farms, so it makes no claims about water saved or yield gained.

---

## Contents

- [What works today](#what-works-today)
- [How it works](#how-it-works)
  - [Irrigation recommendation](#irrigation-recommendation)
  - [Sensor anomaly detection](#sensor-anomaly-detection)
  - [Plant disease detection](#plant-disease-detection)
  - [Chatbot](#chatbot)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API](#api)
- [Firebase data layout (ESP32)](#firebase-data-layout-esp32)
- [Tests](#tests)
- [Known limitations](#known-limitations)
- [License](#license)

---

## What works today

| Feature | Status |
|---|---|
| Live soil moisture, temperature, humidity and gas readings from the ESP32 (Firebase Realtime Database) | Working |
| Manual pump start/stop and hand-over to the ESP32's auto mode | Working |
| Irrigation recommendation from soil moisture + Open-Meteo rain forecast and ET₀ | Working |
| Sensor health check (range check + rolling Z-score) on the dashboard | Working |
| 7-day weather forecast for the farm's location (Open-Meteo, no API key) | Working |
| Leaf-photo disease classifier (11 diseases) with cause and general advice | Working, **accuracy not yet measured** (see below) |
| Hinglish farming chatbot (Gemini 2.5 Flash) | Working (needs your own Gemini API key) |
| Login, profile and farm settings (Firebase Auth + Firestore) | Working |
| Optional ESP32-CAM live view on the dashboard | Working on the same Wi-Fi network |
| Marketplace | Static reference content: suggested products and usage steps per disease, in 7 languages |
| Devices page and notifications panel | **Sample data**, labelled as such in the app |

---

## How it works

```
ESP32 sensors ──► Firebase Realtime DB ──► React app ──► Flask API ──► irrigation engine
     ▲                                        │   │                    anomaly detector
     └──────────── pump commands ◄────────────┘   │                    disease model (Keras)
                                                  └──► Open-Meteo      Gemini chatbot
                                                       (forecast, ET₀)
```

### Irrigation recommendation

`backend/irrigation_engine.py` is a rule-based engine. Every recommendation lists the reasons
behind it and the inputs it used, so the farmer can see *why*.

| Input | Rule |
|---|---|
| Soil moisture (sensor) | ≤ 20 % critical, irrigate now · ≤ 35 % dry, within 1–2 h · ≤ 45 % mild deficit, within 3 h · ≥ 80 % wet, skip 24 h |
| ET₀, today's reference evapotranspiration (Open-Meteo, FAO-56 Penman-Monteith) | ≥ 6 mm/day: soil dries fast, a mild deficit becomes urgent · ≤ 3 mm/day: a mild deficit can wait 3 more hours |
| Rain forecast, next 24 h (Open-Meteo) | ≥ 5 mm: skip irrigation for a mild deficit, run a shorter cycle when dry, still irrigate when critical |
| Air temperature (sensor) | > 38 °C: move irrigation out of the 11 AM–4 PM evaporation window |
| Humidity (sensor) | > 85 %: delay 2 h (only when ET₀ is not available, since ET₀ already accounts for humidity) |
| Time of day (farm's local hour) | Prefer 5–9 AM; defer to evening when it is midday |

Run time is estimated from the moisture deficit below the 70 % refill target
(`MINUTES_PER_PCT_DEFICIT`) and the pump's flow rate (12.5 L/min). The thresholds are starting
values: calibrate them for your soil, crop and sensor.

### Sensor anomaly detection

`backend/anomaly_detector.py` checks each new reading in two ways:

1. **Range check**: physically impossible values (e.g. soil moisture > 100 %) are flagged *high*.
2. **Rolling Z-score** against the last 30 readings: Z > 2.5 is *medium*, Z > 4 is *high*.
   A minimum spread per sensor (e.g. 1 % for soil moisture) stops a sensor that has sent the
   same value for a while from flagging a 1-unit change.

The dashboard's **Sensor Health** card shows the result for every reading.

### Plant disease detection

- **Model**: a [Google Teachable Machine](https://teachablemachine.withgoogle.com/) image model
  exported to Keras: MobileNetV2 feature extractor (width 0.35, ImageNet weights) + Dense(100) +
  Dense(11, softmax), about 540 k parameters.
- **Input**: the photo is centre-cropped, resized to 224 × 224 and scaled to [-1, 1].
- **Output**: the top-3 classes with confidence, plus the cause (pathogen and how it spreads)
  and general management steps from `backend/disease_info.py`. No pesticide names or doses are
  given; the app points the farmer to the local agriculture officer / KVK for that.
- **Classes**: Rice leaf blast, Tomato late blight, Banana bunchy top virus, Wheat brown rust,
  Wheat yellow rust, Potato early blight, Tomato leaf curl virus, Citrus canker, Maize common
  rust, Sugarcane red rot, Cucumber/muskmelon downy mildew.

**Accuracy has not been measured yet.** `backend/model_metrics.json` says so and is served at
`/model/info`. Two ways to get real numbers:

```bash
cd backend
# Measure the current model on labelled photos it has never seen
# (one folder per class, named with the class number first, e.g. test_set/00_rice_blast/)
python evaluate_model.py --data_dir test_set

# Or train your own MobileNetV2 model (two-phase transfer learning) on dataset/train and dataset/val;
# this replaces keras_model.h5 and records accuracy, macro F1, per-class scores,
# training curves and a confusion matrix
pip install -r requirements-train.txt
python train_model.py --data_dir dataset
```

Limitations to keep in mind: the model has **no "healthy" class**, so every photo gets one of
the 11 labels. The app marks results below 60 % confidence as uncertain and says so.

### Chatbot

`POST /chat` sends the question to Gemini 2.5 Flash (via the `google-genai` SDK) with a system
prompt that asks for short, practical answers in simple Hinglish and tells the farmer to confirm
pesticide or fertiliser doses with a local expert.

---

## Tech stack

**Frontend**: React 18, TypeScript, Vite 6, React Router 7, Tailwind CSS 4, shadcn/ui + Radix UI,
Recharts, Firebase JS SDK (Auth, Firestore, Realtime Database), Open-Meteo (weather).

**Backend**: Python 3.12, Flask 3, TensorFlow 2.21 / tf-keras, Pillow, NumPy, google-genai
(Gemini), Firebase Admin SDK (token verification).

**Hardware**: ESP32 with a soil moisture sensor, DHT22 (temperature + humidity) and an MQ gas
sensor; optional ESP32-CAM.

---

## Project structure

```
Agri_Irrigation/
├── Agriirrigation/                 React + TypeScript frontend
│   ├── .env.example                Firebase config + backend URL
│   └── src/
│       ├── firebase/firebase.ts    Firebase initialisation
│       └── app/
│           ├── routes.tsx          All routes
│           ├── lib/
│           │   ├── api.ts          Backend calls (adds the Firebase login token)
│           │   ├── weather.ts      Open-Meteo geocoding + forecast
│           │   └── useFarmWeather.ts  Forecast for the signed-in user's farm
│           ├── components/         Navigation, notification panel, shadcn/ui components
│           └── pages/              Dashboard, Irrigation, Weather, AI Assistant, …
│
└── backend/                        Flask API
    ├── app.py                      Routes, auth, CORS
    ├── irrigation_engine.py        Irrigation rules
    ├── anomaly_detector.py         Range check + rolling Z-score
    ├── disease_info.py             Cause and management notes per disease
    ├── model_utils.py              Image preprocessing, class list
    ├── keras_model.h5              Disease model (Teachable Machine export, 2.3 MB)
    ├── model_metrics.json          Model details and any measured accuracy
    ├── evaluate_model.py           Measure the model on labelled photos
    ├── train_model.py              Train a new MobileNetV2 model
    ├── test_backend.py             Test suite
    ├── requirements.txt            Runtime packages
    └── requirements-train.txt      Extra packages for training
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.12
- A [Firebase](https://console.firebase.google.com/) project with Email/Password Authentication,
  Realtime Database and Firestore enabled
- Optional: a [Gemini API key](https://aistudio.google.com/app/apikey) for the chatbot

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in API_KEY (and the service account for auth)
python app.py                   # http://localhost:5000
```

### Frontend

```bash
cd Agriirrigation
npm install
cp .env.example .env            # then fill in your Firebase config
npm run dev                     # http://localhost:5173
```

After signing up, enter your village or town on **Farm Settings** so the Weather and Irrigation
pages can fetch the forecast.

---

## Environment variables

### Frontend — `Agriirrigation/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, `VITE_DATABASE_URL` | Firebase web config (Firebase console → Project settings → Your apps) |
| `VITE_API_BASE` | Backend address (default `http://localhost:5000`) |

### Backend — `backend/.env`

| Variable | Purpose |
|---|---|
| `API_KEY` | Gemini API key; without it `/chat` returns 503 and everything else works |
| `GEMINI_MODEL` | Optional, default `gemini-2.5-flash` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to a Firebase service-account JSON. When set, every API call must carry the user's Firebase login token |
| `AUTH_REQUIRED` | `true` makes the server refuse to start without the service account (use when deploying) |
| `CORS_ORIGINS` | Comma-separated frontend addresses allowed to call the API (default `http://localhost:5173`) |
| `FLASK_HOST`, `PORT`, `FLASK_DEBUG` | Default `127.0.0.1`, `5000`, `0`. Never expose the debugger on a network: it allows running code on the machine |

`.env` files are git-ignored. Never commit them or the service-account JSON.

---

## API

All `POST` endpoints require `Authorization: Bearer <Firebase ID token>` when the backend has a
service account configured; the frontend sends it automatically.

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/health` | | What is configured (model, chatbot, auth) |
| GET | `/model/info` | | Model source, architecture, classes and recorded accuracy |
| POST | `/predict` | multipart form, field `image` (≤ 10 MB) | `disease`, `confidence`, `uncertain`, `top` (3), `info` (cause, management) |
| POST | `/chat` | `{ "message": "..." }` (≤ 1000 chars) | `{ "reply": "..." }` |
| POST | `/irrigation/recommend` | `{ "soil", "temp", "humidity", "hour"?, "et0_mm"?, "rain_mm_24h"? }` | `should_irrigate`, `urgency`, `delay_hours`, `duration_minutes`, `estimated_water_liters`, `reasons`, `warnings`, `inputs_used` |
| POST | `/anomaly/detect` | `{ "reading": {soil, temp, humidity, gas}, "history": [...] }` | `anomalies_detected`, `anomalies`, `sensor_scores`, `overall_score` |

Example:

```bash
curl -X POST http://localhost:5000/irrigation/recommend \
  -H "Content-Type: application/json" \
  -d '{"soil": 32, "temp": 31, "humidity": 55, "hour": 7, "et0_mm": 6.4, "rain_mm_24h": 0}'
```

---

## Firebase data layout (ESP32)

The app reads and writes these Realtime Database paths for controller `ESP32_001`:

```
devices/ESP32_001/data        ← ESP32 writes: soil, temp, humidity, gas, pump, autoMode
                                 (optional: battery, N, P, K)
devices/ESP32_001/commands    ← app writes:   irrigation ("ON" | "OFF" | "NONE"), autoMode (bool)
```

User profiles and farm settings live in Firestore under `users/{uid}`.

---

## Tests

```bash
cd backend
python test_backend.py
```

48 checks covering the irrigation engine (including rain and ET₀ rules), the anomaly detector
and every API endpoint through Flask's test client, so no server needs to be running. The live
chatbot check runs only when `API_KEY` is set.

---

## Known limitations

- **Disease model accuracy is unmeasured** and the model has no "healthy" class (see above).
- The dashboard's **fertility score** is a rough heuristic from soil moisture, humidity and the
  MQ gas sensor reading. It is not a measurement of soil nutrients.
- The **devices list** and **notifications** are sample data; device registration is not
  connected to Firebase yet.
- One controller (`ESP32_001`) is hard-coded in the frontend.
- The irrigation thresholds are generic starting values, not calibrated for a specific soil or crop.

---

## License

[MIT](LICENSE). UI components from shadcn/ui (MIT), photos from Unsplash, weather data from
Open-Meteo (CC BY 4.0); see [Agriirrigation/ATTRIBUTIONS.md](Agriirrigation/ATTRIBUTIONS.md).
