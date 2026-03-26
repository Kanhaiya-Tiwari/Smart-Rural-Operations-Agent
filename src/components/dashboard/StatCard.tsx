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
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative bg-card rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer group"
  >
    {/* Subtle background glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold font-display mt-1 text-card-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <motion.div
        className={`${gradientMap[gradient]} p-2.5 rounded-xl`}
        whileHover={{ rotate: 8 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Icon className="w-5 h-5 text-primary-foreground" />
      </motion.div>
    </div>
  </motion.div>
);

export default StatCard;
