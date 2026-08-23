# AgriIrrigation — Smart Farming & Irrigation Platform

A full-stack **AI-powered smart agriculture web application** that helps farmers monitor crops, schedule irrigation intelligently, detect plant diseases using machine learning, and get expert advice via an AI chatbot — all in one platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Pages & Routes](#pages--routes)
- [AI & ML Features](#ai--ml-features)
- [IoT Integration](#iot-integration)
- [Screenshots](#screenshots)

---

## Features

- **Smart Dashboard** — Real-time sensor data (soil moisture, temperature, humidity, gas levels) with live charts
- **Irrigation Scheduling** — Rule-based AI engine recommends when and how long to irrigate based on soil moisture, temperature, humidity, and time of day
- **Plant Disease Detection** — Upload a crop leaf image → MobileNetV2 ML model classifies the disease (11 classes) with confidence score
- **IoT Anomaly Detection** — Statistical Z-score analysis flags faulty or unexpected sensor readings automatically
- **AI Chatbot (Hinglish)** — Gemini 2.5 Flash-powered agricultural assistant answers farmer questions in simple Hinglish
- **Weather Page** — Real-time weather data relevant to farming decisions
- **Marketplace** — Browse and list farm produce
- **Device Management** — Register and manage IoT sensor devices (ESP32)
- **Firebase Auth** — Secure login/signup with email & password via Firebase Authentication
- **Farm Setup & Settings** — Configure farm profile, crop types, zone settings
- **Notification Panel** — Real-time alerts for critical sensor readings
- **Responsive UI** — Mobile-first design with floating mobile navigation

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | — | Type safety |
| Vite | 6.4.1 | Build tool & dev server |
| React Router | 7.13.0 | Client-side routing |
| Tailwind CSS | 4.1.12 | Utility-first styling |
| shadcn/ui + Radix UI | — | Accessible UI components |
| MUI (Material UI) | 7.3.5 | Additional UI components |
| Recharts | 2.15.2 | Sensor data charts |
| Firebase SDK | 12.11.0 | Auth + Realtime Database + Firestore |
| Lucide React | 0.487.0 | Icon library |
| Motion | 12.23.24 | Animations |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python 3 | — | Runtime |
| Flask | — | Web framework |
| TF-Keras (MobileNetV2) | — | Plant disease classification model |
| Google Gemini 2.5 Flash | — | AI chatbot |
| Firebase Admin SDK | — | JWT token verification |
| Flask-CORS | — | Cross-origin requests |
| Pillow | — | Image preprocessing |
| NumPy | — | Numerical operations |

### Cloud & Infrastructure
| Service | Purpose |
|---|---|
| Firebase Authentication | User login/signup |
| Firebase Realtime Database | Live IoT sensor data from ESP32 |
| Firebase Firestore | User profiles and farm data |
| Google Gemini API | AI chatbot responses |

---

## Project Structure

```
Agri_Irrigation/
├── .gitignore
├── README.md
│
├── Agriirrigation/                    # React + TypeScript Frontend
│   ├── .env                           # Firebase credentials (not committed)
│   ├── .env.example                   # Template for env variables
│   ├── package.json
│   ├── vite.config.ts
│   ├── postcss.config.mjs
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React DOM entry point
│       ├── firebase/                  # Firebase SDK initialization
│       ├── app/
│       │   ├── App.tsx                # RouterProvider entry
│       │   ├── routes.tsx             # All route definitions
│       │   ├── components/
│       │   │   ├── Navigation.tsx     # Main sidebar/navbar
│       │   │   ├── MobileNavFloating.tsx
│       │   │   ├── NotificationPanel.tsx
│       │   │   └── ui/               # shadcn/ui component library
│       │   ├── context/              # React context (auth, etc.)
│       │   ├── layouts/              # Page layout wrappers
│       │   └── pages/
│       │       ├── LandingPage.tsx
│       │       ├── LoginPage.tsx
│       │       ├── SignUpPage.tsx
│       │       ├── DashboardPage.tsx
│       │       ├── IrrigationPage.tsx
│       │       ├── AIAssistantPage.tsx
│       │       ├── DevicesPage.tsx
│       │       ├── WeatherPage.tsx
│       │       ├── marketplace.tsx
│       │       ├── FarmSetupPage.tsx
│       │       ├── FarmSettingsPage.tsx
│       │       ├── ProfilePage.tsx
│       │       ├── EditProfilePage.tsx
│       │       ├── ProfileSetupPage.tsx
│       │       ├── AboutPage.tsx
│       │       ├── DocumentationPage.tsx
│       │       ├── SupportPage.tsx
│       │       └── NotFoundPage.tsx
│
└── backend/                           # Python Flask Backend
    ├── .env                           # API keys (not committed)
    ├── .env.example                   # Template for env variables
    ├── app.py                         # Flask server entry point (port 5000)
    ├── irrigation_engine.py           # Smart irrigation scheduling logic
    ├── anomaly_detector.py            # IoT sensor anomaly detection
    ├── keras_model.h5                 # Trained MobileNetV2 model (plant disease)
    ├── labels.txt                     # Disease class labels
    ├── model_metrics.json             # Model evaluation metrics
    ├── train_model.py                 # Model training script
    ├── evaluate_model.py              # Model evaluation script
    └── test_backend.py                # Backend test suite
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://python.org/) 3.9+
- A [Firebase](https://console.firebase.google.com/) project with:
  - Authentication enabled (Email/Password)
  - Realtime Database enabled
  - Firestore enabled
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Mac/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install flask flask-cors tf-keras google-generativeai Pillow numpy firebase-admin python-dotenv
   ```

4. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Gemini API key.

5. Start the backend server:
   ```bash
   python app.py
   ```
   Backend runs on **http://localhost:5000**

---

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd Agriirrigation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase project credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend runs on **http://localhost:5173**

---

## Environment Variables

### Frontend — `Agriirrigation/.env`

```env
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
VITE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
```

Get these from: Firebase Console → Project Settings → Your apps → Config

### Backend — `backend/.env`

```env
API_KEY=your_google_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-service-account.json
```

Get your Gemini key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

> **Note:** Never commit `.env` files. They are excluded via `.gitignore`.

---

## API Endpoints

### Disease Detection
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/predict` | Upload crop image → get disease name + confidence | No |

### AI Chatbot
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/chat` | Send a farming question → get Gemini AI response | No |

### Irrigation
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/irrigation/recommend` | Get smart irrigation recommendation | Yes (Firebase JWT) |

**Request body:**
```json
{
  "soil": 35,
  "temp": 32,
  "humidity": 65,
  "hour": 8
}
```

### Anomaly Detection
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/anomaly/detect` | Detect faulty sensor readings | Yes (Firebase JWT) |

**Request body:**
```json
{
  "reading": { "soil": 42, "temp": 28, "humidity": 60, "gas": 120 },
  "history": [{ "soil": 40, "temp": 27 }, ...]
}
```

### Model Info
| Method | Endpoint | Description |
|---|---|---|
| GET | `/model/info` | Returns ML model architecture and metrics |

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero section, features overview |
| `/login` | Login | Firebase email/password login |
| `/signup` | Sign Up | New user registration |
| `/profile-setup` | Profile Setup | First-time user onboarding |
| `/dashboard` | Dashboard | Real-time sensor data & charts |
| `/irrigation` | Irrigation | Smart irrigation recommendations |
| `/ai-assistant` | AI Assistant | Gemini chatbot for farming queries |
| `/devices` | Devices | IoT device management (ESP32) |
| `/weather` | Weather | Weather data for farm location |
| `/marketplace` | Marketplace | Buy/sell farm produce |
| `/farm-setup` | Farm Setup | Configure farm details |
| `/farm-settings` | Farm Settings | Update farm configuration |
| `/profile` | Profile | View user profile |
| `/edit-profile` | Edit Profile | Update profile details |
| `/about` | About | About the platform |
| `/docs` | Documentation | Technical documentation |
| `/support` | Support | Help & support |

---

## AI & ML Features

### Plant Disease Detection
- **Model:** MobileNetV2 (Transfer Learning, ImageNet weights)
- **Task:** Multi-class classification (11 disease classes)
- **Input:** Leaf image (resized to 224×224)
- **Output:** Disease name + confidence score

**Supported diseases:**
| # | Disease |
|---|---|
| 1 | Rice Leaf Blast (*Magnaporthe grisea*) |
| 2 | Tomato Late Blight (*Phytophthora infestans*) |
| 3 | Banana Bunchy Top Virus (BBTV) |
| 4 | Wheat Brown Rust |
| 5 | Wheat Yellow Rust |
| 6 | Potato Early Blight (*Alternaria solani*) |
| 7 | Tomato Yellow Leaf Curl Virus (ToLCNDV) |
| 8 | Citrus Canker (*Xanthomonas axonopodis*) |
| 9 | Corn/Maize Common Rust (*Puccinia sorghi*) |
| 10 | Sugarcane Red Rot (*Colletotrichum falcatum*) |
| 11 | Cucumber/Muskmelon Downy Mildew |

### Smart Irrigation Engine
Rule-based decision system using:
- **Soil moisture thresholds** — critical (<20%), dry (<35%), watch (<45%), optimal, wet (>80%)
- **Temperature** — avoids peak heat window (11 AM–4 PM) to reduce evaporation
- **Humidity** — high humidity delays irrigation
- **Time of day** — prefers early morning (5–9 AM) for efficiency

Each recommendation includes:
- `should_irrigate` — yes/no decision
- `urgency` — none / low / medium / high / critical
- `delay_hours` — how long to wait
- `duration_minutes` — how long to run irrigation
- `estimated_water_liters` — water volume estimate
- `reasons` + `warnings` — human-readable explanations

### IoT Anomaly Detection
Two-layer detection:
1. **Hard range check** — flags physically impossible readings (e.g., soil > 100%)
2. **Rolling Z-score** — flags statistical outliers (Z > 2.5 = medium, Z > 4 = high severity)

### AI Chatbot
- Powered by **Gemini 2.5 Flash**
- Responds in **Hinglish** (Hindi + English mix) for farmer accessibility
- Expert agricultural advice on crops, pests, irrigation, and soil

---

## IoT Integration

The platform integrates with **ESP32 microcontrollers** that push sensor data directly to Firebase Realtime Database. The frontend reads this live data to display real-time charts and trigger anomaly detection.

**Sensors supported:**
- Soil moisture sensor
- DHT22 (temperature + humidity)
- MQ gas sensor

---

## Screenshots

> Add screenshots here after running locally.

| Page | Preview |
|---|---|
| Dashboard | *(coming soon)* |
| Irrigation Recommendation | *(coming soon)* |
| Disease Detection | *(coming soon)* |
| AI Chatbot | *(coming soon)* |

---

## License

This project is open source and available under the [MIT License](LICENSE).
