import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Leaf, Sparkles, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed") || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2340] to-[#071522] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-green-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/40"
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white font-display">SROA</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isHindi ? "स्मार्ट ग्रामीण संचालन एजेंट" : "Smart Rural Operations Agent"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">{t("login")}</h2>
          <p className="text-xs text-slate-400 mb-6">
            {isHindi ? "लाइव मंडी भाव, मौसम और अलर्ट देखें।" : "Access live mandi prices, weather, and alerts."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("email")}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("password")}
                className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 text-center">
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isHindi ? "लॉगिन हो रहा है..." : "Signing in..."}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {t("login")}</>
              )}
            </motion.button>
          </form>

          {/* Language toggle */}
          <div className="flex items-center justify-center mt-4 gap-2">
            <button
              onClick={() => i18n.changeLanguage("en")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${i18n.language === "en" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              English
            </button>
            <div className="w-px h-4 bg-slate-600" />
            <button
              onClick={() => i18n.changeLanguage("hi")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${i18n.language === "hi" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              हिंदी
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            {isHindi ? "कोई खाता नहीं है?" : "Don't have an account?"}{" "}
            <button onClick={() => navigate("/register")} className="text-blue-400 hover:text-blue-300 font-medium">
              {t("register")}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
