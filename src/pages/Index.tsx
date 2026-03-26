import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CloudSun,
  TrendingUp,
  Sprout,
  FileText,
  ShieldCheck,
  Wheat,
  IndianRupee,
  Droplets,
  MapPin,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/hooks/useDashboardData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatFullDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { weather, market, analysis, alerts, isLoading, error } = useDashboardData(profile);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const firstName = profile.name.split(" ")[0];
  const todayLabel = formatFullDate(now);
  const weatherDateLabel = weather?.observed_at
    ? formatFullDate(new Date(weather.observed_at))
    : todayLabel;
  const marketDateLabel = market?.last_updated
    ? formatFullDate(new Date(market.last_updated))
    : todayLabel;

  const quickActions = [
    { label: "Sell Crop", icon: IndianRupee, action: () => navigate("/chat"), gradient: "gradient-warm" },
    { label: "Weather", icon: CloudSun, action: () => navigate("/chat"), gradient: "gradient-sky" },
    { label: "Schemes", icon: FileText, action: () => navigate("/chat"), gradient: "gradient-hero" },
    { label: "Crop Health", icon: ShieldCheck, action: () => navigate("/chat"), gradient: "gradient-warm" },
  ];

  return (
    <AppLayout>
      <motion.div
        className="p-5 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting */}
        <motion.div
          variants={itemVariants}
          className="relative gradient-hero rounded-2xl p-6 text-primary-foreground overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full animate-float" />
          <div className="absolute bottom-2 right-10 w-16 h-16 bg-white/5 rounded-full animate-float-delayed" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse-soft" />
              <p className="text-sm opacity-80">Good morning 🌅</p>
            </div>
            <h2 className="text-2xl font-bold font-display mt-1">Welcome, {firstName}!</h2>
            <p className="text-xs mt-1 opacity-80">Today: {todayLabel}</p>
            <p className="text-sm mt-2 opacity-90 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {profile.location}
            </p>
            <p className="text-xs mt-1 opacity-75">
              {profile.crops.join(", ")} · {profile.landArea}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/chat")}
              className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              Ask your AI Agent
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>

        {/* Profile snapshot */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
          onClick={() => navigate("/profile")}
          whileHover={{ scale: 1.01 }}
        >
          <div className="p-2.5 rounded-xl gradient-hero animate-pulse-soft">
            <Wheat className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {profile.crops.join(", ") || "No crops selected"} · {profile.landArea || "No land area"} · {profile.location || "No location"}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <StatCard
            title={`${market?.crop || "Crop"} Price`}
            value={market?.price ? `₹${market.price}` : "--"}
            subtitle={`per quintal · ${market?.mandi_name || "Not available"}`}
            icon={Wheat}
            gradient="warm"
          />
          <StatCard
            title="Weather"
            value={weather?.temperature !== undefined ? `${weather.temperature}°C` : "--"}
            subtitle={weather ? `${weather.rainfall_prediction} · Humidity ${weather.humidity}% · ${weatherDateLabel}` : `${todayLabel}`}
            icon={CloudSun}
            gradient="sky"
          />
          <StatCard
            title="AI Suggestion"
            value={(analysis?.recommendation || "--").toUpperCase()}
            subtitle={analysis?.crop_health_suggestion || "Not available"}
            icon={Sprout}
            gradient="hero"
          />
          <StatCard
            title="Market Trend"
            value={market ? (market.trend === "down" ? "↓ DOWN" : "↑ UP") : "--"}
            subtitle={market ? `Updated ${marketDateLabel}` : `${todayLabel}`}
            icon={TrendingUp}
            gradient="warm"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <QuickAction key={a.label} label={a.label} icon={a.icon} onClick={a.action} />
            ))}
          </div>
        </motion.div>

        {/* AI Insight */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold font-display text-foreground mb-2">AI Recommendation</h3>
          <p className="text-sm text-card-foreground">
            {analysis?.insight || "Analyzing weather and market data..."}
          </p>
          {isLoading && <p className="text-xs text-muted-foreground mt-2">Refreshing live data...</p>}
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Live Alerts</h3>
          <div className="space-y-2">
            {(alerts.length
              ? alerts.map((a) => ({
                  text: a.message,
                  time: a.created_at ? new Date(a.created_at).toLocaleString() : "recent",
                  icon: a.severity === "critical" ? Droplets : FileText,
                  color: a.severity === "critical" ? "gradient-warm" : "gradient-hero",
                }))
              : [
                  {
                    text: "No critical alerts right now. Conditions are stable.",
                    time: "just now",
                    icon: IndianRupee,
                    color: "gradient-sky",
                  },
                ]
            ).map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card hover:shadow-elevated hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground truncate">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Index;
