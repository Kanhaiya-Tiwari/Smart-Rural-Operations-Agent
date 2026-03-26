import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Bell, User, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/chat", icon: MessageCircle, label: "Agent" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card">
        <div className="gradient-hero p-2 rounded-xl">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold font-display text-foreground leading-tight">SROA</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Smart Rural Operations Agent</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-2 py-2 border-t border-border bg-card">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors relative ${
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
              <Icon className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
