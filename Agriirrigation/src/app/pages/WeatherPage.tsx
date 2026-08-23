import { Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const temperatureForecast = [
  { day: "Mon", temp: 28, humidity: 65 },
  { day: "Tue", temp: 30, humidity: 62 },
  { day: "Wed", temp: 27, humidity: 70 },
  { day: "Thu", temp: 29, humidity: 68 },
  { day: "Fri", temp: 31, humidity: 60 },
  { day: "Sat", temp: 28, humidity: 65 },
  { day: "Sun", temp: 32, humidity: 72 },
];

const weeklyForecast = [
  { day: "Monday", icon: Sun, temp: "28°C", condition: "Sunny", rain: "5%" },
  { day: "Tuesday", icon: Sun, temp: "30°C", condition: "Clear", rain: "0%" },
  { day: "Wednesday", icon: Cloud, temp: "27°C", condition: "Cloudy", rain: "60%" },
  { day: "Thursday", icon: Cloud, temp: "29°C", condition: "Cloudy", rain: "20%" },
  { day: "Friday", icon: Sun, temp: "31°C", condition: "Sunny", rain: "5%" },
  { day: "Saturday", icon: Cloud, temp: "28°C", condition: "Partly Cloudy", rain: "15%" },
  { day: "Sunday", icon: Sun, temp: "32°C", condition: "Sunny", rain: "75%" },
];

export function WeatherPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weather Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time weather data for optimal farming decisions
          </p>
        </div>

        {/* Current Weather Hero */}
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <div className="absolute inset-0 opacity-20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1696785042087-7211ac323e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWF0aGVyJTIwZmFybWluZyUyMGNsb3Vkc3xlbnwxfHx8fDE3NzMzMzU1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Weather background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg opacity-90 mb-2">Today, April 18, 2026</p>
                <div className="flex items-center space-x-4 mb-4">
                  <Sun className="w-20 h-20" />
                  <div>
                    <div className="text-6xl font-bold">28°C</div>
                    <p className="text-xl opacity-90">Sunny & Clear</p>
                  </div>
                </div>
                <p className="text-sm opacity-80">Gadhinglaj, Kolhapur </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Droplets className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-80">Humidity</p>
                  <p className="text-2xl font-semibold">65%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Wind className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-80">Wind Speed</p>
                  <p className="text-2xl font-semibold">12 km/h</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <CloudRain className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-80">Rain Chance</p>
                  <p className="text-2xl font-semibold">5%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Thermometer className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-80">Feels Like</p>
                  <p className="text-2xl font-semibold">30°C</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            7-Day Temperature & Humidity Forecast
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                key="temp"
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Temperature (°C)"
                dot={{ fill: "#F59E0B", r: 5 }}
              />
              <Line
                key="humidity"
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Humidity (%)"
                dot={{ fill: "#3B82F6", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 7-Day Forecast Cards */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            7-Day Weather Forecast
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {weeklyForecast.map((forecast, index) => {
              const Icon = forecast.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    {forecast.day}
                  </p>
                  <Icon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    {forecast.temp}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                    {forecast.condition}
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                    <Droplets className="w-3 h-3" />
                    <span>{forecast.rain}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Farming Tips */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-3">
            🌱 Farming Tips Based on Weather
          </h3>
          <ul className="space-y-2 text-green-800 dark:text-green-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Light rain expected on Wednesday - consider postponing irrigation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>High temperatures on Friday - monitor soil moisture closely</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Good conditions for spraying pesticides on Monday and Tuesday</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}