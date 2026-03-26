import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: "hero" | "warm" | "sky";
}

const gradientMap = {
  hero: "gradient-hero",
  warm: "gradient-warm",
  sky: "gradient-sky",
};

const StatCard = ({ title, value, subtitle, icon: Icon, gradient }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold font-display mt-1 text-card-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`${gradientMap[gradient]} p-2.5 rounded-xl`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
    </div>
  </motion.div>
);

export default StatCard;
