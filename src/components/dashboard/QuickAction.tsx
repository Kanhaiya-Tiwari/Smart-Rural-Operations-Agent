import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const QuickAction = ({ label, icon: Icon, onClick }: QuickActionProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.08, y: -3 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 15 }}
    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300 group relative overflow-hidden shadow-card hover:shadow-elevated"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/100 group-hover:to-primary/80 transition-all duration-300 rounded-2xl" />
    <div className="relative z-10 p-1.5 rounded-xl bg-white/0 group-hover:bg-white/15 transition-all duration-300">
      <Icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors duration-300" />
    </div>
    <span className="relative z-10 text-xs font-medium text-accent-foreground group-hover:text-primary-foreground text-center leading-tight transition-colors duration-300">
      {label}
    </span>
  </motion.button>
);

export default QuickAction;
