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
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";

const Index = () => {
  const navigate = useNavigate();

  const quickActions = [
    { label: "Sell Crop", icon: IndianRupee, action: () => navigate("/chat") },
    { label: "Weather", icon: CloudSun, action: () => navigate("/chat") },
    { label: "Schemes", icon: FileText, action: () => navigate("/chat") },
    { label: "Crop Health", icon: ShieldCheck, action: () => navigate("/chat") },
  ];

  return (
    <AppLayout>
      <div className="p-5 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-hero rounded-2xl p-6 text-primary-foreground"
        >
          <p className="text-sm opacity-80">Good morning 🌅</p>
          <h2 className="text-xl font-bold font-display mt-1">Welcome, Farmer!</h2>
          <p className="text-sm mt-2 opacity-90">
            Your AI agent is ready to help. Ask anything about crops, weather, or government schemes.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Wheat Price" value="₹2,450" subtitle="per quintal · Azadpur Mandi" icon={Wheat} gradient="warm" />
          <StatCard title="Weather" value="32°C" subtitle="Partly cloudy · Low rain" icon={CloudSun} gradient="sky" />
          <StatCard title="Crop Health" value="Good" subtitle="No alerts detected" icon={Sprout} gradient="hero" />
          <StatCard title="Market Trend" value="↑ 5.2%" subtitle="Wheat prices rising" icon={TrendingUp} gradient="warm" />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <QuickAction key={a.label} label={a.label} icon={a.icon} onClick={a.action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Agent Activity</h3>
          <div className="space-y-2">
            {[
              { text: "Checked mandi prices for wheat in 3 markets", time: "2 hours ago", icon: IndianRupee },
              { text: "Weather alert: light rain expected tomorrow", time: "5 hours ago", icon: Droplets },
              { text: "PM-KISAN installment due this month", time: "1 day ago", icon: FileText },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                <div className="p-2 rounded-lg bg-accent">
                  <item.icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground truncate">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
