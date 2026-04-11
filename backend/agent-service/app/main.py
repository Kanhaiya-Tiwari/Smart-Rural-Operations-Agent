import os
import json
import re
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="agent-service")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


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
    weather: WeatherData
    market: MarketData


class AnalyzeImageRequest(BaseModel):
    image_base64: str
    filename: str | None = None


def fallback_crop_from_filename(filename: str | None) -> tuple[str, str]:
    value = (filename or "").lower()
    mapping = [
        (("carrot", "gajar"), ("Carrot", "गाजर")),
        (("potato", "aloo", "aalu"), ("Potato", "आलू")),
        (("onion", "pyaj", "pyaaz"), ("Onion", "प्याज")),
        (("tomato", "tamatar"), ("Tomato", "टमाटर")),
        (("wheat", "gehun", "gehu"), ("Wheat", "गेहूं")),
    ]

    for keys, crop in mapping:
        if any(key in value for key in keys):
            return crop

    return ("Unknown Crop", "अज्ञात फसल")


def parse_json_from_model_text(value: str) -> dict:
    text = (value or "").strip()
    if not text:
        return {}

    # Handle markdown-wrapped JSON responses.
    text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"```$", "", text).strip()

    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                return {}
        return {}


def gemini_analyze_image(image_base64: str) -> dict:
    model_candidates = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
    ]

    prompt = (
        "You are an agricultural vision assistant. Analyze this crop photo and return strict JSON only with keys: "
        "cropName, cropNameHi, disease, diseaseHi, isHealthy, treatment, treatmentHi, confidence, severity, additionalTips. "
        "Rules: confidence integer 0-100; severity one of none,mild,moderate,severe; additionalTips max 4 concise strings. "
        "If not sure, keep disease null and lower confidence."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }

    last_error = "Gemini request failed"
    for model_name in model_candidates:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model_name}:generateContent?key={GEMINI_API_KEY}"
        )
        try:
            resp = httpx.post(url, json=payload, timeout=35)
            resp.raise_for_status()
            body = resp.json()
            text = (
                body.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            parsed = parse_json_from_model_text(text)
            if parsed:
                return parsed
            last_error = f"Empty/invalid JSON from model {model_name}"
        except Exception as err:
            last_error = str(err)

    raise RuntimeError(last_error)


@app.get("/health")
def health():
    return {"status": "ok", "service": "agent-service"}


def heuristic_advice(payload: AnalyzeRequest):
    trend = payload.market.trend.lower()
    rain_text = payload.weather.rainfall_prediction.lower()

    risks = []
    if "rain" in rain_text or "storm" in rain_text:
        risks.append("Rain risk is high in next 24-48 hours")
    if float(payload.weather.wind_speed) > 20:
        risks.append("Strong winds may affect standing crops")
    if trend == "down":
        recommendation = "sell"
        insight = f"{payload.market.mandi_name} trend is down. Consider selling within 2 days."
    else:
        recommendation = "hold"
        insight = f"{payload.market.mandi_name} trend is up. Hold for a better price window."

    crop_tip = "Monitor pest and moisture levels closely."
    if float(payload.weather.humidity) > 70:
        crop_tip = "High humidity: watch for fungal infection and avoid over-irrigation."

    return {
        "recommendation": recommendation,
        "insight": insight,
        "crop_health_suggestion": crop_tip,
        "risk_alerts": risks,
    }


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    if not OPENAI_API_KEY or OpenAI is None:
        result = heuristic_advice(payload)
        result["source"] = "heuristic"
        return result

    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = (
        "You are an agri analyst. Return strict JSON with keys: recommendation, insight, crop_health_suggestion, risk_alerts. "
        f"Input weather={payload.weather.model_dump()} market={payload.market.model_dump()} crops={payload.crops}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        text = response.choices[0].message.content or ""
        return {
            "recommendation": "hold",
            "insight": text,
            "crop_health_suggestion": "Review moisture and harvest schedule",
            "risk_alerts": [],
            "source": "openai",
        }
    except Exception:
        result = heuristic_advice(payload)
        result["source"] = "heuristic-fallback"
        return result


@app.post("/analyze-image")
def analyze_image(payload: AnalyzeImageRequest):
    gemini_error = ""

    if GEMINI_API_KEY:
        try:
            data = gemini_analyze_image(payload.image_base64)
            return {
                "cropName": data.get("cropName") or "Unknown Crop",
                "cropNameHi": data.get("cropNameHi") or "अज्ञात फसल",
                "disease": data.get("disease"),
                "diseaseHi": data.get("diseaseHi"),
                "isHealthy": bool(data.get("isHealthy", False)),
                "treatment": data.get("treatment") or "No treatment suggestion available.",
                "treatmentHi": data.get("treatmentHi") or "उपचार सुझाव उपलब्ध नहीं है।",
                "confidence": int(max(0, min(100, int(data.get("confidence", 0))))),
                "severity": data.get("severity") if data.get("severity") in {"none", "mild", "moderate", "severe"} else "none",
                "additionalTips": (data.get("additionalTips") or [])[:4],
                "source": "gemini-vision",
            }
        except Exception as err:
            gemini_error = str(err)

    if not OPENAI_API_KEY or OpenAI is None:
        crop_en, crop_hi = fallback_crop_from_filename(payload.filename)
        guidance = (
            "Gemini image API failed. Check if key is valid and Generative Language API is enabled."
            if GEMINI_API_KEY
            else "Real image AI is unavailable because neither GEMINI_API_KEY nor OPENAI_API_KEY is configured."
        )
        return {
            "cropName": crop_en,
            "cropNameHi": crop_hi,
            "disease": None,
            "diseaseHi": None,
            "isHealthy": True,
            "treatment": guidance,
            "treatmentHi": "AI image analysis unavailable है। GEMINI/OpenAI key और API access verify करें।",
            "confidence": 0,
            "severity": "none",
            "additionalTips": [
                tip
                for tip in [
                    "Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env.",
                    f"Gemini error: {gemini_error}" if gemini_error else None,
                    "Capture clear close-up photos in daylight.",
                ]
                if tip
            ],
            "source": "fallback-no-ai",
        }

    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = (
        "You are an agricultural vision assistant. Analyze the uploaded crop photo and return strict JSON with keys: "
        "cropName, cropNameHi, disease, diseaseHi, isHealthy, treatment, treatmentHi, confidence, severity, additionalTips. "
        "Rules: confidence must be integer 0-100; severity one of none|mild|moderate|severe; additionalTips max 4 concise strings. "
        "If uncertain, set disease to null and confidence low."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{payload.image_base64}"
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
        )

        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        return {
            "cropName": data.get("cropName") or "Unknown Crop",
            "cropNameHi": data.get("cropNameHi") or "अज्ञात फसल",
            "disease": data.get("disease"),
            "diseaseHi": data.get("diseaseHi"),
            "isHealthy": bool(data.get("isHealthy", False)),
            "treatment": data.get("treatment") or "No treatment suggestion available.",
            "treatmentHi": data.get("treatmentHi") or "उपचार सुझाव उपलब्ध नहीं है।",
            "confidence": int(max(0, min(100, int(data.get("confidence", 0))))),
            "severity": data.get("severity") if data.get("severity") in {"none", "mild", "moderate", "severe"} else "none",
            "additionalTips": (data.get("additionalTips") or [])[:4],
            "source": "openai-vision",
        }
    except Exception:
        crop_en, crop_hi = fallback_crop_from_filename(payload.filename)
        return {
            "cropName": crop_en,
            "cropNameHi": crop_hi,
            "disease": None,
            "diseaseHi": None,
            "isHealthy": True,
            "treatment": "Image AI temporarily failed. Retry in a moment.",
            "treatmentHi": "Image AI अस्थायी रूप से फेल हुआ। थोड़ी देर में फिर कोशिश करें।",
            "confidence": 0,
            "severity": "none",
            "additionalTips": ["Retake a clearer photo with good lighting."],
            "source": "openai-vision-fallback",
        }
