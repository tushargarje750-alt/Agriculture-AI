import { Bell, Droplet, AlertTriangle, CheckCircle, X, Zap } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "alert";
  title: string;
  message: string;
  time: string;
  icon: typeof Bell;
}

interface NotificationPanelProps {
  isOpen?: boolean;
  onClose: () => void;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Irrigation Completed",
    message: "Zone A irrigation completed successfully. Water used: 125L",
    time: "5 min ago",
    icon: CheckCircle,
  },
  {
    id: "2",
    type: "warning",
    title: "Low Soil Moisture",
    message: "Field Section B moisture at 35%. Irrigation recommended soon.",
    time: "15 min ago",
    icon: Droplet,
  },
  {
    id: "3",
    type: "alert",
    title: "Weather Alert",
    message: "Heavy rain expected in 6 hours. Auto-irrigation paused.",
    time: "1 hour ago",
    icon: AlertTriangle,
  },
  {
    id: "4",
    type: "info",
    title: "AI Recommendation",
    message: "Optimal irrigation time: 6:00 AM tomorrow. Estimated duration: 45 min",
    time: "2 hours ago",
    icon: Zap,
  },
  {
    id: "5",
    type: "success",
    title: "Device Connected",
    message: "Soil sensor #7 reconnected successfully.",
    time: "3 hours ago",
    icon: CheckCircle,
  },
];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "alert":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
        onClick={onClose}
      ></div>

      {/* Notification Panel */}
      <div className="fixed right-0 top-16 w-full sm:w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Notifications</h3>
            <span className="px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-medium">
              Sample
            </span>
            {notifications.length > 0 && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationStyle(notification.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
              Mark all as read
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}