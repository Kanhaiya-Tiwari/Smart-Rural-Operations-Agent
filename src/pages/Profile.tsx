import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Wheat, Phone, ChevronRight, Pencil, Save, X, Bell, MessageCircle, Mail } from "lucide-react";
import { useProfile, ProfileData } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { profile, updateProfile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const farmDetails = [
    { label: "Crops", value: profile.crops.join(", "), icon: Wheat, field: "crops" as const },
    { label: "Land Area", value: profile.landArea, icon: MapPin, field: "landArea" as const },
    { label: "Phone", value: profile.phone, icon: Phone, field: "phone" as const },
  ];

  return (
    <AppLayout>
      <div className="p-5 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-card rounded-2xl p-6 shadow-card text-center overflow-hidden"
        >
          {/* Decorative background circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 animate-pulse-soft" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-secondary/5 animate-pulse-soft" />

          {/* Edit / Save / Cancel buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-btns"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 rounded-xl gradient-hero text-primary-foreground hover:shadow-elevated transition-all duration-200 animate-shimmer"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="edit-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleEdit}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:scale-110 transition-all duration-200"
                >
                  <Pencil className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="w-20 h-20 mx-auto gradient-hero rounded-full flex items-center justify-center mb-3 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 rounded-full gradient-hero animate-pulse-soft" />
            <User className="w-10 h-10 text-primary-foreground relative z-10" />
          </motion.div>

          {isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-2 relative z-10">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full text-center text-xl font-bold font-display bg-accent/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="Your Name"
              />
              <input
                type="text"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className="w-full text-center text-sm bg-accent/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                placeholder="Location"
              />
            </motion.div>
          ) : (
            <div className="relative z-10">
              <h2 className="text-xl font-bold font-display text-card-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {profile.location}
              </p>
            </div>
          )}
        </motion.div>

        {/* Farm Details */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Farm Details</h3>
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden">
            {farmDetails.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-accent">
                  <item.icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {isEditing ? (
                    item.field === "crops" ? (
                      <input
                        type="text"
                        value={draft.crops.join(", ")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            crops: e.target.value
                              .split(",")
                              .map((c) => c.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full text-sm font-medium bg-accent/50 border border-border rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    ) : (
                      <input
                        type="text"
                        value={draft[item.field]}
                        onChange={(e) => setDraft({ ...draft, [item.field]: e.target.value })}
                        className="w-full text-sm font-medium bg-accent/50 border border-border rounded-lg px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    )
                  ) : (
                    <p className="text-sm font-medium text-card-foreground">{item.value}</p>
                  )}
                </div>
                {!isEditing && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Smart Alerts</h3>
          <div className="bg-card rounded-2xl shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Bell className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">Set weather and mandi alerts from one place</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure custom temperature, rain and market-rate alerts with AI-assisted rules in Notifications.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="w-full mt-4 rounded-xl gradient-hero py-2 text-sm text-primary-foreground font-medium"
            >
              Open Alert Controls
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Privacy Options</h3>
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden mb-6">
            {[
              { key: "share-data", label: "Share data for better insights", value: draft.privacy.shareDataForInsights },
              { key: "personalized-ai", label: "Allow personalized AI recommendations", value: draft.privacy.allowPersonalizedAi },
            ].map((p) => (
              <div key={p.key} className="flex items-center justify-between p-4">
                <p className="text-sm text-card-foreground">{p.label}</p>
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => {
                    if (!isEditing) return;
                    if (p.key === "share-data") {
                      setDraft({
                        ...draft,
                        privacy: {
                          ...draft.privacy,
                          shareDataForInsights: !draft.privacy.shareDataForInsights,
                        },
                      });
                    }
                    if (p.key === "personalized-ai") {
                      setDraft({
                        ...draft,
                        privacy: {
                          ...draft.privacy,
                          allowPersonalizedAi: !draft.privacy.allowPersonalizedAi,
                        },
                      });
                    }
                  }}
                  className="text-xs px-2 py-1 rounded-lg border border-border bg-accent/50 disabled:opacity-70"
                >
                  {p.value ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold font-display text-foreground mb-3">Help & Support</h3>
          <div className="bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-card-foreground">WhatsApp Support</p>
              </div>
              <a href="https://wa.me/917489960276" target="_blank" rel="noreferrer" className="text-sm text-primary font-medium">
                7489960276
              </a>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-card-foreground">Email Support</p>
              </div>
              <a href="mailto:knhapndt@gmail.com" className="text-sm text-primary font-medium">
                knhapndt@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => (window.location.href = "/chat")}>
              <p className="text-sm text-card-foreground">Chat with AI Agent</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full mt-4 rounded-xl border border-border py-2 text-sm text-card-foreground hover:bg-accent/30"
          >
            Logout
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
