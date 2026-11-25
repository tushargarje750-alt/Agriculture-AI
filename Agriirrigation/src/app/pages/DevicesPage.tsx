import { Plus, QrCode, Wifi, WifiOff, Battery, MapPin, Settings } from "lucide-react";
import { useState } from "react";

const devices = [
  {
    id: "ESP32_001",
    name: "Smart Irrigation Controller",
    type: "Main IoT Controller",
    status: "online",
    battery: 67,
    location: "Section_01",
    lastUpdate: "Live",
  },

  {
    id: "ESP32_CAM_01",
    name: "CAM_01",
    type: "ESP_CAM",
    status: "online",
    battery: 50,
    location: "Section_01",
    lastUpdate: "Live",
  },

];

export function DevicesPage() {
  const [showAddDevice, setShowAddDevice] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Device Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and monitor your IoT irrigation devices
            </p>
          </div>
          <button
            onClick={() => setShowAddDevice(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Device</span>
          </button>
        </div>

        <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <strong>Sample data:</strong> the device list, status and battery values on this page are
          examples. Device registration is not connected yet; live sensor data comes from the
          controller <code>ESP32_001</code> on the Dashboard and Irrigation pages.
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Devices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Online</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">2</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Offline</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Battery</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">58%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Battery className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connected Devices
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 ${
                        device.status === "online"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      } rounded-xl flex items-center justify-center`}
                    >
                      {device.status === "online" ? (
                        <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            device.status === "online"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span className="font-medium">{device.id}</span>
                        </span>
                        <span>•</span>
                        <span>{device.type}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{device.location}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Battery */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Battery
                          className={`w-5 h-5 ${
                            device.battery > 50
                              ? "text-green-600 dark:text-green-400"
                              : device.battery > 20
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {device.battery}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {device.lastUpdate}
                      </p>
                    </div>

                    {/* Settings Button */}
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Add New Device
              </h3>

              <div className="space-y-4 mb-6">
                <button className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 dark:text-white">Scan QR Code</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Scan the QR code on your device
                  </p>
                </button>

                <button className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-colors">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 dark:text-white">Manual Entry</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter device ID manually
                  </p>
                </button>
              </div>

              <button
                onClick={() => setShowAddDevice(false)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
