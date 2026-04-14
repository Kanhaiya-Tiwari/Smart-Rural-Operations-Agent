import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/layout/AppLayout";
import { serviceUrl } from "@/lib/api";
import {
  Upload, Leaf, AlertTriangle, CheckCircle2, Sparkles,
  RefreshCw, ChevronDown, Info, Zap, Camera
} from "lucide-react";

interface DetectionResult {
  cropName: string;
  cropNameHi: string;
  disease: string | null;
  diseaseHi: string | null;
  isHealthy: boolean;
  treatment: string;
  treatmentHi: string;
  confidence: number;
  severity: "none" | "mild" | "moderate" | "severe";
  additionalTips: string[];
}

const AGENT_API = serviceUrl(8096);

async function toBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

  return dataUrl.split(",")[1] || "";
}

async function analyzeImageWithApi(file: File): Promise<DetectionResult> {
  const imageBase64 = await toBase64(file);
  const resp = await fetch(`${AGENT_API}/analyze-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_base64: imageBase64,
      filename: file.name,
    }),
  });

  if (!resp.ok) {
    throw new Error("Image analysis API unavailable");
  }

  return (await resp.json()) as DetectionResult;
}

const severityColors = {
  none: { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/40", text: "text-green-400", badge: "bg-green-500/20 text-green-400" },
  mild: { bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400" },
  moderate: { bg: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/40", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400" },
  severe: { bg: "from-red-500/20 to-rose-500/20", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/20 text-red-400" },
};

export default function CropDetection() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState("");
  const [showTips, setShowTips] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    const f = accepted[0];
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError("");
    try {
      const r = await analyzeImageWithApi(file);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError("");
    setAnalyzing(false);
  };

  const colors = result ? severityColors[result.severity] : severityColors.none;

  return (
    <AppLayout>
      <div className="p-4 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute bottom-2 right-16 w-14 h-14 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs opacity-75">{t("aiPowered")}</span>
            </div>
            <h1 className="text-xl font-bold font-display">{t("aiCropDetection")}</h1>
            <p className="text-xs opacity-80 mt-1">{t("aiCropDesc")}</p>
          </div>
        </motion.div>

        {/* Upload zone */}
        {!result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {!preview ? (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/30"}`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -4 : 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-base font-semibold text-card-foreground mb-1">{t("dragDrop")}</p>
                  <p className="text-xs text-muted-foreground">{t("supportedFormats")}</p>
                </motion.div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden bg-card shadow-card">
                <img src={preview} alt="Crop preview" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <p className="text-white text-sm font-medium truncate">{file?.name}</p>
                  <button onClick={reset} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Analyze button */}
        {preview && !result && !analyzing && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={analyze}
            className="w-full py-4 rounded-2xl gradient-hero text-white font-semibold flex items-center justify-center gap-2 shadow-elevated"
          >
            <Zap className="w-5 h-5" />
            {t("aiCropDetection")} — {isHindi ? "विश्लेषण करें" : "Analyze Now"}
          </motion.button>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center">
            {error}
          </motion.p>
        )}

        {/* Analyzing state */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-2xl p-8 text-center shadow-card"
            >
              {/* Preview during analysis */}
              {preview && <img src={preview} alt="" className="w-full h-36 object-cover rounded-xl mb-4 opacity-60" />}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
                  <Leaf className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="font-semibold text-card-foreground">{t("analyzing")}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHindi ? "AI आपकी फसल का विश्लेषण कर रही है..." : "AI is scanning your crop image..."}</p>
              {/* Fake progress */}
              <motion.div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  className="h-full gradient-hero rounded-full"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-4"
            >
              {/* Image with result overlay */}
              {preview && (
                <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                  <img src={preview} alt="" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${colors.badge} ${colors.border}`}>
                    {result.confidence}% {isHindi ? "सटीक" : "Confidence"}
                  </div>
                </div>
              )}

              {/* Main result card */}
              <div className={`rounded-2xl p-5 bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-card`}>
                <div className="flex items-center gap-2 mb-4">
                  {result.isHealthy ? (
                    <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                  )}
                  <h2 className="text-base font-bold text-card-foreground">{t("analysisResult")}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ResultChip
                    label={t("cropDetected")}
                    value={isHindi ? result.cropNameHi : result.cropName}
                    icon="🌱"
                  />
                  <ResultChip
                    label={t("diseaseDetected")}
                    value={result.disease ? (isHindi ? result.diseaseHi! : result.disease) : t("healthyCrop")}
                    icon={result.isHealthy ? "✅" : "🦠"}
                    highlight={!result.isHealthy}
                  />
                </div>

                {/* Treatment */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-card-foreground">{t("treatment")}</p>
                  </div>
                  <p className="text-sm text-card-foreground/90 leading-relaxed">
                    {isHindi ? result.treatmentHi : result.treatment}
                  </p>
                </div>
              </div>

              {/* Additional tips */}
              <motion.div
                className="bg-card rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
                >
                  <p className="text-sm font-semibold text-card-foreground">
                    {isHindi ? "अतिरिक्त सुझाव" : "Additional Tips"}
                  </p>
                  <motion.div animate={{ rotate: showTips ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {result.additionalTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Upload another */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-card-foreground hover:bg-accent/30 flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                {t("uploadAnother")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

function ResultChip({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-xl bg-white/10 ${highlight ? "border border-red-500/30" : ""}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <p className="text-sm font-semibold text-card-foreground">{value}</p>
      </div>
    </div>
  );
}
