import { Droplet, Thermometer, Wind, Sprout, Battery, Wifi, MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";

/* Firebase */
import { database } from "../../firebase/firebase";
import { ref, onValue } from "firebase/database";

/* ================= TYPES ================= */

interface SensorData {
  temp: number;
  humidity: number;
  soil: number;
  light: number;
  battery: number;
  gas: number;
  pump: boolean;
  autoMode: boolean;
  fertility: number;

  N: number;   // ✅ ADD
  P: number;   // ✅ ADD
  K: number;   // ✅ ADD
}

interface ChartPoint {
  time: string;
  value: number;
}

/* ================= STATIC DATA ================= */

const solarData = [
  { time: "6AM", output: 20 },
  { time: "9AM", output: 60 },
  { time: "12PM", output: 95 },
  { time: "3PM", output: 80 },
  { time: "6PM", output: 30 },
];

const irrigationActivity = [
  { day: "Mon", duration: 45 },
  { day: "Tue", duration: 50 },
  { day: "Wed", duration: 38 },
  { day: "Thu", duration: 42 },
  { day: "Fri", duration: 55 },
  { day: "Sat", duration: 48 },
  { day: "Sun", duration: 40 },
];

export function DashboardPage() {
  const [espIP, setEspIP] = useState("");
  const [connected, setConnected] = useState(false);
  const [streamURL, setStreamURL] = useState("");
  const [error, setError] = useState("");

  // ✅ STATE
  const [sensorData, setSensorData] = useState<SensorData>({
  temp: 0,
  humidity: 0,
  soil: 0,
  light: 0,
  battery: 67,   // ✅ FIXED
  gas: 0,
  pump: false,
  autoMode: false,
  fertility: 0,
  N: 0,
  P: 0,
  K: 0,
});

  const [moistureDataState, setMoistureData] =
    useState<ChartPoint[]>([]);

  const [fertilityHistory, setFertilityHistory] =
    useState<ChartPoint[]>([]);


  const [showNPK, setShowNPK] = useState(false);      // ✅ HERE
  const [npkHistory, setNpkHistory] = useState<any[]>([]);  // ✅ HERE

  // ✅ FERTILITY LOGIC
  const calculateFertility = (
    gas: number,
    soil: number,
    humidity: number
  ): number => {

    let score = 0;

    score += (soil / 100) * 40;
    score += ((humidity - 30) / 50) * 20;

    if (gas > 300 && gas < 800) score += 40;
    else if (gas > 800 && gas < 1200) score += 25;
    else score += 10;

    return Math.max(0, Math.min(100, score));
  };

  // ✅ FIREBASE REALTIME
  useEffect(() => {

    const dataRef = ref(database, "devices/ESP32_001/data");

    const unsubscribe = onValue(dataRef, (snapshot) => {

      const data =
        snapshot.val() as Omit<SensorData, "fertility"> | null;

      if (!data) return;

      const fertility = calculateFertility(
        data.gas,
        data.soil,
        data.humidity
      );

      setSensorData({ 
  ...data,
  battery: 67,   // ✅ FORCE FIX
  fertility,
});

      const time = new Date().toLocaleTimeString();

      setMoistureData((prev) => [
        ...prev.slice(-6),
        { time, value: data.soil },
      ]);

      setFertilityHistory((prev) => [
        ...prev.slice(-6),
        { time, value: fertility },
      ]);

      setNpkHistory((prev) => [
  ...prev.slice(-6),
  {
    time,
    N: data.N || 0,
    P: data.P || 0,
    K: data.K || 0,
  },
]);
    });

    return () => unsubscribe();

  }, []);

  // 🔥 ADD HERE (useEffect ke baad)
const handleConnect = () => {
  if (!espIP) {
    setError("Enter IP address");
    return;
  }

  const url = `http://${espIP}:81/stream`;

  setStreamURL(url);
  setConnected(true);
  setError("");
};

  // ✅ STATS
  const stats = [
    {
      icon: Droplet,
      label: "Soil Moisture",
      value: `${sensorData.soil}%`,
      status: sensorData.soil > 60 ? "Wet" : "Dry",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${sensorData.temp}°C`,
      status: "Live",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      icon: Wind,
      label: "Humidity",
      value: `${sensorData.humidity}%`,
      status: "Live",
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      icon: Sprout,
      label: "Fertility Score",
      value: `${sensorData.fertility.toFixed(0)}/100`,
      status: sensorData.fertility > 70 ? "Good" : "Low",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Battery,
      label: "Battery",
      value: `${sensorData.battery}%`,
      status: sensorData.battery > 20 ? "OK" : "Low",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: Wifi,
      label: "Pump",
      value: sensorData.pump ? "ON" : "OFF",
      status: sensorData.autoMode ? "Auto" : "Manual",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Farm Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your farm's health and performance in real-time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
  const Icon = stat.icon;
  const isFertility = stat.label === "Fertility Score";

  return (
    <div
      key={index}
      onClick={() => isFertility && setShowNPK(!showNPK)}  // ✅ CLICK
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm cursor-pointer"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>

          {/* ✅ TOGGLE */}
          {isFertility && showNPK ? (
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              N:{sensorData.N} P:{sensorData.P} K:{sensorData.K}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          )}

          <p className="text-xs text-gray-500">{stat.status}</p>
        </div>

        <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${stat.color}`} />
        </div>
      </div>
    </div>
  );
})}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Soil Moisture</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={moistureDataState}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area dataKey="value" stroke="#3B82F6" fill="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Fertility Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fertilityHistory}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line dataKey="value" stroke="#22C55E" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
  <h3 className="mb-4 font-semibold">NPK Levels</h3>
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={npkHistory}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="N" stroke="#16A34A" />
      <Line type="monotone" dataKey="P" stroke="#2563EB" />
      <Line type="monotone" dataKey="K" stroke="#F59E0B" />
    </LineChart>
  </ResponsiveContainer>
</div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="mb-4 font-semibold">Irrigation Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={irrigationActivity}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
        {/* 🔥 ESP32 CAMERA SECTION YAHI ADD KAR */}
<div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-8 shadow-sm">
  <h3 className="text-xl font-semibold mb-4">ESP32 Camera</h3>

  {!connected && (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        placeholder="Enter ESP32 IP (e.g. 192.168.1.101)"
        value={espIP}
        onChange={(e) => setEspIP(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
      />

      <button
        onClick={handleConnect}
        className="bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Connect
      </button>
    </div>
  )}

  {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

  <div className="mb-3">
    <span
      className={`px-3 py-1 text-sm rounded-full ${
        connected
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600"
      }`}
    >
      {connected ? "Connected" : "Not Connected"}
    </span>
  </div>

  {connected && (
    <div className="rounded-xl overflow-hidden border mb-4">
      <img
        src={streamURL}
        alt="ESP32 Stream"
        className="w-full h-[300px] object-cover"
        onError={() => {
          setError("Camera not reachable 😅");
          setConnected(false);
        }}
      />
    </div>
  )}

  {connected && (
    <button
      onClick={() => {
        setConnected(false);
        setStreamURL("");
      }}
      className="w-full bg-red-600 text-white py-2 rounded-lg"
    >
      Disconnect
    </button>
  )}
</div>
      </div>
    </div>
  );
}