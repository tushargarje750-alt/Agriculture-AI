import { Book, Code, Cpu, FileText, HelpCircle, Lightbulb, PlayCircle, Search, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { REPO_URL } from "../lib/links";

export function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  const categories = [
    { id: "getting-started", label: "Getting Started", icon: PlayCircle },
    { id: "setup", label: "Setup & Configuration", icon: Settings },
    { id: "devices", label: "Device Integration", icon: Cpu },
    { id: "api", label: "API Reference", icon: Code },
    { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
    { id: "best-practices", label: "Best Practices", icon: Lightbulb },
  ];

  const documentation = {
    "getting-started": [
      {
        title: "Quick Start Guide",
        description: "Get up and running with Agri-Irrigation",
        content: [
          "1. Create your account and complete profile setup",
          "2. Add your farm details, including the nearest village or town, in Farm Setup",
          "3. Power on the ESP32 controller so it starts sending readings to Firebase",
          "4. Open the Dashboard to see live soil, temperature and humidity readings",
          "5. Use the Irrigation page for recommendations and pump control"
        ]
      },
      {
        title: "System Requirements",
        description: "What you need to run the system",
        content: [
          "• ESP32 board with Wi-Fi access",
          "• Soil moisture sensor, DHT22 temperature/humidity sensor, MQ gas sensor",
          "• Pump or valve switched by a relay on the ESP32",
          "• Modern web browser (Chrome, Firefox, Safari, Edge)",
          "• The Flask backend running for recommendations, disease detection and chat"
        ]
      },
      {
        title: "Platform Overview",
        description: "Understanding the Agri-Irrigation pages",
        content: [
          "Dashboard: live sensor readings, trends and a sensor-health check",
          "Irrigation: recommendation plus manual, stop and auto pump control",
          "Weather: 7-day Open-Meteo forecast for your farm, including ET₀",
          "AI Assistant: leaf-photo disease check and a Hinglish farming chatbot",
          "Devices: example device list (registration is not connected yet)"
        ]
      }
    ],
    "setup": [
      {
        title: "Farm Configuration",
        description: "Setting up your farm details",
        content: [
          "1. Open Farm Settings",
          "2. Enter farm name, size, primary crop and soil type",
          "3. Enter your village or town as the farm location",
          "4. Save; the Weather and Irrigation pages use this location for the forecast"
        ]
      },
      {
        title: "How Recommendations Work",
        description: "What the irrigation engine looks at",
        content: [
          "• Soil moisture is the main signal: below 20% critical, below 35% dry, below 45% mild deficit",
          "• ET₀ (crop water demand) from the forecast: 6 mm/day or more makes it irrigate sooner",
          "• Rain forecast: 5 mm or more in the next 24 h skips or shortens irrigation",
          "• Temperature and time of day: avoids irrigating in the 11 AM–4 PM heat",
          "• Every recommendation lists the reasons and the inputs it used"
        ]
      },
      {
        title: "Weather Integration",
        description: "Where the forecast comes from",
        content: [
          "Forecasts come from Open-Meteo (free, no API key needed).",
          "Your farm location is turned into coordinates with Open-Meteo's geocoding.",
          "If the town is not found, try the nearest larger town name.",
          "Without a location, recommendations use sensor data only."
        ]
      }
    ],
    "devices": [
      {
        title: "Connecting the ESP32",
        description: "How the controller talks to the app",
        content: [
          "1. The ESP32 writes readings to devices/ESP32_001/data in Firebase Realtime Database",
          "2. Fields used: soil, temp, humidity, gas, pump, autoMode (optional: battery, N, P, K)",
          "3. The app writes pump commands to devices/ESP32_001/commands",
          "4. commands/irrigation is ON, OFF or NONE; commands/autoMode is true or false"
        ]
      },
      {
        title: "Supported Sensors",
        description: "Hardware used in this project",
        content: [
          "• Capacitive or resistive soil moisture sensor",
          "• DHT22 temperature and humidity sensor",
          "• MQ-series gas sensor",
          "• ESP32-CAM for an optional live camera view on the Dashboard"
        ]
      },
      {
        title: "Device Troubleshooting",
        description: "Common device issues and solutions",
        content: [
          "Sensor Not Connecting: Check power supply and Wi-Fi signal",
          "Readings Flagged on the Dashboard: Check wiring; the Sensor Health card shows which value looks wrong",
          "Offline Status: Verify internet connectivity",
          "Data Delays: Check the Firebase Realtime Database connection"
        ]
      }
    ],
    "api": [
      {
        title: "Backend API Overview",
        description: "The Flask backend used by this app",
        content: [
          "Base URL: http://localhost:5000 by default (set VITE_API_BASE for another address)",
          "Authentication: Firebase ID token as 'Authorization: Bearer <token>' when the backend has a service account configured",
          "Format: JSON, except /predict which takes a multipart image upload"
        ]
      },
      {
        title: "API Endpoints",
        description: "Endpoints the app calls",
        content: [
          "GET /health - What is configured (model, chatbot, auth)",
          "GET /model/info - Disease model details and recorded accuracy",
          "POST /predict - Leaf photo (form field 'image') → disease, confidence, advice",
          "POST /chat - { message } → farming answer in Hinglish",
          "POST /irrigation/recommend - { soil, temp, humidity, hour?, et0_mm?, rain_mm_24h? }",
          "POST /anomaly/detect - { reading, history } → faulty-reading report"
        ]
      },
      {
        title: "Sample Code",
        description: "Example request",
        content: [
          "fetch('http://localhost:5000/irrigation/recommend', {",
          "  method: 'POST',",
          "  headers: { 'Content-Type': 'application/json' },",
          "  body: JSON.stringify({ soil: 32, temp: 31, humidity: 55, hour: 7 })",
          "}).then(res => res.json()).then(console.log);"
        ]
      }
    ],
    "troubleshooting": [
      {
        title: "Common Issues",
        description: "Solutions to frequently encountered problems",
        content: [
          "Dashboard Not Loading: Clear browser cache and cookies",
          "Sensors Not Updating: Check the ESP32's power and Wi-Fi connection",
          "Irrigation Not Starting: Verify pump/relay power and wiring",
          "Incorrect Moisture Readings: Recalibrate the soil sensor for your soil",
          "'Could not reach the backend': Start the Flask backend (python app.py)"
        ]
      },
      {
        title: "Connectivity Problems",
        description: "Resolving network and connection issues",
        content: [
          "1. Verify internet connection on all devices",
          "2. Check Firebase Realtime Database status",
          "3. Ensure sensors are within Wi-Fi range",
          "4. Restart router and IoT devices"
        ]
      }
    ],
    "best-practices": [
      {
        title: "Optimizing Water Usage",
        description: "Best practices for efficient irrigation",
        content: [
          "• Irrigate early morning or late evening to reduce evaporation",
          "• Drip irrigation usually needs much less water than flood irrigation",
          "• Irrigate by soil moisture, not by a fixed timetable",
          "• Skip irrigation when good rain is forecast",
          "• Maintain sensors for accurate readings"
        ]
      },
      {
        title: "Sensor Placement",
        description: "Where to place sensors for accurate data",
        content: [
          "Place soil sensors in the crop root zone (about 15–30 cm deep)",
          "Use more than one sensor on large or uneven fields",
          "Avoid areas with unusual drainage or water pooling",
          "Keep temperature sensors in the shade",
          "Protect sensors from direct sun and physical damage"
        ]
      },
      {
        title: "Maintenance Schedule",
        description: "Regular maintenance for optimal performance",
        content: [
          "Weekly: Check sensor power and connections",
          "Monthly: Clean sensors and verify calibration",
          "Every season: Inspect pump, valves and irrigation lines",
          "After storms: Check for physical damage"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Everything you need to know about using Agri-Irrigation
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Book className="w-5 h-5" />
                <span>Categories</span>
              </h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/support"
                  className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Need Help?</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {documentation[selectedCategory as keyof typeof documentation].map((doc, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-14 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {doc.content.map((item, i) => (
                        <p key={i} className="leading-relaxed font-mono text-xs">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Quick Links</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link to="/farm-settings" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Set Your Farm Location</p>
                  <p className="text-xs opacity-90">Needed for the weather forecast</p>
                </Link>
                <Link to="/irrigation" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Irrigation</p>
                  <p className="text-xs opacity-90">Recommendation and pump control</p>
                </Link>
                <Link to="/support" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Get Help</p>
                  <p className="text-xs opacity-90">Chatbot, docs and GitHub issues</p>
                </Link>
                <a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Project README</p>
                  <p className="text-xs opacity-90">Setup and architecture</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
