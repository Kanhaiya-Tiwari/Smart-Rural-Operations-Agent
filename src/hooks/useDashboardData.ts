import { useEffect, useMemo, useState } from "react";
import { ProfileData } from "@/hooks/useProfile";
import { serviceUrl } from "@/lib/api";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  rainfall_prediction: string;
  observed_at?: string;
}

interface MarketData {
  crop: string;
  mandi_name: string;
  price: number;
  trend: "up" | "down";
  last_updated: string;
}

interface AnalysisData {
  recommendation: "sell" | "hold" | "harvest" | string;
  insight: string;
  crop_health_suggestion: string;
  risk_alerts: string[];
}

interface AlertItem {
  id?: string;
  title: string;
  message: string;
  severity: string;
  created_at?: string;
}

interface DashboardDataState {
  weather: WeatherData | null;
  market: MarketData | null;
  analysis: AnalysisData | null;
  alerts: AlertItem[];
  isLoading: boolean;
  error: string;
}

const WEATHER_API = serviceUrl(8094);
const MARKET_API = serviceUrl(8095);
const AGENT_API = serviceUrl(8096);
const ALERT_API = serviceUrl(8097);

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, init);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    let message = body || `Request failed: ${resp.status}`;

    try {
      const parsed = JSON.parse(body) as { detail?: string };
      if (parsed.detail) {
        message = parsed.detail;
      }
    } catch {
      // Use raw body text when the error response is not JSON.
    }

    throw new Error(message);
  }
  return (await resp.json()) as T;
}

export function useDashboardData(profile: ProfileData) {
  const [state, setState] = useState<DashboardDataState>({
    weather: null,
    market: null,
    analysis: null,
    alerts: [],
    isLoading: false,
    error: "",
  });

  const primaryCrop = useMemo(() => profile.crops[0] || "wheat", [profile.crops]);
  const effectiveLocation = useMemo(
    () => (profile.location && profile.location.trim() ? profile.location : "Bhopal, Madhya Pradesh"),
    [profile.location]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((s) => ({ ...s, isLoading: true }));

      try {
        const [weatherResult, marketResult] = await Promise.allSettled([
          getJson<WeatherData>(`${WEATHER_API}/weather?location=${encodeURIComponent(effectiveLocation)}`),
          getJson<MarketData>(`${MARKET_API}/market-price?crop=${encodeURIComponent(primaryCrop)}&location=${encodeURIComponent(effectiveLocation)}`),
        ]);

        const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
        const market = marketResult.status === "fulfilled" ? marketResult.value : null;

        let analysis: AnalysisData | null = null;
        if (weather && market) {
          analysis = await getJson<AnalysisData>(`${AGENT_API}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: profile.userId,
              crops: profile.crops,
              weather,
              market,
            }),
          });

          await getJson<{ status: string }>(`${ALERT_API}/alerts/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: profile.userId,
              weather,
              market,
              analysis,
            }),
          });
        }

        const alertsResp = profile.userId
          ? await getJson<{ alerts: AlertItem[] }>(`${ALERT_API}/alerts/${profile.userId}?limit=10`).catch(() => ({ alerts: [] }))
          : { alerts: [] };

        const errors = [weatherResult, marketResult]
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
          .map((result) => result.reason instanceof Error ? result.reason.message : "Unknown live data error");

        const locationNotice = !profile.location?.trim()
          ? "Profile location missing. Showing default data for Bhopal, Madhya Pradesh."
          : "";

        if (!cancelled) {
          setState({
            weather,
            market,
            analysis,
            alerts: alertsResp.alerts,
            isLoading: false,
            error: [locationNotice, ...errors].filter(Boolean).join(" | "),
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            isLoading: false,
            error: e instanceof Error ? e.message : "Failed to load live dashboard data",
          }));
        }
      }
    };

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [effectiveLocation, primaryCrop, profile.crops, profile.location, profile.userId]);

  return state;
}
