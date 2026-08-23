import { useState, useEffect } from "react";
import { MapPin, Sprout, Droplet, TrendingUp, Save, AlertCircle, Trash2 } from "lucide-react";
import { Link } from "react-router";

/*firebase*/
import { auth, firestore as db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export function FarmSettingsPage() {
  const [farmSettings, setFarmSettings] = useState({
  farmName: "",
  farmSize: "",
  primaryCrop: "",
  irrigationType: "",
  soilType: "",
  farmAddress: "",
  autoIrrigation: true,
  moistureThreshold: "",
  notificationsEnabled: true,

  // 🔥 smart fields
  waterDeliveredToday: "0",
  rainForecast: "0",
  });

  useEffect(() => {
  const fetchFarmData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();

      setFarmSettings({
        farmName: data.farmName || "",
        farmSize: data.farmSize || "",
        primaryCrop: data.cropType || "",
        irrigationType: data.irrigationType || "",
        soilType: data.soilType || "",
        farmAddress: data.farmLocation || "",
        autoIrrigation: data.autoIrrigation ?? true,
        moistureThreshold: data.moistureThreshold || "",
        notificationsEnabled: data.notificationsEnabled ?? true,
        waterDeliveredToday: data.waterDeliveredToday || "0",
        rainForecast: data.rainForecast || "0",
      });
    }
  };

  fetchFarmData();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFarmSettings({
      ...farmSettings,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  // 🔥 crop water requirement
  const cropWaterRequirement: any = {
    tomato: 5,
    wheat: 4,
    rice: 7,
    chilli: 6,
    "corn-wheat": 5,
  };

  const required = cropWaterRequirement[farmSettings.primaryCrop] || 5;
  const delivered = Number(farmSettings.waterDeliveredToday);
  const rain = Number(farmSettings.rainForecast);

  const waterNeeded = Math.max(0, required - delivered - rain);
  const shouldIrrigate = waterNeeded > 0;

  try {
    await updateDoc(doc(db, "users", user.uid), {
      farmName: farmSettings.farmName,
      farmSize: farmSettings.farmSize,
      cropType: farmSettings.primaryCrop,
      soilType: farmSettings.soilType,
      farmLocation: farmSettings.farmAddress,
      irrigationType: farmSettings.irrigationType,
      moistureThreshold: farmSettings.moistureThreshold,
      autoIrrigation: farmSettings.autoIrrigation,
      notificationsEnabled: farmSettings.notificationsEnabled,

      // 🔥 smart result
      waterNeeded,
      shouldIrrigate,
    });

    alert(
      shouldIrrigate
        ? `Irrigation ON: ${waterNeeded}mm water needed`
        : "No irrigation needed (rain + soil sufficient)"
    );
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Farm Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your farm details and irrigation preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Farm Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Name
                </label>
                <input
                  type="text"
                  name="farmName"
                  value={farmSettings.farmName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Farm Size (Acres)
                  </label>
                  <input
                    type="number"
                    name="farmSize"
                    value={farmSettings.farmSize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Crop Type
                  </label>
                  <select
                    name="primaryCrop"
                    value={farmSettings.primaryCrop}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="corn-wheat">Corn & Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="cotton">Cotton</option>
                    <option value="soybean">Soybean</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Address
                </label>
                <input
                  type="text"
                  name="farmAddress"
                  value={farmSettings.farmAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Irrigation Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Irrigation Settings
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Irrigation Type
                  </label>
                  <select
                    name="irrigationType"
                    value={farmSettings.irrigationType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler System</option>
                    <option value="surface">Surface Irrigation</option>
                    <option value="subsurface">Subsurface Drip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={farmSettings.soilType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="clay">Clay</option>
                    <option value="loam">Loam</option>
                    <option value="sandy">Sandy</option>
                    <option value="silt">Silt</option>
                    <option value="peat">Peat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moisture Threshold for Auto-Irrigation (%)
                </label>
                <input
                  type="number"
                  name="moistureThreshold"
                  value={farmSettings.moistureThreshold}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Irrigation will start automatically when soil moisture drops below this level
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto-Irrigation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable AI-controlled irrigation</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoIrrigation"
                    checked={farmSettings.autoIrrigation}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Enable Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive alerts for irrigation, sensors, and weather updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="notificationsEnabled"
                  checked={farmSettings.notificationsEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-red-200 dark:border-red-900/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your farm, there is no going back. All data including devices, sensors, and historical data will be permanently removed.
            </p>
            <button
              type="button"
              onClick={() => confirm("Are you sure you want to delete your farm? This action cannot be undone.") && alert("Farm deletion would be processed here")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Delete Farm
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
            <Link
              to="/dashboard"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
