import { useNavigate } from "react-router";
import { Sprout, MapPin, Layers } from "lucide-react";
import { useState } from "react";

/*Firebase */
import { doc, updateDoc } from "firebase/firestore";
import { auth, firestore as db } from "../../firebase/firebase";

export function FarmSetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    soilType: "",
    farmLocation: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const user = auth.currentUser;

  if (!user) {
    alert("User not logged in");
    return;
  }

  try {
    await updateDoc(doc(db, "users", user.uid), {
      farmName: formData.farmName,
      cropType: formData.cropType,
      soilType: formData.soilType,
      farmLocation: formData.farmLocation,
    });

    navigate("/dashboard");
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
              ✓
            </div>
            <div className="w-20 h-1 bg-green-600"></div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
              2
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">Step 2 of 2: Farm Setup</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Setup Your Farm
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Tell us about your farm to get customized recommendations
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Name
                </label>
                <div className="relative">
                  <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.farmName}
                    onChange={(e) => handleChange("farmName", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Green Valley Farm"
                    required
                  />
                </div>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Crop Type
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => handleChange("cropType", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="rice">Rice</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Soil Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Soil Type
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.soilType}
                    onChange={(e) => handleChange("soilType", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select soil type</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="silt">Silt</option>
                    <option value="peat">Peat</option>
                  </select>
                </div>
              </div>

              {/* Farm Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Farm Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.farmLocation}
                    onChange={(e) => handleChange("farmLocation", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter farm coordinates or address"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/profile-setup")}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            </form>
          </div>

          {/* Map Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Interactive Farm Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Draw your farm boundaries to calculate the exact farm area
            </p>

            {/* Map Placeholder */}
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Interactive Map Area</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Click to draw farm boundaries
                  </p>
                </div>
              </div>
              {/* Mock map interface */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  +
                </button>
                <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  −
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Farm Area: <span className="text-green-600 dark:text-green-500">0 acres</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
