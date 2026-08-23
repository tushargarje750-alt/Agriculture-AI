import { Link, useLocation } from "react-router";
import { Bell, Droplet, Menu, Moon, Sun, User, X, LayoutDashboard, Waves, CloudRain, Bot, Cpu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Store } from "lucide-react"; // add this import

/*firebase */
import { auth, firestore as db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  //firebase
  const [userData, setUserData] = useState<any>(null);

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/irrigation", label: "Irrigation", icon: Waves },
    { path: "/weather", label: "Weather", icon: CloudRain },
    { path: "/ai-assistant", label: "AI Assistant", icon: Bot },
    { path: "/devices", label: "Devices", icon: Cpu },
      { path: "/marketplace", label: "Marketplace", icon: Store },
    
  ];

  useEffect(() => {
  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      setUserData(snap.data());
    }
  };

  fetchUser();
}, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
  try {
    await signOut(auth);
    window.location.href = "/login";
  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Droplet className="w-8 h-8 text-green-600 dark:text-green-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Agri-Irrigation
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <User className="w-6 h-6 text-green-700 dark:text-green-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 transition-colors">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white"> {userData?.farmerName || "Farmer"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">   {auth.currentUser?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/edit-profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit Farmer Details
                    </Link>
                    <Link
                      to="/farm-settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Farm Settings
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button   onClick={handleLogout}   className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Navigation items */}
        <div className="relative flex justify-around items-center px-2 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex flex-col items-center justify-center flex-1 group"
              >
                {/* Active indicator background */}
                {active && (
                  <div className="absolute inset-0 mx-2 bg-green-100 dark:bg-green-900/30 rounded-2xl transition-all duration-300"></div>
                )}
                
                {/* Icon container */}
                <div className={`relative z-10 flex flex-col items-center justify-center py-2 px-3 transition-all duration-300 ${
                  active ? "transform -translate-y-1" : "group-hover:transform group-hover:-translate-y-0.5"
                }`}>
                  {/* Icon with animated background */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    active 
                      ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30" 
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      active ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`} />
                    
                    {/* Active dot indicator */}
                    {active && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-medium mt-1.5 transition-all duration-300 ${
                    active 
                      ? "text-green-600 dark:text-green-400 font-bold" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {link.label.split(" ")[0]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}