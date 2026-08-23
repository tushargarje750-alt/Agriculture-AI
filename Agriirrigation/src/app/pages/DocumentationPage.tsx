import { Book, Code, Cpu, FileText, HelpCircle, Lightbulb, PlayCircle, Search, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

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
        description: "Get up and running with Agri-Irrigation in 5 minutes",
        content: [
          "1. Create your account and complete profile setup",
          "2. Add your farm details and configure zones",
          "3. Connect IoT sensors to your account",
          "4. Set up irrigation schedules",
          "5. Monitor your dashboard and start optimizing water usage"
        ]
      },
      {
        title: "System Requirements",
        description: "Hardware and software requirements for optimal performance",
        content: [
          "• Minimum 3G/4G internet connection for IoT devices",
          "• Modern web browser (Chrome, Firefox, Safari, Edge)",
          "• Compatible soil moisture sensors (see device list)",
          "• Irrigation system with electronic valves",
          "• Power supply for IoT sensors (solar or battery powered)"
        ]
      },
      {
        title: "Platform Overview",
        description: "Understanding the Agri-Irrigation ecosystem",
        content: [
          "Dashboard: Real-time monitoring and analytics",
          "Irrigation Control: Manual and automated water management",
          "Weather Integration: Forecast-based irrigation scheduling",
          "AI Assistant: Smart recommendations and plant disease detection",
          "Device Management: IoT sensor configuration and monitoring"
        ]
      }
    ],
    "setup": [
      {
        title: "Farm Configuration",
        description: "Setting up your farm zones and parameters",
        content: [
          "1. Navigate to Farm Settings",
          "2. Define farm boundaries using the interactive map",
          "3. Create irrigation zones based on crop types",
          "4. Set soil type and crop parameters for each zone",
          "5. Configure optimal moisture levels (typically 40-60%)"
        ]
      },
      {
        title: "Irrigation Schedule Setup",
        description: "Creating automated irrigation schedules",
        content: [
          "• Go to Irrigation page > Schedule tab",
          "• Select time-based or sensor-based triggers",
          "• Set moisture thresholds for automatic irrigation",
          "• Configure duration and water flow rates",
          "• Enable AI recommendations for optimal timing"
        ]
      },
      {
        title: "Weather Integration",
        description: "Connecting to weather services",
        content: [
          "The system automatically integrates local weather data.",
          "Irrigation schedules adjust based on rainfall predictions.",
          "You can set rain delay thresholds in settings.",
          "Weather alerts notify you of extreme conditions.",
          "7-day forecasts help plan irrigation cycles."
        ]
      }
    ],
    "devices": [
      {
        title: "Connecting IoT Sensors",
        description: "How to add and configure sensors",
        content: [
          "1. Go to Devices page and click 'Add Device'",
          "2. Scan the QR code on your sensor using mobile app",
          "3. Or manually enter the device ID from sensor label",
          "4. Assign the sensor to a specific farm zone",
          "5. Set sensor depth and calibration values",
          "6. Test connection and verify data streaming"
        ]
      },
      {
        title: "Supported Devices",
        description: "Compatible IoT sensors and hardware",
        content: [
          "• Soil Moisture Sensors (capacitive, resistive)",
          "• Temperature & Humidity Sensors (DHT22, DHT11)",
          "• Water Flow Meters (hall effect, ultrasonic)",
          "• Solenoid Valves (12V DC, 24V AC)",
          "• Weather Stations (rainfall, wind, solar radiation)",
          "• pH and NPK Sensors (optional)"
        ]
      },
      {
        title: "Device Troubleshooting",
        description: "Common device issues and solutions",
        content: [
          "Sensor Not Connecting: Check power supply and WiFi signal",
          "Incorrect Readings: Recalibrate sensor in settings",
          "Offline Status: Verify internet connectivity",
          "Battery Low: Replace batteries or solar panel",
          "Data Delays: Check Firebase Realtime Database connection"
        ]
      }
    ],
    "api": [
      {
        title: "REST API Overview",
        description: "Accessing Agri-Irrigation data programmatically",
        content: [
          "Base URL: https://api.agri-irrigation.com/v1",
          "Authentication: Bearer token (JWT)",
          "Rate Limits: 1000 requests/hour",
          "Response Format: JSON",
          "Webhooks: Available for real-time events"
        ]
      },
      {
        title: "API Endpoints",
        description: "Available endpoints for integration",
        content: [
          "GET /farms - List all farms",
          "GET /farms/{id}/sensors - Get sensor data",
          "POST /irrigation/start - Start irrigation",
          "POST /irrigation/stop - Stop irrigation",
          "GET /weather/{location} - Get weather forecast",
          "POST /devices - Register new device"
        ]
      },
      {
        title: "Sample Code",
        description: "Example API integration",
        content: [
          "// Get sensor data",
          "fetch('https://api.agri-irrigation.com/v1/farms/123/sensors', {",
          "  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }",
          "})",
          ".then(res => res.json())",
          ".then(data => console.log(data));"
        ]
      }
    ],
    "troubleshooting": [
      {
        title: "Common Issues",
        description: "Solutions to frequently encountered problems",
        content: [
          "Dashboard Not Loading: Clear browser cache and cookies",
          "Sensors Not Updating: Check device battery and connection",
          "Irrigation Not Starting: Verify valve power and wiring",
          "Incorrect Moisture Readings: Recalibrate sensors",
          "Mobile App Sync Issues: Update to latest app version"
        ]
      },
      {
        title: "Connectivity Problems",
        description: "Resolving network and connection issues",
        content: [
          "1. Verify internet connection on all devices",
          "2. Check Firebase Realtime Database status",
          "3. Ensure sensors are within WiFi range",
          "4. Restart router and IoT devices",
          "5. Contact support if issues persist"
        ]
      }
    ],
    "best-practices": [
      {
        title: "Optimizing Water Usage",
        description: "Best practices for efficient irrigation",
        content: [
          "• Irrigate early morning or late evening to reduce evaporation",
          "• Use drip irrigation for 30% more water efficiency",
          "• Monitor soil moisture instead of time-based schedules",
          "• Adjust for rainfall and seasonal changes",
          "• Maintain sensors for accurate readings"
        ]
      },
      {
        title: "Sensor Placement",
        description: "Where to place sensors for accurate data",
        content: [
          "Place sensors in crop root zone (6-12 inches deep)",
          "Install multiple sensors for large farms (1 per acre recommended)",
          "Avoid areas with unusual drainage or water pooling",
          "Position temperature sensors in shade",
          "Protect sensors from direct sun and physical damage"
        ]
      },
      {
        title: "Maintenance Schedule",
        description: "Regular maintenance for optimal performance",
        content: [
          "Weekly: Check sensor batteries and connections",
          "Monthly: Clean sensors and verify calibration",
          "Quarterly: Inspect valves and irrigation lines",
          "Annually: Replace sensor batteries and update firmware",
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
                <Link to="/devices" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Add Your First Device</p>
                  <p className="text-xs opacity-90">Connect IoT sensors</p>
                </Link>
                <Link to="/irrigation" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Setup Irrigation</p>
                  <p className="text-xs opacity-90">Configure schedules</p>
                </Link>
                <Link to="/support" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Contact Support</p>
                  <p className="text-xs opacity-90">Get help from experts</p>
                </Link>
                <a href="#" className="bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-colors">
                  <p className="font-medium">Video Tutorials</p>
                  <p className="text-xs opacity-90">Watch and learn</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
