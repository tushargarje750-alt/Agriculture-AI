import { Link, useLocation } from "react-router";
import { LayoutDashboard, Waves, CloudRain, Bot, Cpu } from "lucide-react";

export function MobileNavPill() {
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/irrigation", label: "Water", icon: Waves },
    { path: "/weather", label: "Weather", icon: CloudRain },
    { path: "/ai-assistant", label: "AI", icon: Bot },
    { path: "/devices", label: "Devices", icon: Cpu },
  ];

  const isActive = (path: string) => location.pathname === path;
  const activeIndex = navLinks.findIndex(link => isActive(link.path));

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative bg-white dark:bg-gray-900 rounded-full shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-1.5">
        {/* Animated sliding background */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-green-500/50"
            style={{
              left: `${activeIndex * 20 + 1.5}%`,
              width: "16.66%",
              height: "calc(100% - 0.75rem)",
            }}
          />
        )}

        <div className="relative flex items-center gap-1">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      active
                        ? "text-white scale-110"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium mt-0.5 transition-all duration-300 ${
                      active
                        ? "text-white font-bold"
                        : "text-gray-500 dark:text-gray-500"
                    }`}
                  >
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
