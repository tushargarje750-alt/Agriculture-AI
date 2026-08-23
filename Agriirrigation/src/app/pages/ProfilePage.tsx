import { User, Mail, Phone, MapPin, Calendar, Award, Edit } from "lucide-react";
import { Link } from "react-router";

import { useEffect, useState } from "react";
import { auth, firestore as db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

type UserData = {
  farmerName?: string;
  phone?: string;
  location?: string;
};

export function ProfilePage() {
  // ✅ 1. State
  const [userData, setUserData] = useState<UserData | null>(null);

  // ✅ 2. Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUserData(snap.data());
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your farmer profile
            </p>
          </div>
          <Link
            to="/edit-profile"
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
              
              <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-green-600 dark:text-green-500" />
              </div>

              <div className="flex-1 pt-4">
                {/* ✅ 3. Farmer Name */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData?.farmerName || "Farmer"}
                </h2>

                <p className="text-gray-600 dark:text-gray-400">
                  Commercial Farmer
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                    ✓ Verified Farmer
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    Premium Member
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* ✅ 4. Email */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {auth.currentUser?.email}
                </p>
              </div>
            </div>

            {/* ✅ 5. Phone */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userData?.phone}
                </p>
              </div>
            </div>

            {/* ✅ 6. Location */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userData?.location}
                </p>
              </div>
            </div>

            {/* Static */}
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  January 2024
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Achievements & Stats
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 text-center">
              <Award className="w-8 h-8 text-green-600 dark:text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">95%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Water Efficiency</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 text-center">
              <Award className="w-8 h-8 text-blue-600 dark:text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8.5</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Soil Health Score</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-xl p-4 text-center">
              <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active Devices</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-4 text-center">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">250+</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Days Active</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}