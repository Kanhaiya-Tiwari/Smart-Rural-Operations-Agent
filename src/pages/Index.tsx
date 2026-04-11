import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CloudSun, TrendingUp, Sprout, FileText, ShieldCheck,
  Wheat, IndianRupee, Droplets, MapPin, Sparkles, ArrowRight, Zap,
  Camera, BarChart3, Thermometer, Wind
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useWeatherDirect } from "@/hooks/useWeatherDirect";
import { useMandiDirect } from "@/hooks/useMandiDirect";
import { getCurrentSeason, getCropSuggestionsForSeason, CropData } from "@/data/cropData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
}

function formatFullDate(value: Date) {
  return value.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

const seasonColors = {
  kharif: { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", badge: "Kharif (Monsoon)", badgeHi: "खरीफ (मानसून)", emoji: "🌧️" },
  rabi: { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", badge: "Rabi (Winter)", badgeHi: "रबी (सर्दी)", emoji: "❄️" },
  zaid: { bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", badge: "Zaid (Summer)", badgeHi: "जायद (गर्मी)", emoji: "☀️" },
};

const LOCATION_REFRESH_KEY = "sroa-location-pending-refresh";

export default function Index() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { weather, market, analysis, alerts, isLoading, error } = useDashboardData(profile);
  const { weather: directWeather } = useWeatherDirect(profile.location);
  const primaryCrop = profile.crops[0] || "wheat";
  const { mandi: directMandi } = useMandiDirect(primaryCrop, profile.location || "Bhopal, Madhya Pradesh");
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const [now, setNow] = useState(() => new Date());
  const [suggestedCrops, setSuggestedCrops] = useState<CropData[]>([]);
  const season = getCurrentSeason();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stateFromProfile = profile.location.split(",").pop()?.trim() || "";
    const crops = getCropSuggestionsForSeason(season, stateFromProfile).slice(0, 6);
    setSuggestedCrops(crops);
  }, [profile.location, season]);

  useEffect(() => {
    if (!profile.userId || !profile.location) return;

    const raw = localStorage.getItem(LOCATION_REFRESH_KEY);
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as { userId?: string; location?: string };
      const pendingLocation = (pending.location || "").trim().toLowerCase();
      const currentLocation = profile.location.trim().toLowerCase();
      const guardKey = `sroa-location-refresh-once-${profile.userId}-${currentLocation}`;

      if (pending.userId !== profile.userId || pendingLocation !== currentLocation) return;

      if (sessionStorage.getItem(guardKey)) {
        localStorage.removeItem(LOCATION_REFRESH_KEY);
        return;
      }

      sessionStorage.setItem(guardKey, "1");
      localStorage.removeItem(LOCATION_REFRESH_KEY);
      window.location.reload();
    } catch {
      localStorage.removeItem(LOCATION_REFRESH_KEY);
    }
  }, [profile.location, profile.userId]);

  const firstName = profile.name.split(" ")[0];
  const todayLabel = formatFullDate(now);
  const greetingKey = getGreeting();
  const seasonInfo = seasonColors[season];
  const tomorrow = directWeather?.forecastDays?.[1] ?? null;
  const weatherCardTemp = directWeather?.temperature ?? weather?.temperature;
  const weatherCardSubtitle = directWeather
    ? `${directWeather.condition} · ${isHindi ? "नमी" : "Humidity"} ${directWeather.humidity}%`
    : weather
    ? `${weather.rainfall_prediction} · ${isHindi ? "नमी" : "Humidity"} ${weather.humidity}%`
    : todayLabel;
  const mandiPrice = directMandi?.modalPrice ?? market?.price;
  const mandiName = directMandi?.mandiName ?? market?.mandi_name;
  const marketTrend = directMandi?.trend === "stable" ? "up" : directMandi?.trend ?? market?.trend;
  const weatherSource = directWeather?.source || weather?.source || "--";
  const mandiSource = directMandi?.source || market?.source || "--";

  const practicalSuggestion = (() => {
    if (!tomorrow) return analysis?.insight || (isHindi ? "मौसम और बाजार डेटा का विश्लेषण हो रहा है..." : "Analyzing weather and market data...");

    if (tomorrow.rainPct >= 60 || tomorrow.rainMm >= 15) {
      return isHindi
        ? "कल बारिश की संभावना ज्यादा है। कटाई रोकेँ, उपज ढककर रखें और खेत की जल निकासी साफ रखें।"
        : "High rain chance tomorrow. Pause harvest, protect stored produce, and clear field drainage.";
    }

    if (tomorrow.maxTemp >= 38) {
      return isHindi
        ? "कल तेज धूप और गर्मी रहेगी। सुबह/शाम सिंचाई करें और दोपहर में स्प्रे टालें।"
        : "Tomorrow will be very hot. Irrigate in early morning/evening and avoid midday spraying.";
    }

    if ((market?.trend || "").toLowerCase() === "up") {
      return isHindi
        ? "मंडी ट्रेंड ऊपर है और मौसम स्थिर है। 1-2 दिन रुककर बेहतर भाव मिल सकता है।"
        : "Mandi trend is up with stable weather. Holding for 1-2 days may yield a better price.";
    }

    return analysis?.insight || (isHindi ? "कल के मौसम के अनुसार सामान्य खेती कार्य जारी रखें।" : "Continue regular field operations based on tomorrow's mild weather.");
  })();

  const quickActions = [
    { labelKey: "market", icon: IndianRupee, action: () => navigate("/chat"), gradient: "gradient-warm" },
    { labelKey: "weather", icon: CloudSun, action: () => navigate("/chat"), gradient: "gradient-sky" },
    { labelKey: "aiCropDetection", icon: Camera, action: () => navigate("/crop-detection"), gradient: "gradient-hero" },
    { labelKey: "chat", icon: Sparkles, action: () => navigate("/chat"), gradient: "gradient-warm" },
  ];

  return (
    <AppLayout>
      <motion.div
        className="p-4 space-y-5 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Greeting */}
        <motion.div
          variants={itemVariants}
          className="relative gradient-hero rounded-2xl p-5 text-primary-foreground overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full animate-float" />
          <div className="absolute bottom-2 right-12 w-16 h-16 bg-white/5 rounded-full animate-float-delayed" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse-soft" />
              <p className="text-xs opacity-80">{t(greetingKey as Parameters<typeof t>[0])}</p>
            </div>
            <h2 className="text-2xl font-bold font-display mt-1">
              {t("welcome")}, {firstName}! 👋
            </h2>
            <p className="text-xs mt-1 opacity-80">{t("today")}: {todayLabel}</p>
            <p className="text-sm mt-1.5 opacity-90 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {profile.location || (isHindi ? "स्थान सेट करें" : "Set your location")}
            </p>
            <p className="text-[11px] mt-1 opacity-80">
              Weather API: {weatherSource} · Mandi API: {mandiSource}
            </p>
            {profile.crops.length > 0 && (
              <p className="text-xs mt-1 opacity-75">
                {profile.crops.slice(0, 3).join(", ")}{profile.crops.length > 3 ? ` +${profile.crops.length - 3}` : ""} · {profile.landArea || "--"}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/chat")}
              className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium transition-all"
            >
              <Zap className="w-4 h-4" />
              {t("askAIAgent")}
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <StatCard
            title={`${isHindi ? "मंडी भाव" : "Mandi Price"}`}
            value={mandiPrice ? `₹${mandiPrice}` : "--"}
            subtitle={`${isHindi ? "प्रति क्विंटल" : "per quintal"} · ${mandiName || (isHindi ? "उपलब्ध नहीं" : "N/A")}`}
            icon={Wheat}
            gradient="warm"
          />
          <StatCard
            title={isHindi ? "मौसम" : "Weather"}
            value={weatherCardTemp !== undefined ? `${weatherCardTemp}°C` : "--"}
            subtitle={weatherCardSubtitle}
            icon={CloudSun}
            gradient="sky"
          />
          <StatCard
            title={isHindi ? "AI सुझाव" : "AI Suggestion"}
            value={(analysis?.recommendation || "--").toUpperCase()}
            subtitle={analysis?.crop_health_suggestion || (isHindi ? "उपलब्ध नहीं" : "Not available")}
            icon={Sprout}
            gradient="hero"
          />
          <StatCard
            title={isHindi ? "बाजार रुझान" : "Market Trend"}
            value={marketTrend ? (marketTrend === "down" ? "↓ DOWN" : "↑ UP") : "--"}
            subtitle={directMandi?.arrivalDate || (market?.last_updated ? formatFullDate(new Date(market.last_updated)) : todayLabel)}
            icon={TrendingUp}
            gradient="warm"
          />
        </motion.div>

        {/* Weather details */}
        {(directWeather || weather) && (
          <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="text-sm font-semibold font-display text-foreground mb-3 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-sky" />
              {isHindi ? "विस्तृत मौसम जानकारी" : "Detailed Weather"}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <WeatherChip icon={Thermometer} label={isHindi ? "तापमान" : "Temp"} value={`${directWeather?.temperature ?? weather?.temperature ?? "--"}°C`} />
              <WeatherChip icon={Droplets} label={isHindi ? "नमी" : "Humidity"} value={`${directWeather?.humidity ?? weather?.humidity ?? "--"}%`} />
              <WeatherChip icon={Wind} label={isHindi ? "हवा" : "Wind"} value={`${directWeather?.windSpeed ?? weather?.wind_speed ?? "--"} km/h`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{directWeather?.condition || weather?.rainfall_prediction || "--"}</p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            {t("quickActions")}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <QuickAction key={a.labelKey} label={t(a.labelKey as Parameters<typeof t>[0])} icon={a.icon} onClick={a.action} />
            ))}
          </div>
        </motion.div>

        {/* Season crop suggestions */}
        <motion.div variants={itemVariants} className={`rounded-2xl p-4 bg-gradient-to-br ${seasonInfo.bg} border ${seasonInfo.border}`}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-1 flex items-center gap-2">
            <span>{seasonInfo.emoji}</span>
            {isHindi ? "इस मौसम की बेस्ट फसलें" : "Best Crops This Season"}
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/20 text-foreground">
              {isHindi ? seasonInfo.badgeHi : seasonInfo.badge}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {isHindi ? "अभी बोने के लिए सर्वोत्तम फसलें" : "Recommended crops to sow now"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {suggestedCrops.map((crop) => (
              <div key={crop.id} className="bg-white/10 rounded-xl p-2.5 text-center">
                <span className="text-2xl">{crop.emoji}</span>
                <p className="text-xs font-medium text-card-foreground mt-1 leading-tight">
                  {isHindi ? crop.nameHi : crop.name}
                </p>
                <p className="text-[10px] text-muted-foreground">₹{crop.avgPrice.toLocaleString()}/q</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insight */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold font-display text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {t("aiRecommendation")}
          </h3>
          <p className="text-sm text-card-foreground">
            {practicalSuggestion}
          </p>
          {tomorrow && (
            <p className="text-xs text-muted-foreground mt-2">
              {isHindi ? "कल" : "Tomorrow"}: {tomorrow.minTemp}°C - {tomorrow.maxTemp}°C · {isHindi ? "बारिश संभावना" : "Rain chance"} {tomorrow.rainPct}%
            </p>
          )}
          {isLoading && <p className="text-xs text-muted-foreground mt-2">{isHindi ? "लाइव डेटा रिफ्रेश हो रहा है..." : "Refreshing live data..."}</p>}
          {error && <p className="text-xs text-muted-foreground mt-2">{isHindi ? t("networkError") : error}</p>}
        </motion.div>

        {/* Crop price future prediction */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-warning" />
            {isHindi ? "फसल भाव का भविष्य" : "Future Price Prediction"}
          </h3>
          <div className="space-y-2">
            {(profile.crops.length > 0 ? profile.crops : ["Wheat", "Soybean", "Cotton"]).slice(0, 3).map((crop, i) => {
              const trend = i % 2 === 0 ? "up" : "down";
              const change = (5 + i * 3);
              return (
                <div key={crop} className="flex items-center gap-3 p-3 rounded-xl bg-accent/40">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${trend === "up" ? "bg-green-500" : "bg-red-500"}`}>
                    {trend === "up" ? "↑" : "↓"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{crop}</p>
                    <p className="text-xs text-muted-foreground">
                      {isHindi ? "3 महीने में" : "In 3 months"} · {trend === "up" ? (isHindi ? "बढ़ेगा" : "Rising") : (isHindi ? "गिरेगा" : "Falling")}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {trend === "up" ? "+" : "-"}{change}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Alerts */}
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">{t("liveAlerts")}</h3>
          <div className="space-y-2">
            {(alerts.length > 0
              ? alerts.map((a) => ({ text: a.message, time: a.created_at ? new Date(a.created_at).toLocaleString() : "recent", icon: a.severity === "critical" ? Droplets : FileText, color: a.severity === "critical" ? "gradient-warm" : "gradient-hero" }))
              : [{ text: t("noAlerts"), time: "just now", icon: ShieldCheck, color: "gradient-sky" }]
            ).map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card hover:shadow-elevated hover:scale-[1.01] transition-all cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${item.color}`}><item.icon className="w-4 h-4 text-primary-foreground" /></div>
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
}

function WeatherChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-accent/40">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-card-foreground">{value}</p>
    </div>
  );
}
