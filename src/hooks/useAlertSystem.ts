/**
 * useAlertSystem – Smart alert engine for farmers.
 * Evaluates weather + market data against user-defined threshold rules.
 */
import { useState, useEffect, useCallback } from "react";
import { WeatherNow } from "@/hooks/useWeatherDirect";
import { MandiPrice } from "@/hooks/useMandiDirect";
import { serviceUrl } from "@/lib/api";

export type AlertSeverity = "info" | "warning" | "danger";

export interface AlertRule {
  id: string;
  type: "weather" | "market" | "ai";
  label: string;
  labelHi: string;
  enabled: boolean;
  // Weather rules
  metric?: "temp_min" | "temp_max" | "rain_mm" | "humidity" | "wind" | "uv";
  threshold?: number;
  operator?: "lt" | "gt";
  // Market rules
  crop?: string;
  priceThreshold?: number;
  priceOperator?: "lt" | "gt";
}

export interface FiredAlert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  timestamp: Date;
  icon: string;
  isNew: boolean;
}

const STORAGE_KEY = "sroa-alert-rules";
const FIRED_KEY = "sroa-fired-alerts";
const ALERT_API = serviceUrl(8097);

const DEFAULT_RULES: AlertRule[] = [
  { id: "temp-cold", type: "weather", label: "Temperature Too Cold", labelHi: "तापमान बहुत कम", enabled: true, metric: "temp_min", threshold: 10, operator: "lt" },
  { id: "temp-hot", type: "weather", label: "Temperature Too Hot", labelHi: "तापमान बहुत अधिक", enabled: true, metric: "temp_max", threshold: 42, operator: "gt" },
  { id: "heavy-rain", type: "weather", label: "Heavy Rain Expected", labelHi: "तेज बारिश की संभावना", enabled: true, metric: "rain_mm", threshold: 25, operator: "gt" },
  { id: "high-humidity", type: "weather", label: "High Humidity (Disease Risk)", labelHi: "अधिक नमी (बीमारी खतरा)", enabled: true, metric: "humidity", threshold: 85, operator: "gt" },
  { id: "high-wind", type: "weather", label: "High Winds", labelHi: "तेज हवाएं", enabled: false, metric: "wind", threshold: 40, operator: "gt" },
  { id: "high-uv", type: "weather", label: "High UV Index", labelHi: "तेज धूप (UV)", enabled: false, metric: "uv", threshold: 8, operator: "gt" },
  { id: "ai-sell", type: "ai", label: "AI: Good time to sell", labelHi: "AI: बेचने का सही समय", enabled: true },
  { id: "ai-pest", type: "ai", label: "AI: Pest risk alert", labelHi: "AI: कीट खतरा अलर्ट", enabled: true },
];

function loadRules(): AlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RULES;
    const saved = JSON.parse(raw) as AlertRule[];
    // Merge saved with defaults (add any new default rules)
    const merged = DEFAULT_RULES.map((r) => ({ ...r }));
    for (const rule of merged) {
      const saved_rule = saved.find((r) => r.id === rule.id);
      if (saved_rule) Object.assign(rule, saved_rule);
    }

    // Keep market rules created by users.
    const dynamicSaved = saved.filter((r) => r.type === "market" && !merged.some((base) => base.id === r.id));
    return [...merged, ...dynamicSaved];
  } catch {
    return DEFAULT_RULES;
  }
}

function saveRules(rules: AlertRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

function loadFiredAlerts(): FiredAlert[] {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Omit<FiredAlert, "timestamp"> & { timestamp: string }>;
    return parsed.map((a) => ({ ...a, timestamp: new Date(a.timestamp), isNew: false }));
  } catch {
    return [];
  }
}

function saveFiredAlerts(alerts: FiredAlert[]) {
  const limited = alerts.slice(0, 50); // keep last 50
  localStorage.setItem(FIRED_KEY, JSON.stringify(limited));
}

function evaluateWeatherAlerts(rules: AlertRule[], weather: WeatherNow): FiredAlert[] {
  const fired: FiredAlert[] = [];
  for (const rule of rules) {
    if (!rule.enabled || rule.type !== "weather" || !rule.metric) continue;

    let actualValue = 0;
    switch (rule.metric) {
      case "temp_min": actualValue = weather.temperature; break;
      case "temp_max": actualValue = weather.temperature; break;
      case "rain_mm": actualValue = weather.rainMm || (weather.forecastDays[0]?.rainMm ?? 0); break;
      case "humidity": actualValue = weather.humidity; break;
      case "wind": actualValue = weather.windSpeed; break;
      case "uv": actualValue = weather.uvIndex; break;
    }

    const triggered =
      (rule.operator === "lt" && actualValue < (rule.threshold ?? 0)) ||
      (rule.operator === "gt" && actualValue > (rule.threshold ?? 0));

    if (triggered) {
      const severity: AlertSeverity =
        rule.metric === "rain_mm" && actualValue > 50 ? "danger" :
        rule.metric === "temp_max" && actualValue > 45 ? "danger" :
        rule.metric === "humidity" && actualValue > 90 ? "warning" :
        "warning";

      fired.push({
        id: `${rule.id}-${Date.now()}`,
        ruleId: rule.id,
        severity,
        title: rule.label,
        titleHi: rule.labelHi,
        message: buildWeatherMessage(rule, actualValue),
        messageHi: buildWeatherMessageHi(rule, actualValue),
        timestamp: new Date(),
        icon: getWeatherIcon(rule.metric),
        isNew: true,
      });
    }
  }
  return fired;
}

function evaluateAIAlerts(rules: AlertRule[], weather: WeatherNow, prices: MandiPrice[]): FiredAlert[] {
  const fired: FiredAlert[] = [];
  const now = new Date();

  for (const rule of rules) {
    if (!rule.enabled || rule.type !== "ai") continue;

    if (rule.id === "ai-sell") {
      // Good sell: price rising + dry weather coming
      const anyRising = prices.some((p) => p.trend === "up");
      const dryNext = weather.forecastDays.slice(1, 3).every((d) => d.rainMm < 5);
      if (anyRising && dryNext) {
        fired.push({
          id: `ai-sell-${now.getTime()}`,
          ruleId: rule.id,
          severity: "info",
          title: "Good time to sell crops",
          titleHi: "फसल बेचने का अच्छा समय",
          message: "Prices are rising and weather is dry. Consider selling this week.",
          messageHi: "भाव बढ़ रहे हैं और मौसम सूखा है। इस सप्ताह बेचने पर विचार करें।",
          timestamp: now,
          icon: "📈",
          isNew: true,
        });
      }
    }

    if (rule.id === "ai-pest") {
      // Disease risk: high humidity + warm nights
      if (weather.humidity > 75 && weather.temperature > 25) {
        fired.push({
          id: `ai-pest-${now.getTime()}`,
          ruleId: rule.id,
          severity: "warning",
          title: "Fungal/Pest risk detected",
          titleHi: "फफूंद/कीट खतरा पाया गया",
          message: `High humidity (${weather.humidity}%) with warm weather creates risk of fungal diseases. Inspect crops and consider preventive spray.`,
          messageHi: `अधिक नमी (${weather.humidity}%) और गर्म मौसम से फफूंद रोग का खतरा है। फसल की जांच करें और निवारक स्प्रे करें।`,
          timestamp: now,
          icon: "🦠",
          isNew: true,
        });
      }
    }
  }
  return fired;
}

function buildWeatherMessage(rule: AlertRule, value: number): string {
  const t = rule.threshold ?? 0;
  switch (rule.metric) {
    case "temp_min": return `Temperature is ${value}°C — below your alert threshold of ${t}°C. Protect sensitive crops from cold stress.`;
    case "temp_max": return `Temperature is ${value}°C — exceeds your alert of ${t}°C. Increase irrigation and provide shade if possible.`;
    case "rain_mm": return `Heavy rainfall of ${value}mm expected. Ensure proper field drainage to prevent waterlogging.`;
    case "humidity": return `Humidity is ${value}% — high risk of fungal diseases. Consider preventive fungicide spray.`;
    case "wind": return `Wind speed ${value} km/h — above ${t} km/h. Secure crop supports and delay spraying.`;
    case "uv": return `UV Index is ${value} — very high. Avoid working in fields between 11am-3pm.`;
    default: return `Alert triggered: current value ${value}`;
  }
}

function buildWeatherMessageHi(rule: AlertRule, value: number): string {
  const t = rule.threshold ?? 0;
  switch (rule.metric) {
    case "temp_min": return `तापमान ${value}°C है — आपकी सीमा ${t}°C से नीचे। ठंड से संवेदनशील फसलों की रक्षा करें।`;
    case "temp_max": return `तापमान ${value}°C है — आपकी सीमा ${t}°C से अधिक। सिंचाई बढ़ाएं और छाया दें।`;
    case "rain_mm": return `${value}mm तेज बारिश की संभावना। जलभराव से बचने के लिए खेत में जल निकासी सुनिश्चित करें।`;
    case "humidity": return `नमी ${value}% है — फफूंद रोगों का उच्च खतरा। निवारक कवकनाशी स्प्रे करें।`;
    case "wind": return `हवा की गति ${value} km/h है — ${t} km/h से अधिक। फसल आधार सुरक्षित करें और स्प्रे टाल दें।`;
    case "uv": return `UV Index ${value} है — बहुत अधिक। सुबह 11 से शाम 3 बजे तक खेत में काम से बचें।`;
    default: return `अलर्ट: वर्तमान मान ${value}`;
  }
}

function getWeatherIcon(metric?: string): string {
  switch (metric) {
    case "temp_min": return "🥶";
    case "temp_max": return "🌡️";
    case "rain_mm": return "🌧️";
    case "humidity": return "💧";
    case "wind": return "💨";
    case "uv": return "☀️";
    default: return "⚠️";
  }
}

export function useAlertSystem(userId: string, weather: WeatherNow | null, prices: MandiPrice[]) {
  const [rules, setRules] = useState<AlertRule[]>(loadRules);
  const [firedAlerts, setFiredAlerts] = useState<FiredAlert[]>(loadFiredAlerts);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const loadRemoteRules = async () => {
      try {
        const resp = await fetch(`${ALERT_API}/alert-rules/${userId}`);
        if (!resp.ok) return;
        const payload = (await resp.json()) as { rules: AlertRule[] };
        if (!cancelled && payload.rules?.length) {
          setRules(payload.rules);
          saveRules(payload.rules);
        }
      } catch {
        // Keep local rules when API is unavailable.
      }
    };

    loadRemoteRules();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !rules.length) return;

    const timer = window.setTimeout(async () => {
      try {
        await fetch(`${ALERT_API}/alert-rules/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rules }),
        });
      } catch {
        // Local cache remains source of truth if backend sync fails.
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [rules, userId]);

  // Evaluate rules when data changes
  useEffect(() => {
    if (!weather) return;

    const weatherAlerts = evaluateWeatherAlerts(rules, weather);
    const aiAlerts = evaluateAIAlerts(rules, weather, prices);
    const allNew = [...weatherAlerts, ...aiAlerts];

    if (allNew.length === 0) return;

    setFiredAlerts((prev) => {
      // Deduplicate by ruleId within last 1 hour
      const oneHourAgo = Date.now() - 3600_000;
      const recent = prev.filter((a) => a.timestamp.getTime() > oneHourAgo);
      const recentRuleIds = new Set(recent.map((a) => a.ruleId));
      const deduplicated = allNew.filter((a) => !recentRuleIds.has(a.ruleId));

      if (deduplicated.length === 0) return prev;
      const merged = [...deduplicated, ...prev].slice(0, 50);
      saveFiredAlerts(merged);
      setNewCount((c) => c + deduplicated.length);
      return merged;
    });
  }, [weather, prices, rules]);

  const updateRule = useCallback((id: string, changes: Partial<AlertRule>) => {
    setRules((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...changes } : r));
      saveRules(updated);
      return updated;
    });
  }, []);

  const addMarketRule = useCallback((crop: string, threshold: number, operator: "lt" | "gt") => {
    const id = `market-${crop.toLowerCase()}-${Date.now()}`;
    const newRule: AlertRule = {
      id,
      type: "market",
      label: `${crop} price ${operator === "lt" ? "falls below" : "rises above"} ₹${threshold}`,
      labelHi: `${crop} भाव ${operator === "lt" ? "₹" + threshold + " से कम" : "₹" + threshold + " से अधिक"}`,
      enabled: true,
      crop,
      priceThreshold: threshold,
      priceOperator: operator,
    };
    setRules((prev) => {
      const updated = [...prev, newRule];
      saveRules(updated);
      return updated;
    });
    return id;
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRules(updated);
      return updated;
    });
  }, []);

  const clearNewCount = useCallback(() => setNewCount(0), []);

  const markAllRead = useCallback(() => {
    setFiredAlerts((prev) => {
      const updated = prev.map((a) => ({ ...a, isNew: false }));
      saveFiredAlerts(updated);
      return updated;
    });
    setNewCount(0);
  }, []);

  // Evaluate market alerts
  useEffect(() => {
    const marketRules = rules.filter((r) => r.type === "market" && r.enabled);
    if (!marketRules.length || !prices.length) return;

    const fired: FiredAlert[] = [];
    for (const rule of marketRules) {
      const price = prices.find((p) => p.crop.toLowerCase() === rule.crop?.toLowerCase());
      if (!price) continue;
      const triggered =
        (rule.priceOperator === "lt" && price.modalPrice < (rule.priceThreshold ?? 0)) ||
        (rule.priceOperator === "gt" && price.modalPrice > (rule.priceThreshold ?? 0));

      if (triggered) {
        fired.push({
          id: `market-fired-${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          severity: rule.priceOperator === "lt" ? "warning" : "info",
          title: rule.label,
          titleHi: rule.labelHi,
          message: `${rule.crop} current price ₹${price.modalPrice}/Q at ${price.mandiName}.`,
          messageHi: `${rule.crop} का वर्तमान भाव ₹${price.modalPrice}/क्विंटल — ${price.mandiName}.`,
          timestamp: new Date(),
          icon: rule.priceOperator === "lt" ? "📉" : "📈",
          isNew: true,
        });
      }
    }

    if (fired.length) {
      setFiredAlerts((prev) => [...fired, ...prev].slice(0, 50));
      setNewCount((c) => c + fired.length);
    }
  }, [prices, rules]);

  return { rules, firedAlerts, newCount, updateRule, addMarketRule, removeRule, clearNewCount, markAllRead };
}
