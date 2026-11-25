import { Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow, CloudLightning, Thermometer, Leaf } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router";
import { useFarmWeather } from "../lib/useFarmWeather";
import { describeCode, weatherKind, type DailyForecast, type WeatherKind } from "../lib/weather";

const ICONS: Record<WeatherKind, typeof Sun> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

const weekday = (date: string, style: "short" | "long") =>
  new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: style });

function farmingTips(days: DailyForecast[]): string[] {
  const tips: string[] = [];
  const rainy = days.filter((d) => d.rainMm >= 5);
  if (rainy.length) {
    tips.push(
      `Rain of 5 mm or more expected on ${rainy.map((d) => weekday(d.date, "long")).join(", ")} — ` +
        "postpone irrigation before those days."
    );
  }
  const hot = days.filter((d) => d.tempMax >= 35);
  if (hot.length) {
    tips.push(
      `Hot days (35°C+) on ${hot.map((d) => weekday(d.date, "long")).join(", ")} — ` +
        "check soil moisture often and irrigate early in the morning."
    );
  }
  const highEt0 = days.filter((d) => d.et0Mm >= 6);
  if (highEt0.length) {
    tips.push(
      `High crop water demand (ET₀ 6 mm/day or more) on ${highEt0.map((d) => weekday(d.date, "long")).join(", ")}.`
    );
  }
  const dry = days.filter((d) => d.rainChance < 20).slice(0, 3);
  if (dry.length) {
    tips.push(
      `Low chance of rain on ${dry.map((d) => weekday(d.date, "long")).join(", ")} — ` +
        "suitable for spraying if it is not windy."
    );
  }
  if (!tips.length) tips.push("No unusual weather in the next 7 days.");
  return tips;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center text-gray-700 dark:text-gray-300">
      {children}
    </div>
  );
}

export function WeatherPage() {
  const { status, location, place, forecast, error } = useFarmWeather();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weather Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            7-day forecast for your farm from Open-Meteo, including crop water demand (ET₀)
          </p>
        </div>

        {status === "loading" && <Notice>Loading the forecast…</Notice>}
        {status === "no-user" && (
          <Notice>
            <Link to="/login" className="text-green-600 font-medium">Log in</Link> to see the forecast for your farm.
          </Notice>
        )}
        {status === "no-location" && (
          <Notice>
            Add your village or town on the{" "}
            <Link to="/farm-settings" className="text-green-600 font-medium">Farm Settings</Link> page to see its forecast.
          </Notice>
        )}
        {status === "not-found" && (
          <Notice>
            Could not find “{location}” on the map. Try the nearest town name on the{" "}
            <Link to="/farm-settings" className="text-green-600 font-medium">Farm Settings</Link> page.
          </Notice>
        )}
        {status === "error" && <Notice>Could not load the forecast: {error}</Notice>}

        {status === "ready" && forecast && place && (
          <>
            {/* Current Weather */}
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <div className="relative p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <p className="text-lg opacity-90 mb-2">
                      Now,{" "}
                      {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <div className="flex items-center space-x-4 mb-4">
                      {(() => {
                        const Icon = ICONS[weatherKind(forecast.current.code)];
                        return <Icon className="w-20 h-20" />;
                      })()}
                      <div>
                        <div className="text-6xl font-bold">{Math.round(forecast.current.temp)}°C</div>
                        <p className="text-xl opacity-90">{describeCode(forecast.current.code)}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-80">
                      {place.name}{place.region ? `, ${place.region}` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <Droplets className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Humidity</p>
                      <p className="text-2xl font-semibold">{forecast.current.humidity}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <Wind className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Wind Speed</p>
                      <p className="text-2xl font-semibold">{Math.round(forecast.current.windKmh)} km/h</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <CloudRain className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Rain, next 24 h</p>
                      <p className="text-2xl font-semibold">{forecast.rainNext24hMm} mm</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <Leaf className="w-8 h-8 mb-2" />
                      <p className="text-sm opacity-80">Crop water demand (ET₀)</p>
                      <p className="text-2xl font-semibold">{forecast.et0TodayMm.toFixed(1)} mm</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-sm opacity-80 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" /> Feels like {Math.round(forecast.current.feelsLike)}°C
                </p>
              </div>
            </div>

            {/* Temperature Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                7-Day Temperature & Humidity Forecast
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={forecast.daily.map((d) => ({
                    day: weekday(d.date, "short"),
                    temp: d.tempMax,
                    humidity: d.humidity,
                  }))}
                >
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
                  <Legend />
                  <Line
                    key="temp"
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Max temperature (°C)"
                    dot={{ fill: "#F59E0B", r: 5 }}
                  />
                  <Line
                    key="humidity"
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Mean humidity (%)"
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
                {forecast.daily.map((day) => {
                  const Icon = ICONS[weatherKind(day.code)];
                  return (
                    <div
                      key={day.date}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                        {weekday(day.date, "long")}
                      </p>
                      <Icon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
                        {Math.round(day.tempMax)}°C
                      </p>
                      <p className="text-xs text-gray-500 text-center mb-2">min {Math.round(day.tempMin)}°C</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                        {describeCode(day.code)}
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rainChance}% · {day.rainMm.toFixed(1)} mm</span>
                      </div>
                      <p className="text-xs text-center text-green-700 dark:text-green-400 mt-1">
                        ET₀ {day.et0Mm.toFixed(1)} mm
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Farming Tips */}
            <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-3">
                🌱 Farming Tips Based on the Forecast
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-300">
                {farmingTips(forecast.daily).map((tip) => (
                  <li key={tip} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Weather data by{" "}
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">
                Open-Meteo.com
              </a>{" "}
              (CC BY 4.0).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
