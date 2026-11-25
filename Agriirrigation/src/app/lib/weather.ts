/**
 * Weather from Open-Meteo (https://open-meteo.com): free, no API key.
 * Used by the Weather page and by the irrigation engine (ET₀ and rain forecast).
 */

export interface Place {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface DailyForecast {
  date: string;          // YYYY-MM-DD (farm's local date)
  code: number;          // WMO weather code
  tempMax: number;
  tempMin: number;
  humidity: number;      // daily mean %
  rainMm: number;
  rainChance: number;    // %
  et0Mm: number;         // reference evapotranspiration, mm/day
}

export interface Forecast {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windKmh: number;
    code: number;
  };
  rainNext24hMm: number;
  et0TodayMm: number;
  daily: DailyForecast[];
  fetchedAt: number;
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_MS = 30 * 60 * 1000;

const forecastCache = new Map<string, Forecast>();

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: skip caching */
  }
}

/**
 * Turn a typed farm location such as "Gadhinglaj, Kolhapur" into coordinates.
 * Open-Meteo searches by place name, so each comma-separated part is tried in turn.
 */
export async function geocode(location: string): Promise<Place | null> {
  const key = `geo:${location.trim().toLowerCase()}`;
  const cached = readStore(key);
  if (cached) return JSON.parse(cached) as Place;

  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(part)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const hit = (await res.json()).results?.[0];
    if (hit) {
      const place: Place = {
        name: hit.name,
        region: [hit.admin1, hit.country].filter(Boolean).join(", "),
        latitude: hit.latitude,
        longitude: hit.longitude,
      };
      writeStore(key, JSON.stringify(place));
      return place;
    }
  }
  return null;
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = forecastCache.get(key);
  if (hit && Date.now() - hit.fetchedAt < CACHE_MS) return hit;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code",
    hourly: "precipitation",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean," +
      "precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error(`Weather service error (${res.status})`);
  const d = await res.json();

  // Rain over the next 24 hours, starting at the current local hour.
  const nowHour = String(d.current.time).slice(0, 13) + ":00";
  const start = Math.max(0, (d.hourly.time as string[]).indexOf(nowHour));
  const rainNext24hMm = (d.hourly.precipitation as (number | null)[])
    .slice(start, start + 24)
    .reduce<number>((sum, v) => sum + (v ?? 0), 0);

  const daily: DailyForecast[] = (d.daily.time as string[]).map((date, i) => ({
    date,
    code: d.daily.weather_code[i],
    tempMax: d.daily.temperature_2m_max[i],
    tempMin: d.daily.temperature_2m_min[i],
    humidity: d.daily.relative_humidity_2m_mean[i],
    rainMm: d.daily.precipitation_sum[i] ?? 0,
    rainChance: d.daily.precipitation_probability_max[i] ?? 0,
    et0Mm: d.daily.et0_fao_evapotranspiration[i] ?? 0,
  }));

  const forecast: Forecast = {
    current: {
      temp: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      windKmh: d.current.wind_speed_10m,
      code: d.current.weather_code,
    },
    rainNext24hMm: Math.round(rainNext24hMm * 10) / 10,
    et0TodayMm: daily[0]?.et0Mm ?? 0,
    daily,
    fetchedAt: Date.now(),
  };
  forecastCache.set(key, forecast);
  return forecast;
}

/** Plain-language label for a WMO weather code. */
export function describeCode(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

export type WeatherKind = "clear" | "cloudy" | "rain" | "snow" | "storm";

export function weatherKind(code: number): WeatherKind {
  if (code <= 1) return "clear";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 51) return "rain";
  return "cloudy";
}
