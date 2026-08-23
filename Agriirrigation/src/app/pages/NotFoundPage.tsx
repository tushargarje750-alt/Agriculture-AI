import { Link } from "react-router";
import { Droplet } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <Droplet className="w-24 h-24 text-green-600 dark:text-green-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Oops! Page not found
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
