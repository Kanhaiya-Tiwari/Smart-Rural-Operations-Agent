import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="agent-service")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

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
