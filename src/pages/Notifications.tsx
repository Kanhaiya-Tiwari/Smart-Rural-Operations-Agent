import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bell, CloudRain, TrendingUp, FileText, AlertTriangle, Sparkles, Plus, Thermometer, ShieldCheck } from "lucide-react";
import type { ElementType } from "react";
import { useProfile } from "@/hooks/useProfile";
import { serviceUrl } from "@/lib/api";
import { useWeatherDirect } from "@/hooks/useWeatherDirect";
import { useMultiMandiDirect } from "@/hooks/useMandiDirect";
import { useAlertSystem } from "@/hooks/useAlertSystem";

type NotificationType = "warning" | "success" | "info" | "destructive";

interface LiveAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at?: string;
}

interface UiAlert {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: "weather" | "market" | "ai";
  time: string;
  icon: ElementType;
  ts: number;
}

type FeedFilter = "all" | "weather" | "market" | "ai" | "critical";

const typeStyles = {
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

const typeBorder = {
  warning: "border-l-4 border-l-warning",
  success: "border-l-4 border-l-success",
  info: "border-l-4 border-l-info",
  destructive: "border-l-4 border-l-destructive",
};

const iconByType = {
  warning: CloudRain,
  success: TrendingUp,
  info: FileText,
  destructive: AlertTriangle,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const ALERT_API = serviceUrl(8097);
const WEATHER_API = serviceUrl(8094);
const MARKET_API = serviceUrl(8095);
const AGENT_API = serviceUrl(8096);

const metricLabel: Record<string, string> = {
  temp_min: "Cold temperature threshold",
  temp_max: "High temperature threshold",
  rain_mm: "Rainfall threshold",
  humidity: "Humidity threshold",
  wind: "Wind speed threshold",
  uv: "Harsh sunlight (UV) threshold",
};

const metricUnit: Record<string, string> = {
  temp_min: "°C",
  temp_max: "°C",
  rain_mm: "mm",
  humidity: "%",
  wind: "km/h",
  uv: "UV",
};

const Notifications = () => {
  const { profile } = useProfile();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [apiHealth, setApiHealth] = useState<Record<string, boolean>>({
    weather: false,
    market: false,
    agent: false,
    alerts: false,
  });
  const [newMarketCrop, setNewMarketCrop] = useState(profile.crops[0] || "Wheat");
  const [newMarketOperator, setNewMarketOperator] = useState<"lt" | "gt">("lt");
  const [newMarketThreshold, setNewMarketThreshold] = useState("2200");

  const { weather } = useWeatherDirect(profile.location);
  const { prices } = useMultiMandiDirect(profile.crops.length ? profile.crops : ["Wheat"], profile.location);
  const { rules, firedAlerts, updateRule, addMarketRule, removeRule } = useAlertSystem(profile.userId, weather, prices);

  const weatherRules = rules.filter((r) => r.type === "weather" || r.type === "ai");
  const marketRules = rules.filter((r) => r.type === "market");

  useEffect(() => {
    let cancelled = false;

    const fetchAlerts = async () => {
      try {
        const resp = await fetch(`${ALERT_API}/alerts/${profile.userId}?limit=20`);
        if (!resp.ok) return;
        const payload = (await resp.json()) as { alerts: LiveAlert[] };
        if (!cancelled) {
          setAlerts(payload.alerts || []);
        }
      } catch {
        if (!cancelled) {
          setAlerts([]);
        }
      }
    };

    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [profile.userId]);

  useEffect(() => {
    let cancelled = false;

    const checkApis = async () => {
      const checks = [
        { key: "weather", url: `${WEATHER_API}/health` },
        { key: "market", url: `${MARKET_API}/health` },
        { key: "agent", url: `${AGENT_API}/health` },
        { key: "alerts", url: `${ALERT_API}/health` },
      ] as const;

      const results = await Promise.all(
        checks.map(async (item) => {
          try {
            const resp = await fetch(item.url);
            return [item.key, resp.ok] as const;
          } catch {
            return [item.key, false] as const;
          }
        })
      );

      if (!cancelled) {
        setApiHealth(Object.fromEntries(results));
      }
    };

    checkApis();
    const timer = setInterval(checkApis, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleAddMarketRule = () => {
    const thresholdNum = Number(newMarketThreshold);
    if (!newMarketCrop.trim() || Number.isNaN(thresholdNum) || thresholdNum <= 0) {
      return;
    }
    addMarketRule(newMarketCrop.trim(), thresholdNum, newMarketOperator);
    setNewMarketThreshold(String(Math.max(1000, Math.round(thresholdNum))));
  };

  const applyAiPreset = () => {
    const tomorrow = weather?.forecastDays?.[1];
    if (!tomorrow) {
      updateRule("temp-cold", { enabled: true, threshold: 19, operator: "lt" });
      updateRule("temp-hot", { enabled: true, threshold: 38, operator: "gt" });
      updateRule("heavy-rain", { enabled: true, threshold: 20, operator: "gt" });
      return;
    }

    updateRule("temp-cold", { enabled: true, threshold: Math.min(19, tomorrow.minTemp), operator: "lt" });
    updateRule("temp-hot", { enabled: true, threshold: Math.max(37, tomorrow.maxTemp), operator: "gt" });
    updateRule("heavy-rain", { enabled: true, threshold: tomorrow.rainPct > 60 ? 10 : 20, operator: "gt" });
    updateRule("high-uv", { enabled: tomorrow.maxTemp > 36 || tomorrow.rainPct < 25, threshold: 8, operator: "gt" });
  };

  const localAlerts: UiAlert[] = firedAlerts.map((a) => {
    const type: NotificationType = a.severity === "danger" ? "destructive" : a.severity === "warning" ? "warning" : "info";
    const category: "weather" | "market" | "ai" =
      a.ruleId.startsWith("market-") ? "market" : a.ruleId.startsWith("ai-") ? "ai" : "weather";
    return {
      id: a.id,
      title: a.title,
      message: a.message,
      type,
      category,
      time: a.timestamp.toLocaleString(),
      icon: type === "warning" ? CloudRain : type === "destructive" ? AlertTriangle : FileText,
      ts: a.timestamp.getTime(),
    };
  });

  const mappedAlerts = useMemo(() => {
    const backendAlerts: UiAlert[] = alerts.length
      ? alerts.map((a) => {
          const type: NotificationType = a.severity === "critical" ? "destructive" : a.severity === "warning" ? "warning" : a.severity === "info" ? "info" : "success";
          return {
            id: a.id,
            title: a.title,
            message: a.message,
            type,
            category: /market|mandi|price|sell/.test(`${a.title} ${a.message}`.toLowerCase())
              ? "market"
              : /ai|risk|crop/.test(`${a.title} ${a.message}`.toLowerCase())
              ? "ai"
              : "weather",
            time: a.created_at ? new Date(a.created_at).toLocaleString() : "recent",
            icon: iconByType[type],
            ts: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
          };
        })
      : [];

    const merged = [...localAlerts, ...backendAlerts].sort((a, b) => b.ts - a.ts);
    if (merged.length) return merged;
    return [
      {
        id: "fallback-1",
        title: "No Alerts",
        message: "You are all caught up. Live alerts will appear here.",
        type: "info" as NotificationType,
        category: "weather" as const,
        time: "just now",
        icon: FileText,
        ts: Date.now(),
      },
    ];
  }, [localAlerts, alerts]);

  const filteredAlerts = useMemo(() => {
    if (feedFilter === "all") return mappedAlerts;
    if (feedFilter === "critical") {
      return mappedAlerts.filter((a) => a.type === "destructive");
    }
    return mappedAlerts.filter((a) => a.category === feedFilter);
  }, [feedFilter, mappedAlerts]);

  return (
    <AppLayout>
      <motion.div
        className="p-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl gradient-hero">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">{mappedAlerts.length} alerts · {profile.location || "Add location in profile"}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "weather", label: "Weather" },
              { key: "market", label: "Market" },
              { key: "ai", label: "AI" },
              { key: "critical", label: "Critical" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFeedFilter(tab.key as FeedFilter)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  feedFilter === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4 bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">AI Alert Setup</h3>
              <p className="text-xs text-muted-foreground mt-1">One tap presets for cold, heat, rain and UV based on tomorrow forecast.</p>
            </div>
            <button
              type="button"
              onClick={applyAiPreset}
              className="px-3 py-2 rounded-xl gradient-hero text-primary-foreground text-xs font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Apply AI Preset
            </button>
          </div>
          {weather?.forecastDays?.[1] && (
            <p className="text-xs text-muted-foreground mt-2">
              Tomorrow: {weather.forecastDays[1].minTemp}°C - {weather.forecastDays[1].maxTemp}°C · Rain chance {weather.forecastDays[1].rainPct}%
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4 bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Alert Rules</h3>
          <div className="space-y-2">
            {weatherRules.map((rule) => (
              <div key={rule.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.type === "ai" ? "AI-generated practical alerts" : metricLabel[rule.metric || ""] || "Weather alert"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                    className={`text-xs px-2 py-1 rounded-lg border ${rule.enabled ? "bg-green-500/15 border-green-500/30 text-green-700" : "bg-accent/40 border-border text-muted-foreground"}`}
                  >
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
                {rule.type === "weather" && typeof rule.threshold === "number" && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={rule.threshold}
                      onChange={(e) => updateRule(rule.id, { threshold: Number(e.target.value) })}
                      className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">{metricUnit[rule.metric || ""] || ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4 bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Market Rate Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={newMarketCrop}
              onChange={(e) => setNewMarketCrop(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Crop e.g. Wheat"
            />
            <select
              value={newMarketOperator}
              onChange={(e) => setNewMarketOperator(e.target.value as "lt" | "gt")}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="lt">Price below</option>
              <option value="gt">Price above</option>
            </select>
            <input
              type="number"
              min={1}
              value={newMarketThreshold}
              onChange={(e) => setNewMarketThreshold(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Threshold"
            />
            <button
              type="button"
              onClick={handleAddMarketRule}
              className="rounded-lg gradient-hero text-primary-foreground text-sm font-medium px-3 py-2 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          {marketRules.length > 0 && (
            <div className="mt-3 space-y-2">
              {marketRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-border px-3 py-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-card-foreground">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.enabled ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateRule(rule.id, { enabled: !rule.enabled })}
                      className="text-xs px-2 py-1 rounded-lg border border-border bg-accent/40"
                    >
                      {rule.enabled ? "Pause" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      className="text-xs px-2 py-1 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4 bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">API Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "weather", label: "Weather API", icon: Thermometer },
              { key: "market", label: "Market API", icon: TrendingUp },
              { key: "agent", label: "AI Agent API", icon: Sparkles },
              { key: "alerts", label: "Alert API", icon: ShieldCheck },
            ].map((item) => (
              <div key={item.key} className="rounded-xl border border-border p-3 flex items-center gap-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-card-foreground">{item.label}</p>
                  <p className={`text-xs ${apiHealth[item.key] ? "text-green-600" : "text-destructive"}`}>
                    {apiHealth[item.key] ? "Running" : "Unavailable"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          {filteredAlerts.map((n) => (
            <motion.div
              key={n.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 4 }}
              className={`bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer ${typeBorder[n.type]}`}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className={`p-2 rounded-xl ${typeStyles[n.type]}`}
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <n.icon className="w-4 h-4" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-card-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2 opacity-60">{n.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Notifications;
