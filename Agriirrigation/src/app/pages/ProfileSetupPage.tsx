import { useNavigate } from "react-router";
import { User, Phone, MapPin, Maximize } from "lucide-react";
import { useState } from "react";

/*firebase*/
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore as db } from "../../firebase/firebase";

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmerName: "",
    phone: "",
    location: "",
    farmSize: "",
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
    await setDoc(doc(db, "users", user.uid), {
      farmerName: formData.farmerName,
      phone: formData.phone,
      location: formData.location,
      farmSize: formData.farmSize,
    });

    navigate("/farm-setup");
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
              1
            </div>
            <div className="w-20 h-1 bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center">
              2
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300">Step 1 of 2: Profile Setup</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Let's get to know you better to provide personalized farming insights
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farmer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farmer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.farmerName}
                  onChange={(e) => handleChange("farmerName", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="John Farmer"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="City, State, Country"
                  required
                />
              </div>
            </div>

            {/* Farm Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Farm Size (acres)
              </label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.farmSize}
                  onChange={(e) => handleChange("farmSize", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter farm size"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
