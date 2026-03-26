import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bell, CloudRain, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { serviceUrl } from "@/lib/api";

type NotificationType = "warning" | "success" | "info" | "destructive";

interface LiveAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  created_at?: string;
}

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

const ALERT_API = serviceUrl(8006);

const Notifications = () => {
  const { profile } = useProfile();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);

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

  const mappedAlerts = alerts.length
    ? alerts.map((a) => {
        const type: NotificationType = a.severity === "critical" ? "destructive" : a.severity === "warning" ? "warning" : a.severity === "info" ? "info" : "success";
        return {
          id: a.id,
          title: a.title,
          message: a.message,
          type,
          time: a.created_at ? new Date(a.created_at).toLocaleString() : "recent",
          icon: iconByType[type],
        };
      })
    : [
        {
          id: "fallback-1",
          title: "No Alerts",
          message: "You are all caught up. Live alerts will appear here.",
          type: "info" as NotificationType,
          time: "just now",
          icon: FileText,
        },
      ];

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
            <p className="text-xs text-muted-foreground">{mappedAlerts.length} alerts</p>
          </div>
        </motion.div>
        <div className="space-y-3">
          {mappedAlerts.map((n) => (
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
