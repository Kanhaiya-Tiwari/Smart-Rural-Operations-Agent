/**
 * useWeatherDirect – fetches real weather directly from Open-Meteo (free, no API key)
 * and Nominatim for geocoding. Works without any backend running.
 */
import { useEffect, useState, useRef } from "react";

export interface WeatherNow {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;   // e.g. "Rain", "Clear"
  conditionHi: string; // Hindi
  uvIndex: number;
  visibility: number;
  rainMm: number;      // last-hour rain mm
  forecastDays: ForecastDay[];
  source: "open-meteo" | "cache" | "fallback";
  lat?: number;
  lon?: number;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  conditionHi: string;
  emoji: string;
  rainMm: number;
  rainPct: number; // probability %
}

const WMO_MAP: Record<number, { en: string; hi: string; emoji: string }> = {
  0: { en: "Clear Sky", hi: "साफ आसमान", emoji: "☀️" },
  1: { en: "Mainly Clear", hi: "अधिकतर साफ", emoji: "🌤️" },
  2: { en: "Partly Cloudy", hi: "आंशिक बादल", emoji: "⛅" },
  3: { en: "Overcast", hi: "घने बादल", emoji: "☁️" },
  45: { en: "Foggy", hi: "धुंध", emoji: "🌫️" },
  48: { en: "Foggy", hi: "धुंध", emoji: "🌫️" },
  51: { en: "Light Drizzle", hi: "हल्की फुहार", emoji: "🌦️" },
  53: { en: "Drizzle", hi: "फुहार", emoji: "🌦️" },
  55: { en: "Heavy Drizzle", hi: "तेज फुहार", emoji: "🌧️" },
  61: { en: "Light Rain", hi: "हल्की बारिश", emoji: "🌧️" },
  63: { en: "Rain", hi: "बारिश", emoji: "🌧️" },
  65: { en: "Heavy Rain", hi: "तेज बारिश", emoji: "⛈️" },
  71: { en: "Snow", hi: "बर्फ", emoji: "❄️" },
  73: { en: "Snow", hi: "बर्फ", emoji: "❄️" },
  75: { en: "Heavy Snow", hi: "तेज बर्फ", emoji: "🌨️" },
  80: { en: "Rain Showers", hi: "बारिश के झोंके", emoji: "🌦️" },
  81: { en: "Rain Showers", hi: "बारिश के झोंके", emoji: "🌧️" },
  82: { en: "Heavy Showers", hi: "तेज झोंके", emoji: "⛈️" },
  95: { en: "Thunderstorm", hi: "आंधी-तूफान", emoji: "⛈️" },
  96: { en: "Thunderstorm", hi: "आंधी-तूफान", emoji: "⛈️" },
  99: { en: "Thunderstorm", hi: "आंधी-तूफान", emoji: "⛈️" },
};

function wmo(code: number) {
  return WMO_MAP[code] ?? { en: "Unknown", hi: "अज्ञात", emoji: "🌡️" };
}

const CACHE: Record<string, { data: WeatherNow; ts: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 min

async function geocode(locationStr: string): Promise<{ lat: number; lon: number; name: string } | null> {
  // Extract city name from "City, State" format
  const city = locationStr.split(",")[0].trim();
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
    );
    const data = await r.json();
    const results = data.results as Array<{ latitude: number; longitude: number; name: string; country: string }>;
    if (!results?.length) return null;
    // prefer India results
    const india = results.find((x) => x.country === "India") ?? results[0];
    return { lat: india.latitude, lon: india.longitude, name: india.name };
  } catch {
    return null;
  }
}

async function fetchWeather(lat: number, lon: number, locationStr: string): Promise<WeatherNow> {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}&` +
    `current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,rain,uv_index,visibility&` +
    `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&` +
    `timezone=auto&forecast_days=7`;

  const r = await fetch(url);
  const d = await r.json();

  const cur = d.current;
  const daily = d.daily;

  const cond = wmo(cur.weather_code ?? 0);

  const forecastDays: ForecastDay[] = (daily.time ?? []).slice(0, 7).map((_: string, i: number) => {
    const fc = wmo(daily.weather_code[i] ?? 0);
    return {
      date: daily.time[i],
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      condition: fc.en,
      conditionHi: fc.hi,
      emoji: fc.emoji,
      rainMm: daily.precipitation_sum[i] ?? 0,
      rainPct: daily.precipitation_probability_max[i] ?? 0,
    };
  });

  return {
    location: locationStr,
    temperature: Math.round(cur.temperature_2m ?? 0),
    feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
    humidity: cur.relative_humidity_2m ?? 0,
    windSpeed: Math.round((cur.wind_speed_10m ?? 0) * 10) / 10,
    condition: cond.en,
    conditionHi: cond.hi,
    uvIndex: cur.uv_index ?? 0,
    visibility: Math.round((cur.visibility ?? 0) / 1000), // km
    rainMm: cur.rain ?? 0,
    forecastDays,
    source: "open-meteo",
    lat,
    lon,
  };
}

export function useWeatherDirect(locationStr: string) {
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prevLocation = useRef("");

  useEffect(() => {
    if (!locationStr || locationStr === prevLocation.current) return;
    prevLocation.current = locationStr;

    const cached = CACHE[locationStr];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setWeather(cached.data);
      return;
    }

    setLoading(true);
    setError("");

    (async () => {
      try {
        const geo = await geocode(locationStr);
        if (!geo) throw new Error("Location not found");
        const w = await fetchWeather(geo.lat, geo.lon, locationStr);
        CACHE[locationStr] = { data: w, ts: Date.now() };
        setWeather(w);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Weather unavailable");
      } finally {
        setLoading(false);
      }
    })();
  }, [locationStr]);

  return { weather, loading, error };
}
