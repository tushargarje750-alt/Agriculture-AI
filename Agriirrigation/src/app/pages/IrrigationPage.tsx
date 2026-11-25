import { Droplet, Play, Square, Zap, Timer, Activity, Gauge, AlertTriangle, CloudRain, Leaf } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

/*firebase*/
import { database } from "../../firebase/firebase";
import { ref, onValue, set } from "firebase/database";

import { postJson } from "../lib/api";
import { useFarmWeather } from "../lib/useFarmWeather";

const DEVICE = "devices/ESP32_001";
const FLOW_RATE_LPM = 12.5; // matches FLOW_RATE_LPM in backend/irrigation_engine.py

interface IrrigationRec {
  should_irrigate: boolean;
  urgency: "none" | "low" | "medium" | "high" | "critical";
  delay_hours: number;
  duration_minutes: number;
  estimated_water_liters: number;
  reasons: string[];
  warnings: string[];
  inputs_used: string[];
}

interface TrendPoint {
  time: string;
  moisture: number;
}

export function IrrigationPage() {
  const [irrigationStatus, setIrrigationStatus] = useState<"idle" | "running" | "auto">("idle");
  const [duration, setDuration] = useState(0);
  const [waterFlow, setWaterFlow] = useState(0);
  const [sensorData, setSensorData] = useState({
    soil: 0,
    temp: 0,
    humidity: 0,
    pump: false,
  });
  const [hasReading, setHasReading] = useState(false);
  const [moistureTrend, setMoistureTrend] = useState<TrendPoint[]>([]);
  const [recommendation, setRecommendation] = useState<IrrigationRec | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const lastRequestKey = useRef("");

  const weather = useFarmWeather();
  const forecast = weather.status === "ready" ? weather.forecast : null;

  // Run timer while the pump is on (flow is the pump's rated flow, not a measurement)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (irrigationStatus === "running") {
      setWaterFlow(FLOW_RATE_LPM);
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } else {
      setDuration(0);
      setWaterFlow(0);
    }
    return () => clearInterval(interval);
  }, [irrigationStatus]);

  // Live sensor readings from the ESP32 via Firebase Realtime Database
  useEffect(() => {
    const dataRef = ref(database, `${DEVICE}/data`);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const reading = {
        soil: Number(data.soil ?? 0),
        temp: Number(data.temp ?? 25),
        humidity: Number(data.humidity ?? 60),
        pump: Boolean(data.pump),
      };
      setSensorData(reading);
      setHasReading(true);
      setMoistureTrend((prev) => [
        ...prev.slice(-19),
        { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), moisture: reading.soil },
      ]);

      if (data.autoMode) setIrrigationStatus("auto");
      else if (data.pump) setIrrigationStatus("running");
      else setIrrigationStatus("idle");
    });

    return () => unsubscribe();
  }, []);

  // Ask the engine again when soil moisture moves by 2% or a new forecast arrives
  useEffect(() => {
    if (!hasReading) return;
    const key = `${Math.round(sensorData.soil / 2)}|${forecast?.fetchedAt ?? "none"}`;
    if (key === lastRequestKey.current) return;
    lastRequestKey.current = key;

    const fetchRec = async () => {
      setRecLoading(true);
      try {
        const rec = await postJson<IrrigationRec>("/irrigation/recommend", {
          soil: sensorData.soil,
          temp: sensorData.temp,
          humidity: sensorData.humidity,
          hour: new Date().getHours(),
          ...(forecast && {
            et0_mm: forecast.et0TodayMm,
            rain_mm_24h: forecast.rainNext24hMm,
          }),
        });
        setRecommendation(rec);
        setRecError(null);
      } catch (e) {
        setRecError(e instanceof Error ? e.message : "Backend not reachable");
        lastRequestKey.current = ""; // retry on the next reading
      } finally {
        setRecLoading(false);
      }
    };

    fetchRec();
  }, [hasReading, sensorData.soil, sensorData.temp, sensorData.humidity, forecast]);

  const sendCommand = (irrigation: "ON" | "OFF" | "NONE", autoMode: boolean) => {
    set(ref(database, `${DEVICE}/commands/irrigation`), irrigation);
    set(ref(database, `${DEVICE}/commands/autoMode`), autoMode);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Irrigation Control
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and monitor your farm's irrigation system
          </p>
        </div>

        {/* Live Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Moisture */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="w-8 h-8" />
              <span className="text-sm opacity-80">{hasReading ? "Live" : "Waiting for sensor"}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{hasReading ? `${sensorData.soil}%` : "—"}</div>
            <p className="text-sm opacity-90">Soil Moisture</p>
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${sensorData.soil}%` }}
              ></div>
            </div>
          </div>

          {/* Water Flow */}
          <div className={`rounded-xl p-6 shadow-lg text-white transition-all duration-500 ${
            irrigationStatus === "running"
              ? "bg-gradient-to-br from-green-500 to-green-600 animate-pulse"
              : "bg-gradient-to-br from-gray-400 to-gray-500"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8" />
              <span className="text-sm opacity-80">Rated flow</span>
            </div>
            <div className="text-3xl font-bold mb-1">{waterFlow.toFixed(1)} L/m</div>
            <p className="text-sm opacity-90">Pump flow rate</p>
            {irrigationStatus === "running" && (
              <div className="mt-3 flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-8 h-8" />
              <span className="text-sm opacity-80">Duration</span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatTime(duration)}</div>
            <p className="text-sm opacity-90">Running Time</p>
          </div>

          {/* Water Used */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="w-8 h-8" />
              <span className="text-sm opacity-80">Estimated</span>
            </div>
            <div className="text-3xl font-bold mb-1">{(waterFlow * duration / 60).toFixed(0)}L</div>
            <p className="text-sm opacity-90">Water used this run</p>
          </div>
        </div>

        {/* Smart Irrigation Recommendation */}
        <div className={`rounded-xl p-6 shadow-lg text-white mb-8 ${
          recommendation?.urgency === "critical" ? "bg-gradient-to-br from-red-500 to-red-600" :
          recommendation?.urgency === "high"     ? "bg-gradient-to-br from-orange-500 to-orange-600" :
          recommendation?.should_irrigate        ? "bg-gradient-to-br from-green-500 to-green-600" :
                                                   "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">Irrigation Recommendation</h3>
                {recLoading && <span className="text-sm opacity-70 animate-pulse">Analysing…</span>}
              </div>

              {recommendation ? (
                <>
                  {/* Primary recommendation */}
                  <p className="mb-3 opacity-95 font-medium">
                    {recommendation.should_irrigate
                      ? `Irrigate ${recommendation.delay_hours === 0 ? "immediately" : `in ${recommendation.delay_hours}h`} — run for ${recommendation.duration_minutes} min (~${recommendation.estimated_water_liters}L)`
                      : `No irrigation needed — next check in ${recommendation.delay_hours}h`}
                  </p>

                  {/* Reasons */}
                  <ul className="mb-3 space-y-1">
                    {recommendation.reasons.map((r, i) => (
                      <li key={i} className="text-sm opacity-90 flex items-start gap-1">
                        <span className="mt-0.5">•</span> {r}
                      </li>
                    ))}
                  </ul>

                  {/* Warnings */}
                  {recommendation.warnings.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      {recommendation.warnings.map((w, i) => (
                        <p key={i} className="text-sm flex items-start gap-1">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Urgency: {recommendation.urgency}
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Duration: {recommendation.duration_minutes} min
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      Water: ~{recommendation.estimated_water_liters}L
                    </span>
                  </div>
                  <p className="mt-3 text-xs opacity-80">
                    Based on: {recommendation.inputs_used.join(", ")}
                  </p>
                </>
              ) : (
                <p className="opacity-80">
                  {recLoading
                    ? "Getting a recommendation…"
                    : recError
                    ? `Could not reach the backend: ${recError}`
                    : "Waiting for the first sensor reading from the field."}
                </p>
              )}
              {recommendation && recError && (
                <p className="mt-2 text-xs opacity-80">Last update failed: {recError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Irrigation Control Panel
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Start Button */}
            <button
              onClick={() => sendCommand("ON", false)}
              disabled={irrigationStatus === "running"}
              className={`group relative p-8 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                irrigationStatus === "running"
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 shadow-xl shadow-green-500/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                irrigationStatus === "running"
                  ? "bg-green-500 animate-pulse"
                  : "bg-green-100 dark:bg-green-900/30 group-hover:bg-green-500 group-hover:scale-110"
              }`}>
                <Play className={`w-9 h-9 transition-colors ${
                  irrigationStatus === "running"
                    ? "text-white"
                    : "text-green-600 dark:text-green-400 group-hover:text-white"
                }`} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Start Irrigation
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manual control</p>
              </div>
              {irrigationStatus === "running" && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={() => sendCommand("OFF", false)}
              disabled={irrigationStatus === "idle"}
              className={`group relative p-8 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                irrigationStatus === "idle"
                  ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 shadow-xl shadow-red-500/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-red-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                irrigationStatus === "idle"
                  ? "bg-red-500"
                  : "bg-red-100 dark:bg-red-900/30 group-hover:bg-red-500 group-hover:scale-110"
              }`}>
                <Square className={`w-9 h-9 transition-colors ${
                  irrigationStatus === "idle"
                    ? "text-white"
                    : "text-red-600 dark:text-red-400 group-hover:text-white"
                }`} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Stop Irrigation
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Turn the pump off</p>
              </div>
            </button>

            {/* Auto Mode Button */}
            <button
              onClick={() => sendCommand("NONE", true)}
              className={`group relative p-8 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                irrigationStatus === "auto"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 shadow-xl shadow-blue-500/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-lg"
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                irrigationStatus === "auto"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500 group-hover:scale-110"
              }`}>
                <Zap className={`w-9 h-9 transition-colors ${
                  irrigationStatus === "auto"
                    ? "text-white"
                    : "text-blue-600 dark:text-blue-400 group-hover:text-white"
                }`} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Auto Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Let the ESP32 control the pump</p>
              </div>
              {irrigationStatus === "auto" && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Enhanced Status Display */}
          <div className={`p-6 rounded-xl transition-all duration-500 ${
            irrigationStatus === "running"
              ? "bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20 border-2 border-green-500"
              : irrigationStatus === "auto"
              ? "bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 border-2 border-blue-500"
              : "bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  irrigationStatus === "running"
                    ? "bg-green-500"
                    : irrigationStatus === "auto"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}></div>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  System Status:
                </span>
              </div>
              <span className={`px-6 py-3 rounded-full text-base font-bold transition-all ${
                irrigationStatus === "running"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                  : irrigationStatus === "auto"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}>
                {irrigationStatus === "running"
                  ? "🟢 Irrigation Running"
                  : irrigationStatus === "auto"
                  ? "⚡ Auto Mode Active"
                  : "⚫ System Idle"}
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Moisture Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Moisture Trend (since this page opened)
              </h3>
              <Droplet className="w-5 h-5 text-blue-500" />
            </div>
            {moistureTrend.length < 2 ? (
              <p className="text-sm text-gray-500 py-24 text-center">
                The trend appears after a few sensor readings.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moistureTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    key="moisture"
                    type="monotone"
                    dataKey="moisture"
                    name="Soil moisture (%)"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Forecast used by the engine */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weather Used for the Recommendation
            </h3>
            {forecast && weather.place ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weather.place.name}{weather.place.region ? `, ${weather.place.region}` : ""} · Open-Meteo forecast
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
                    <Leaf className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {forecast.et0TodayMm.toFixed(1)} mm
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Crop water demand today (ET₀)</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                    <CloudRain className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {forecast.rainNext24hMm} mm
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rain expected, next 24 h</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ET₀ is the FAO-56 reference evapotranspiration: how much water a well-watered
                  grass crop would lose today. Rain of 5 mm or more lets the engine skip a light irrigation.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weather.status === "loading"
                  ? "Loading the forecast…"
                  : weather.status === "error"
                  ? `Forecast unavailable (${weather.error}). The recommendation uses sensor data only.`
                  : <>Add your farm location in <Link to="/farm-settings" className="text-green-600 font-medium">Farm Settings</Link> to include rain and evapotranspiration in the recommendation.</>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
