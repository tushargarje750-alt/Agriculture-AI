import { Link } from "react-router";
import { Droplet, Sprout, Sun, Brain, Bug, ArrowRight, Cpu, Cloud, Monitor, Target } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { REPO_URL } from "../lib/links";

export function LandingPage() {
  const features = [
    {
      icon: Droplet,
      title: "Smart Irrigation Automation",
      description: "AI-powered irrigation control based on real-time soil moisture and weather data",
    },
    {
      icon: Sprout,
      title: "Soil Fertility Analysis",
      description: "Monitor and track soil health with advanced NPK and pH level sensors",
    },
    {
      icon: Sun,
      title: "Solar Powered Farm Devices",
      description: "Sustainable energy solutions with solar-powered IoT devices",
    },
    {
      icon: Brain,
      title: "AI Assistant for Farmers",
      description: "Get instant answers to farming questions with our intelligent chatbot",
    },
    {
      icon: Bug,
      title: "Plant Disease Detection",
      description: "Identify plant diseases early with AI-powered image recognition",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Droplet className="w-8 h-8 text-green-600 dark:text-green-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Agri-Irrigation
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Smart Irrigation for the{" "}
                <span className="text-green-600 dark:text-green-500">Future of Farming</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                AI-powered irrigation and smart farm monitoring to help you manage your farm
                efficiently with real-time data from IoT sensors.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1738598665698-7fd7af4b5e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGZhcm1pbmclMjBpcnJpZ2F0aW9uJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzMzMzU1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Smart farming technology"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to optimize your farm operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple, smart, and efficient farm management
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { icon: Cpu, label: "IoT Sensors" },
              { icon: Target, label: "IoT Device" },
              { icon: Cloud, label: "Cloud Processing" },
              { icon: Monitor, label: "Dashboard" },
              { icon: Brain, label: "Smart Decisions" },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-10 h-10 text-green-600 dark:text-green-500" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{step.label}</p>
                  {index < 4 && (
                    <ArrowRight className="hidden md:block w-8 h-8 text-gray-400 mt-8 absolute translate-x-24" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplet className="w-6 h-6 text-green-500" />
                <span className="font-semibold">Agri-Irrigation</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart farming solutions for the modern farmer
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-green-500">About the project</Link></li>
                <li><a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-green-500">Source code</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/docs" className="hover:text-green-500">Getting Started</Link></li>
                <li><Link to="/docs" className="hover:text-green-500">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/support" className="hover:text-green-500">Help</Link></li>
                <li><a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="hover:text-green-500">Report an issue</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Agri-Irrigation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
