import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { User, MapPin, Wheat, Phone, ChevronRight } from "lucide-react";

const Profile = () => (
  <AppLayout>
    <div className="p-5 space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-card text-center"
      >
        <div className="w-20 h-20 mx-auto gradient-hero rounded-full flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold font-display text-card-foreground">Ramesh Kumar</h2>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
          <MapPin className="w-3 h-3" /> Sonipat, Haryana
        </p>
      </motion.div>

      {/* Farm Details */}
      <div>
        <h3 className="text-sm font-semibold font-display text-foreground mb-3">Farm Details</h3>
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
          {[
            { label: "Crop", value: "Wheat, Mustard", icon: Wheat },
            { label: "Land Area", value: "5 Acres", icon: MapPin },
            { label: "Phone", value: "+91 98765 43210", icon: Phone },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-accent">
                <item.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-card-foreground">{item.value}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-sm font-semibold font-display text-foreground mb-3">Settings</h3>
        <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
          {["Language Preference", "Notification Settings", "Data & Privacy", "Help & Support"].map((item) => (
            <div key={item} className="flex items-center justify-between p-4">
              <p className="text-sm text-card-foreground">{item}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </AppLayout>
);

export default Profile;
