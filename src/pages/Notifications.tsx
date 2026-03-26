import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bell, CloudRain, TrendingUp, FileText, AlertTriangle } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Weather Alert",
    message: "Light rain expected in your area tomorrow. Consider covering harvested crop.",
    time: "30 min ago",
    icon: CloudRain,
    type: "warning" as const,
  },
  {
    id: 2,
    title: "Price Update",
    message: "Wheat prices in Azadpur Mandi increased by 5.2% this week.",
    time: "2 hours ago",
    icon: TrendingUp,
    type: "success" as const,
  },
  {
    id: 3,
    title: "Scheme Deadline",
    message: "PM-KISAN registration deadline is approaching. Apply before April 15.",
    time: "1 day ago",
    icon: FileText,
    type: "info" as const,
  },
  {
    id: 4,
    title: "Pest Alert",
    message: "Aphid infestation reported in nearby farms. Check your crop immediately.",
    time: "2 days ago",
    icon: AlertTriangle,
    type: "destructive" as const,
  },
];

const typeStyles = {
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

const Notifications = () => (
  <AppLayout>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-display text-foreground">Notifications</h2>
      </div>
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${typeStyles[n.type]}`}>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-card-foreground">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{n.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Notifications;
