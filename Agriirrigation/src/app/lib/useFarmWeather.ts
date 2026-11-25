import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore as db } from "../../firebase/firebase";
import { geocode, getForecast, type Forecast, type Place } from "./weather";

export type FarmWeatherStatus = "loading" | "no-user" | "no-location" | "not-found" | "error" | "ready";

export interface FarmWeather {
  status: FarmWeatherStatus;
  location: string | null;
  place: Place | null;
  forecast: Forecast | null;
  error: string | null;
}

/**
 * Forecast for the signed-in user's farm. The location is the text saved on
 * the Farm Setup page (or, failing that, the profile location).
 */
export function useFarmWeather(): FarmWeather {
  const [state, setState] = useState<FarmWeather>({
    status: "loading",
    location: null,
    place: null,
    forecast: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const set = (next: Partial<FarmWeather>) => {
      if (!cancelled) setState((prev) => ({ ...prev, ...next }));
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return set({ status: "no-user" });
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data() ?? {};
        const location: string = (data.farmLocation || data.location || "").trim();
        if (!location) return set({ status: "no-location", location: null });

        const place = await geocode(location);
        if (!place) return set({ status: "not-found", location });

        const forecast = await getForecast(place.latitude, place.longitude);
        set({ status: "ready", location, place, forecast, error: null });
      } catch (e) {
        set({ status: "error", error: e instanceof Error ? e.message : String(e) });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
