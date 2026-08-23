import { Link, useLocation } from "react-router";
import { LayoutDashboard, Waves, CloudRain, Bot, Cpu, Home } from "lucide-react";

export function MobileNavFloating() {
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-blue-500 to-blue-600" },
    { path: "/irrigation", label: "Irrigation", icon: Waves, color: "from-cyan-500 to-cyan-600" },
    { path: "/weather", label: "Weather", icon: CloudRain, color: "from-purple-500 to-purple-600" },
    { path: "/ai-assistant", label: "AI", icon: Bot, color: "from-pink-500 to-pink-600" },
    { path: "/devices", label: "Devices", icon: Cpu, color: "from-orange-500 to-orange-600" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex justify-around items-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative group"
              >
                {active ? (
                  <>
                    {/* Active state - floating button */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${link.color} rounded-full blur-xl opacity-50 animate-pulse`}></div>
                      <div className={`relative w-14 h-14 bg-gradient-to-br ${link.color} rounded-full flex items-center justify-center shadow-xl transform -translate-y-2 transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {/* Active label */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[9px] font-bold text-green-600 dark:text-green-400">
                        {link.label}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Inactive state */
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:scale-110">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-colors" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
