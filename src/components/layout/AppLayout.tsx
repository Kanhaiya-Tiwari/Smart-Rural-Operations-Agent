import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Bell, User, Leaf, Camera, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  const navItems = [
    { path: "/", icon: Home, labelKey: "home" },
    { path: "/chat", icon: MessageCircle, labelKey: "chat" },
    { path: "/crop-detection", icon: Camera, labelKey: isHindi ? "AI जांच" : "AI Scan" },
    { path: "/notifications", icon: Bell, labelKey: "notifications" },
    { path: "/profile", icon: User, labelKey: "profile" },
  ];

  const toggleLang = () => {
    i18n.changeLanguage(isHindi ? "en" : "hi");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3" />
        <motion.div
          className="gradient-hero p-2 rounded-xl relative z-10"
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </motion.div>
        <div className="relative z-10 flex-1">
          <h1 className="text-base font-bold font-display text-foreground leading-tight">SROA</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {isHindi ? "स्मार्ट ग्रामीण एजेंट" : "Smart Rural Operations Agent"}
          </p>
        </div>
        {/* Language toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLang}
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent border border-border text-xs font-semibold text-accent-foreground hover:bg-accent/70 transition-all shadow-sm"
          title="Switch Language"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{isHindi ? "EN" : "हिं"}</span>
        </motion.button>
        <div className="relative z-10">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" title="Online" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-1 py-1.5 border-t border-border bg-card relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-secondary/2" />
        {navItems.map(({ path, icon: Icon, labelKey }) => {
          const isActive = location.pathname === path;
          const label = typeof labelKey === "string" && labelKey.length < 10
            ? (t as (k: string) => string)(labelKey) || labelKey
            : labelKey;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 relative min-w-0 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10"
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className="text-[9px] font-medium relative z-10 truncate max-w-[44px] text-center leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
