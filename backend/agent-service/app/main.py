import os
import json
import re
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from openai import OpenAI

# Import chat router
from .chat import router as chat_router

app = FastAPI(title="agent-service")

# ── Google Gemini (primary) ────────────────────────────────────────────────
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY", "")
GEMINI_CHAT_MODEL   = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")
GEMINI_VISION_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-2.0-flash")

# ── OpenRouter (fallback) ─────────────────────────────────────────────────
OPENROUTER_API_KEY    = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL   = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_CHAT_MODEL   = os.getenv("OPENROUTER_CHAT_MODEL", "google/gemini-2.0-flash-001")
OPENROUTER_VISION_MODEL = os.getenv("OPENROUTER_VISION_MODEL", "google/gemini-2.0-flash-001")

_gemini  = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
_openrouter = OpenAI(api_key=OPENROUTER_API_KEY, base_url=OPENROUTER_BASE_URL) if OPENROUTER_API_KEY else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


# ── Pydantic models ────────────────────────────────────────────────────────
class WeatherData(BaseModel):
    temperature: float | int
    humidity: float | int
    rainfall_prediction: str
    wind_speed: float | int


class MarketData(BaseModel):
    mandi_name: str
    price: float | int
    trend: str
    last_updated: str


class AnalyzeRequest(BaseModel):
    user_id: str
    crops: list[str]
    weather: dict
    market: dict


class AnalyzeImageRequest(BaseModel):
    image_base64: str
    filename: str | None = None


# ── Helpers ────────────────────────────────────────────────────────────────
def fallback_crop_from_filename(filename: str | None) -> tuple[str, str]:
    value = (filename or "").lower()
    mapping = [
        (("carrot", "gajar"),          ("Carrot",  "गाजर")),
        (("potato", "aloo", "aalu"),   ("Potato",  "आलू")),
        (("onion",  "pyaj", "pyaaz"),  ("Onion",   "प्याज")),
        (("tomato", "tamatar"),        ("Tomato",  "टमाटर")),
        (("wheat",  "gehun", "gehu"),  ("Wheat",   "गेहूं")),
    ]
    for keys, crop in mapping:
        if any(k in value for k in keys):
            return crop
    return ("Unknown Crop", "अज्ञात फसल")


def parse_json_from_model_text(value: str) -> dict:
    text = (value or "").strip()
    if not text:
        return {}
    text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except Exception:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except Exception:
                pass
    return {}


VISION_SYSTEM_PROMPT = """You are an advanced agricultural vision assistant (SROA Vision).
Analyze the provided crop photo with extreme precision and respond with strict JSON only.

Required JSON keys:
- cropName: English name (e.g., "Wheat", "Rice", "Tomato")
- cropNameHi: Hindi name (e.g., "गेहूं", "चावल", "टमाटर")
- disease: Specific disease name in English (null if healthy)
- diseaseHi: Specific disease name in Hindi (null if healthy)
- isHealthy: Boolean (true ONLY if no disease/pest/deficiency detected)
- treatment: Detailed treatment in English (chemical/organic/biological)
- treatmentHi: Detailed treatment in Hindi
- confidence: Integer 0-100
- severity: One of "none", "mild", "moderate", "severe"
- additionalTips: Array of max 4 concise preventative advice strings

Rules:
- Identify diseases specifically (e.g., "Wheat Rust", not just "Disease").
- Always provide both English and Hindi.
- Keep advice practical for Indian farmers.
- Return ONLY the JSON object, no other text."""

ANALYZE_SYSTEM_PROMPT = """You are an agricultural analyst specializing in Indian farming.
Analyze the provided weather, market, and crop data to provide actionable recommendations.

Always respond with strict JSON containing these keys:
- recommendation: Either "sell" or "hold"
- insight: Detailed explanation (2-3 sentences)
- crop_health_suggestion: Specific advice for crop health based on weather
- risk_alerts: Array of risk warnings

Be practical and specific to Indian agricultural conditions."""


# ── Image analysis (Gemini → OpenRouter fallback) ─────────────────────────
def analyze_image_gemini(image_base64: str) -> dict:
    image_bytes = base64.b64decode(image_base64)
    response = _gemini.models.generate_content(
        model=GEMINI_VISION_MODEL,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part(text=VISION_SYSTEM_PROMPT),
                    types.Part(inline_data=types.Blob(mime_type="image/jpeg", data=image_bytes)),
                    types.Part(text="Analyze this crop image and return JSON only:"),
                ],
            )
        ],
    )
    return parse_json_from_model_text(response.text)


def analyze_image_openrouter(image_base64: str) -> dict:
    response = _openrouter.chat.completions.create(
        model=OPENROUTER_VISION_MODEL,
        messages=[
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this crop image and return JSON only:"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}},
                ],
            },
        ],
        temperature=0.1,
    )
    return parse_json_from_model_text(response.choices[0].message.content)


def run_image_analysis(image_base64: str) -> tuple[dict, str]:
    """Try Gemini first, fall back to OpenRouter. Returns (data, provider)."""
    errors = []
    if _gemini:
        try:
            return analyze_image_gemini(image_base64), "gemini-vision"
        except Exception as e:
            errors.append(f"Gemini Error: {str(e)}")
    if _openrouter:
        try:
            return analyze_image_openrouter(image_base64), "openrouter-vision"
        except Exception as e:
            errors.append(f"OpenRouter Error: {str(e)}")
    raise RuntimeError(" | ".join(errors) if errors else "No AI providers configured.")



# ── Text analysis (Gemini → OpenRouter fallback) ──────────────────────────
def analyze_text_gemini(system: str, user: str) -> str:
    response = _gemini.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=user,
        config=types.GenerateContentConfig(system_instruction=system, temperature=0.2),
    )
    return response.text


def analyze_text_openrouter(system: str, user: str) -> str:
    response = _openrouter.chat.completions.create(
        model=OPENROUTER_CHAT_MODEL,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.2,
    )
    return response.choices[0].message.content


def run_text_analysis(system: str, user: str) -> tuple[str, str]:
    """Try Gemini first, fall back to OpenRouter. Returns (text, provider)."""
    if _gemini:
        try:
            return analyze_text_gemini(system, user), "gemini"
        except Exception:
            pass
    if _openrouter:
        try:
            return analyze_text_openrouter(system, user), "openrouter"
        except Exception:
            pass
    raise RuntimeError("Both Gemini and OpenRouter text analysis failed.")


# ── Heuristic fallback ────────────────────────────────────────────────────
def heuristic_advice(payload: AnalyzeRequest) -> dict:
    trend     = str(payload.market.get("trend", "")).lower()
    rain_text = str(payload.weather.get("rainfall_prediction", "")).lower()
    risks = []
    if "rain" in rain_text or "storm" in rain_text:
        risks.append("Rain risk is high in next 24-48 hours")
    
    wind_speed = payload.weather.get("wind_speed", 0)
    if float(wind_speed) > 20:
        risks.append("Strong winds may affect standing crops")
    
    mandi_name = payload.market.get("mandi_name", "Local Mandi")
    if trend == "down":
        recommendation = "sell"
        insight = f"{mandi_name} trend is down. Consider selling within 2 days."
    else:
        recommendation = "hold"
        insight = f"{mandi_name} trend is up. Hold for a better price window."
    
    humidity = payload.weather.get("humidity", 0)
    crop_tip = "Monitor pest and moisture levels closely."
    if float(humidity) > 70:
        crop_tip = "High humidity: watch for fungal infection and avoid over-irrigation."
    
    return {"recommendation": recommendation, "insight": insight,
            "crop_health_suggestion": crop_tip, "risk_alerts": risks}


# ── Routes ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "agent-service",
        "providers": {
            "gemini":     "active" if _gemini else "disabled",
            "openrouter": "active" if _openrouter else "disabled",
        },
    }


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    """Analyze crop/weather/market data. Gemini primary, OpenRouter fallback."""
    user_prompt = f"""Analyze this farm data:

Weather: {payload.weather}
Market:  {payload.market}
Crops:   {payload.crops}

Return JSON with recommendation, insight, crop_health_suggestion, and risk_alerts."""

    try:
        text, provider = run_text_analysis(ANALYZE_SYSTEM_PROMPT, user_prompt)
        parsed = parse_json_from_model_text(text)
        if parsed and "recommendation" in parsed:
            parsed["source"] = provider
            return parsed
    except Exception as e:
        result = heuristic_advice(payload)
        result["source"] = "heuristic-fallback"
        result["error"] = str(e)
        return result

    result = heuristic_advice(payload)
    result["source"] = "heuristic-fallback"
    return result


@app.post("/analyze-image")
def analyze_image(payload: AnalyzeImageRequest):
    """Analyze crop image. Gemini primary, OpenRouter fallback."""
    try:
        data, provider = run_image_analysis(payload.image_base64)
        return {
            "cropName":      data.get("cropName") or "Unknown Crop",
            "cropNameHi":    data.get("cropNameHi") or "अज्ञात फसल",
            "disease":       data.get("disease"),
            "diseaseHi":     data.get("diseaseHi"),
            "isHealthy":     bool(data.get("isHealthy", True)),
            "treatment":     data.get("treatment") or "No treatment suggestion available.",
            "treatmentHi":   data.get("treatmentHi") or "उपचार सुझाव उपलब्ध नहीं है।",
            "confidence":    int(max(0, min(100, int(data.get("confidence", 0))))),
            "severity":      data.get("severity") if data.get("severity") in {"none", "mild", "moderate", "severe"} else "none",
            "additionalTips": (data.get("additionalTips") or [])[:4],
            "source":        provider,
        }
    except Exception as err:
        crop_en, crop_hi = fallback_crop_from_filename(payload.filename)
        return {
            "cropName": crop_en, "cropNameHi": crop_hi,
            "disease": None, "diseaseHi": None, "isHealthy": True,
            "treatment":   "AI vision unavailable. Check GEMINI_API_KEY and OPENROUTER_API_KEY.",
            "treatmentHi": "AI vision उपलब्ध नहीं है। कृपया API keys जाँचें।",
            "confidence": 0, "severity": "none",
            "additionalTips": [
                "Ensure GEMINI_API_KEY or OPENROUTER_API_KEY is set.",
                f"Error: {str(err)[:120]}",
                "Capture clear close-up photos in daylight.",
            ],
            "source": "fallback",
        }
