import { FormEvent, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import {
  User, Mail, Lock, Phone, MapPin, Globe, Leaf, ChevronRight, ChevronLeft,
  Locate, Search, Check, X, Sparkles, Languages
} from "lucide-react";
import { ALL_INDIA_STATES, searchCities, getCitiesForState, CityData, StateData } from "@/data/locationData";
import { ALL_CROPS, CROP_CATEGORIES, searchCrops, CropData } from "@/data/cropData";
import i18n from "@/i18n";

const STEPS = ["personalInfo", "yourLocation", "preferredLanguage", "yourCrops"] as const;
type Step = typeof STEPS[number];

const stepIcons = [User, MapPin, Languages, Leaf];

const slideVariants = {
  enterRight: { opacity: 0, x: 60 },
  enterLeft: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
  exitLeft: { opacity: 0, x: -60 },
  exitRight: { opacity: 0, x: 60 },
};

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 – Location
  const [locationMode, setLocationMode] = useState<"auto" | "manual">("auto");
  const [detecting, setDetecting] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<{ city: CityData; state: StateData } | null>(null);
  const [selectedMandi, setSelectedMandi] = useState("");
  const cityResults = citySearch.length > 0 ? searchCities(citySearch) : (selectedState ? getCitiesForState(selectedState).map(city => ({ city, state: ALL_INDIA_STATES.find(s => s.name === selectedState)! })) : []);

  // Step 3 – Language
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Step 4 – Crops
  const [cropSearch, setCropSearch] = useState("");
  const [activeCropCategory, setActiveCropCategory] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<CropData[]>([]);
  const filteredCrops = cropSearch
    ? searchCrops(cropSearch)
    : activeCropCategory
    ? ALL_CROPS.filter(c => c.category === activeCropCategory)
    : ALL_CROPS;

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const citySearchRef = useRef<HTMLInputElement>(null);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const goNext = () => {
    setDirection("right");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    setError("");
  };

  const goBack = () => {
    setDirection("left");
    setStep((s) => Math.max(s - 1, 0));
    setError("");
  };

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using a free API
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(r => r.json())
          .then((data) => {
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown";
            const state = data.address?.state || "";
            const hasStructuredAddress = city !== "Unknown" && !!state;
            const label = hasStructuredAddress ? `${city}, ${state}` : "";
            setDetectedLabel(label);
            setDetecting(false);
            // Try to match to known city
            const results = searchCities(city);
            if (results.length > 0) {
              setSelectedCity(results[0]);
              if (results[0].city.mandis.length > 0) {
                setSelectedMandi(results[0].city.mandis[0].name);
              }
            }
          })
          .catch(() => {
            setDetectedLabel("");
            setLocationMode("manual");
            setDetecting(false);
          });
      },
      () => {
        // Error – switch to manual
        setLocationMode("manual");
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  const toggleCrop = (crop: CropData) => {
    setSelectedCrops((prev) =>
      prev.some((c) => c.id === crop.id) ? prev.filter((c) => c.id !== crop.id) : [...prev, crop]
    );
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const locationStr = selectedCity
      ? `${selectedCity.city.name}, ${selectedCity.state.name}`
      : detectedLabel;
    const mandiStr = selectedMandi;

    try {
      await register({
        name,
        email,
        password,
        phone,
        location: locationStr,
        mandi: mandiStr,
        language: lang,
        crops: selectedCrops.map((c) => c.name),
      } as Parameters<typeof register>[0]);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = name.trim().length > 1 && email.includes("@") && password.length >= 8;
  const isStep2Valid = !!(detectedLabel || (selectedCity && selectedMandi));
  const isStep4Valid = selectedCrops.length > 0;

  const canProceed = [
    isStep1Valid,
    isStep2Valid,
    true, // language always valid
    isStep4Valid,
  ][step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2340] to-[#071522] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-green-500/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[30%] right-[20%] w-[20vw] h-[20vw] rounded-full bg-yellow-500/5 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white font-display">{t("createAccount")}</h1>
          <p className="text-sm text-slate-400 mt-1">{t("useRealDetails")}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: i === step ? 1.1 : 1,
                    backgroundColor: i < step ? "#22c55e" : i === step ? "#3b82f6" : "#1e3a5f",
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                >
                  {i < step ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${i === step ? "text-white" : "text-slate-500"}`} />
                  )}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 transition-all duration-500 ${i < step ? "bg-green-500" : "bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={slideVariants}
              initial={direction === "right" ? "enterRight" : "enterLeft"}
              animate="visible"
              exit={direction === "right" ? "exitLeft" : "exitRight"}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* STEP 1 – Personal Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{t("personalInfo")}</h2>
                    <p className="text-xs text-slate-400">{t("step")} 1 {t("of")} 4</p>
                  </div>
                  <InputField icon={User} placeholder={t("name")} value={name} onChange={setName} />
                  <InputField icon={Mail} placeholder={t("email")} value={email} onChange={setEmail} type="email" />
                  <InputField icon={Lock} placeholder={t("password")} value={password} onChange={setPassword} type="password" />
                  <InputField icon={Phone} placeholder={t("phone")} value={phone} onChange={setPhone} type="tel" />
                </div>
              )}

              {/* STEP 2 – Location */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{t("locationStep")}</h2>
                    <p className="text-xs text-slate-400">{t("locationDesc")}</p>
                  </div>

                  {/* Auto detect */}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={detectLocation}
                    disabled={detecting}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/60 transition-all"
                  >
                    <div className={`p-2 rounded-xl bg-blue-500/30 ${detecting ? "animate-spin" : ""}`}>
                      <Locate className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{detecting ? t("detecting") : t("autoDetect")}</p>
                      {detectedLabel && <p className="text-xs text-green-400 mt-0.5">✓ {detectedLabel}</p>}
                      {!detectedLabel && !detecting && <p className="text-xs text-slate-400">{t("locationDesc")}</p>}
                    </div>
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-500">{t("or")}</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* State selector */}
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(null); setSelectedMandi(""); setCitySearch(""); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="">{t("selectState")}</option>
                    {ALL_INDIA_STATES.map((s) => (
                      <option key={s.name} value={s.name}>{s.name} / {s.nameHi}</option>
                    ))}
                  </select>

                  {/* City search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      ref={citySearchRef}
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder={t("searchCity")}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* City results */}
                  {cityResults.length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur divide-y divide-white/5">
                      {cityResults.slice(0, 30).map(({ city, state }) => (
                        <motion.button
                          key={`${state?.name}-${city.name}`}
                          whileHover={{ backgroundColor: "rgba(59,130,246,0.1)" }}
                          onClick={() => {
                            setSelectedCity({ city, state });
                            setCitySearch("");
                            if (city.mandis.length > 0) setSelectedMandi(city.mandis[0].name);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${selectedCity?.city.name === city.name ? "bg-blue-500/20" : ""}`}
                        >
                          <div>
                            <span className="text-sm text-white font-medium">{city.name}</span>
                            <span className="text-xs text-slate-400 ml-2">({city.nameHi})</span>
                          </div>
                          <span className="text-xs text-slate-500">{state?.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Selected city & mandi */}
                  {selectedCity && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{selectedCity.city.name}, {selectedCity.state.name}</p>
                          <p className="text-xs text-slate-400">{selectedCity.city.nameHi}</p>
                        </div>
                        <button onClick={() => { setSelectedCity(null); setSelectedMandi(""); }} className="ml-auto text-slate-400 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {selectedCity.city.mandis.length > 0 && (
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">{t("selectMandi")}</label>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedCity.city.mandis.map((m) => (
                              <motion.button
                                key={m.name}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectedMandi(m.name)}
                                className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${selectedMandi === m.name ? "border-green-500 bg-green-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"}`}
                              >
                                <span>{m.name}</span>
                                <span className="text-xs text-slate-500">{m.distance}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 3 – Language */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{t("languageStep")}</h2>
                    <p className="text-xs text-slate-400">{t("languageDesc")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[
                      { value: "en", label: "English", labelHi: "अंग्रेजी", flag: "🇬🇧", desc: "Interface in English" },
                      { value: "hi", label: "हिंदी", labelHi: "Hindi", flag: "🇮🇳", desc: "पूरा इंटरफेस हिंदी में" },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setLang(option.value as "en" | "hi");
                          i18n.changeLanguage(option.value);
                        }}
                        className={`relative p-5 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden ${lang === option.value ? "border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/20" : "border-white/10 bg-white/5 hover:border-white/30"}`}
                      >
                        {lang === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        <div className="text-3xl mb-2">{option.flag}</div>
                        <p className="text-base font-bold text-white">{option.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{option.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    🌐 {lang === "hi" ? "आप कभी भी प्रोफाइल में भाषा बदल सकते हैं" : "You can change language anytime from profile"}
                  </p>
                </div>
              )}

              {/* STEP 4 – Crops */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">{t("cropStep")}</h2>
                      <p className="text-xs text-slate-400">{t("cropDesc")}</p>
                    </div>
                    {selectedCrops.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-xs text-green-400 font-medium">
                        {selectedCrops.length} {t("selected")}
                      </span>
                    )}
                  </div>

                  {/* Category filter */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                      onClick={() => setActiveCropCategory("")}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!activeCropCategory ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 border border-white/10"}`}
                    >
                      All
                    </button>
                    {CROP_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCropCategory(cat.id === activeCropCategory ? "" : cat.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCropCategory === cat.id ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 border border-white/10"}`}
                      >
                        {lang === "hi" ? cat.nameHi : cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      placeholder={t("searchCrop")}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Crop grid */}
                  <div className="max-h-52 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                    {filteredCrops.map((crop) => {
                      const isSelected = selectedCrops.some((c) => c.id === crop.id);
                      return (
                        <motion.button
                          key={crop.id}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                          onClick={() => toggleCrop(crop)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${isSelected ? "border-green-500/70 bg-green-500/15 shadow-sm shadow-green-500/20" : "border-white/10 bg-white/5 hover:border-white/30"}`}
                        >
                          <span className="text-xl">{crop.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{lang === "hi" ? crop.nameHi : crop.name}</p>
                            <p className="text-[10px] text-slate-500">{lang === "hi" ? crop.categoryHi : crop.category}</p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Selected chips */}
                  {selectedCrops.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400">{t("selectedCrops")}:</p>
                        <button onClick={() => setSelectedCrops([])} className="text-xs text-red-400 hover:text-red-300">{t("clearAll")}</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCrops.map((c) => (
                          <motion.span
                            key={c.id}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-xs text-green-400"
                          >
                            {c.emoji} {lang === "hi" ? c.nameHi : c.name}
                            <button onClick={() => toggleCrop(c)} className="hover:text-red-400 ml-0.5"><X className="w-3 h-3" /></button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-red-400 text-center">
              {error}
            </motion.p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> {t("back")}
              </motion.button>
            )}

            {step < STEPS.length - 1 ? (
              <motion.button
                whileHover={{ scale: canProceed ? 1.02 : 1 }} whileTap={{ scale: canProceed ? 0.98 : 1 }}
                onClick={goNext}
                disabled={!canProceed}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${canProceed ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50" : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"}`}
              >
                {t("next")} <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || !isStep4Valid}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 transition-all duration-300"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t("registering")}</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> {t("completeRegister")}</>
                )}
              </motion.button>
            )}
          </div>

          {/* Login link */}
          {step === 0 && (
            <p className="text-center text-xs text-slate-500 mt-4">
              {t("alreadyAccount")}{" "}
              <button onClick={() => navigate("/login")} className="text-blue-400 hover:text-blue-300 font-medium">
                {t("login")}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Reusable input field
function InputField({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
      />
    </div>
  );
}
