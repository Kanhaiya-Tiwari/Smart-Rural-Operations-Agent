/**
 * useMandiDirect – fetches live mandi prices from data.gov.in Agmarknet API (free, no key needed for public access)
 * Falls back to smart estimates based on crop + season if API is unavailable.
 */
import { useEffect, useState, useRef } from "react";
import { getCurrentSeason } from "@/data/cropData";

export interface MandiPrice {
  crop: string;
  mandiName: string;
  state: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: "up" | "down" | "stable";
  arrivalDate: string;
  source: "live" | "estimate";
}

// MSP / Base prices per quintal (INR) – updated for 2024-25
const BASE_PRICES: Record<string, number> = {
  wheat: 2275, rice: 2183, paddy: 2183, maize: 2090, sorghum: 3371,
  bajra: 2625, barley: 1735, ragi: 4290, oats: 2000,
  chickpea: 5440, lentil: 6425, "pigeon pea": 7550, moong: 8682,
  urad: 7400, peas: 3400, cowpea: 5000,
  soybean: 4892, groundnut: 6783, mustard: 5650, sunflower: 7280,
  sesame: 9267, linseed: 5800, castor: 6170, safflower: 5800,
  tomato: 1500, potato: 1200, onion: 2000, garlic: 4000,
  cauliflower: 1000, cabbage: 800, brinjal: 1200, okra: 1500,
  cotton: 7121, sugarcane: 340, jute: 5050, tobacco: 10000,
  turmeric: 8000, coriander: 7400, cumin: 21000, chilli: 12000, ginger: 8000,
  cardamom: 180000, fenugreek: 5000,
  cashew: 80000, coconut: 15000, walnut: 60000, almond: 100000,
  mango: 3000, banana: 2000, guava: 2500, papaya: 1500, pomegranate: 8000,
};

function getEstimatedPrice(crop: string): number {
  const key = crop.toLowerCase().replace(/\s*\(.*?\)/g, "").trim();
  return BASE_PRICES[key] ?? 3000;
}

function getSeasonalMultiplier(): number {
  const season = getCurrentSeason();
  const month = new Date().getMonth() + 1;
  // Prices typically spike in off-season
  if (season === "zaid") return 1.08;
  if (season === "rabi" && month <= 2) return 1.05;
  return 1.0;
}

// Try data.gov.in Agmarknet without API key (limited public access)
async function fetchAgmarknet(crop: string, district: string): Promise<MandiPrice | null> {
  try {
    const commodity = crop.trim();
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?format=json&limit=20&filters[commodity]=${encodeURIComponent(commodity)}&filters[district]=${encodeURIComponent(district)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const data = await r.json();
    const records: Array<Record<string, string>> = data.records ?? [];
    if (!records.length) return null;
    const rec = records[0];
    const modal = parseInt(String(rec.modal_price ?? "0").replace(",", ""), 10);
    const min = parseInt(String(rec.min_price ?? "0").replace(",", ""), 10);
    const max = parseInt(String(rec.max_price ?? "0").replace(",", ""), 10);
    if (!modal) return null;
    return {
      crop,
      mandiName: rec.market ?? `${district} Mandi`,
      state: rec.state ?? "India",
      district: rec.district ?? district,
      minPrice: min,
      maxPrice: max,
      modalPrice: modal,
      trend: "stable",
      arrivalDate: rec.arrival_date ?? new Date().toLocaleDateString("en-IN"),
      source: "live",
    };
  } catch {
    return null;
  }
}

const CACHE: Record<string, { data: MandiPrice; ts: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 min

export function useMandiDirect(crop: string, location: string) {
  const [mandi, setMandi] = useState<MandiPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const key = `${crop}::${location}`;
  const prevKey = useRef("");

  useEffect(() => {
    if (!crop || !location || key === prevKey.current) return;
    prevKey.current = key;

    const cached = CACHE[key];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setMandi(cached.data);
      return;
    }

    setLoading(true);
    setError("");

    const district = location.split(",")[0].trim();

    (async () => {
      // Try live Agmarknet
      const live = await fetchAgmarknet(crop, district);
      if (live) {
        CACHE[key] = { data: live, ts: Date.now() };
        setMandi(live);
        setLoading(false);
        return;
      }

      // Fallback: smart estimate
      const base = getEstimatedPrice(crop);
      const mult = getSeasonalMultiplier();
      const modal = Math.round(base * mult);
      const variance = Math.round(modal * 0.06);
      // Add small random day drift (deterministic per date)
      const dayDrift = ((new Date().getDate() * 37 + new Date().getMonth() * 13) % 7) - 3;
      const adjusted = modal + dayDrift * Math.round(modal / 100);
      const estimated: MandiPrice = {
        crop,
        mandiName: `${district} Mandi (Estimated)`,
        state: location.split(",")[1]?.trim() ?? "India",
        district,
        minPrice: adjusted - variance,
        maxPrice: adjusted + variance,
        modalPrice: adjusted,
        trend: dayDrift >= 0 ? "up" : "down",
        arrivalDate: new Date().toLocaleDateString("en-IN"),
        source: "estimate",
      };
      CACHE[key] = { data: estimated, ts: Date.now() };
      setMandi(estimated);
      setLoading(false);
    })();
  }, [key, crop, location]);

  return { mandi, loading, error };
}

// Hook for multiple crops
export function useMultiMandiDirect(crops: string[], location: string) {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const key = `${crops.join(",")}::${location}`;
  const prevKey = useRef("");

  useEffect(() => {
    if (!crops.length || !location || key === prevKey.current) return;
    prevKey.current = key;
    setLoading(true);

    const district = location.split(",")[0].trim();

    Promise.all(
      crops.slice(0, 5).map(async (crop) => {
        const cached = CACHE[`${crop}::${location}`];
        if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

        const live = await fetchAgmarknet(crop, district);
        if (live) {
          CACHE[`${crop}::${location}`] = { data: live, ts: Date.now() };
          return live;
        }

        const base = getEstimatedPrice(crop);
        const modal = Math.round(base * getSeasonalMultiplier());
        const variance = Math.round(modal * 0.05);
        const dayDrift = ((new Date().getDate() * 31 + new Date().getMonth() * 17 + crop.length * 7) % 9) - 4;
        const adj = modal + dayDrift * Math.round(modal / 100);
        const est: MandiPrice = {
          crop,
          mandiName: `${district} Mandi (Est.)`,
          state: "", district,
          minPrice: adj - variance,
          maxPrice: adj + variance,
          modalPrice: adj,
          trend: dayDrift >= 0 ? "up" : "down",
          arrivalDate: new Date().toLocaleDateString("en-IN"),
          source: "estimate",
        };
        CACHE[`${crop}::${location}`] = { data: est, ts: Date.now() };
        return est;
      })
    ).then((results) => {
      setPrices(results);
      setLoading(false);
    });
  }, [key, crops, location]);

  return { prices, loading };
}
