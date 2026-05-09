import json
import os
import re
from datetime import datetime, timezone
from typing import Any
import httpx
import redis
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="weather-service")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_TTL_SECONDS = 600

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MockRedis:
    def __init__(self):
        self._data = {}
        print("Using MockRedis (No Redis server detected)")

    def get(self, key):
        return self._data.get(key)

    def set(self, key, value, *args, **kwargs):
        self._data[key] = value

    def setex(self, key, time, value):
        self._data[key] = value


def get_redis_client() -> redis.Redis:
    try:
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        return client
    except Exception:
        return MockRedis()  # type: ignore


def location_candidates(location: str) -> list[str]:
    normalized_location = re.sub(r"\s+", " ", location.replace("/", " ").strip())
    normalized_location = re.sub(r"\b\d{5,6}\b", "", normalized_location).strip()
    parts = [part.strip() for part in normalized_location.split(",") if part.strip()]
    candidates: list[str] = []
    simplified = normalized_location

    for suffix in (" ncr", " district", " dist", " tehsil", " mandi", " city", " india"):
        if simplified.lower().endswith(suffix):
            simplified = simplified[: -len(suffix)].strip()

    if normalized_location:
        candidates.append(normalized_location)

    if simplified and simplified.lower() != normalized_location.lower():
        candidates.append(simplified)

    if parts:
        candidates.append(parts[0])

    if len(parts) > 1:
        candidates.append(", ".join(parts[:2]))
        candidates.append(f"{parts[0]}, India")

    words = [word for word in simplified.split() if word]
    if words:
        candidates.append(words[0])
        candidates.append(words[-1])
    if len(words) > 1:
        candidates.append(" ".join(words[:2]))
        candidates.append(" ".join(words[-2:]))

    seen: set[str] = set()
    unique_candidates: list[str] = []
    for candidate in candidates:
        lowered = candidate.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        unique_candidates.append(candidate)

    return unique_candidates


def normalize_weather(data: dict[str, Any], location: str) -> dict[str, Any]:
    weather_main = (data.get("weather") or [{}])[0].get("main", "Unknown")
    return {
        "location": location,
        "temperature": data.get("main", {}).get("temp"),
        "humidity": data.get("main", {}).get("humidity"),
        "wind_speed": data.get("wind", {}).get("speed"),
        "rainfall_prediction": weather_main,
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "source": "openweather",
    }


def normalize_open_meteo_weather(data: dict[str, Any], location: str) -> dict[str, Any] | None:
    current = data.get("current") or data.get("current_weather")
    if not current:
        return None

    weather_code_raw = current.get("weather_code", current.get("weathercode"))
    weather_code = int(weather_code_raw) if weather_code_raw is not None else -1
    temperature = current.get("temperature_2m", current.get("temperature"))
    humidity = current.get("relative_humidity_2m")
    wind_speed = current.get("wind_speed_10m", current.get("windspeed"))

    weather_text = {
        0: "Clear",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Fog",
        51: "Drizzle",
        53: "Drizzle",
        55: "Drizzle",
        56: "Freezing Drizzle",
        57: "Freezing Drizzle",
        61: "Rain",
        63: "Rain",
        65: "Heavy Rain",
        66: "Freezing Rain",
        67: "Freezing Rain",
        71: "Snow",
        73: "Snow",
        75: "Heavy Snow",
        80: "Rain Showers",
        81: "Rain Showers",
        82: "Heavy Rain Showers",
        95: "Thunderstorm",
        96: "Thunderstorm",
        99: "Thunderstorm",
    }.get(weather_code, "Unknown")

    return {
        "location": location,
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "rainfall_prediction": weather_text,
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "source": "open-meteo",
    }


async def fetch_weather_by_query(http: httpx.AsyncClient, query: str, location: str) -> dict[str, Any] | None:
    resp = await http.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={"q": query, "appid": OPENWEATHER_API_KEY, "units": "metric"},
    )
    if resp.status_code == 200:
        return normalize_weather(resp.json(), location)
    return None


async def fetch_weather_by_geocode(http: httpx.AsyncClient, query: str, location: str) -> dict[str, Any] | None:
    geo_resp = await http.get(
        "https://api.openweathermap.org/geo/1.0/direct",
        params={"q": query, "limit": 5, "appid": OPENWEATHER_API_KEY},
    )
    if geo_resp.status_code != 200:
        return None

    places = geo_resp.json()
    if not places:
        return None

    place = places[0]
    lat = place.get("lat")
    lon = place.get("lon")
    if lat is None or lon is None:
        return None

    weather_resp = await http.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric"},
    )
    if weather_resp.status_code != 200:
        return None

    return normalize_weather(weather_resp.json(), location)


async def fetch_weather_via_open_meteo(http: httpx.AsyncClient, query: str, location: str) -> dict[str, Any] | None:
    geocode_resp = await http.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": query, "count": 5, "language": "en", "format": "json"},
    )
    if geocode_resp.status_code != 200:
        return None

    results = geocode_resp.json().get("results") or []
    if not results:
        return None

    place = results[0]
    lat = place.get("latitude")
    lon = place.get("longitude")
    if lat is None or lon is None:
        return None

    weather_resp = await http.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "timezone": "auto",
        },
    )
    if weather_resp.status_code != 200:
        return None

    return normalize_open_meteo_weather(weather_resp.json(), location)


@app.get("/health")
def health():
    return {"status": "ok", "service": "weather-service"}


@app.get("/weather")
async def get_weather(location: str = Query(..., min_length=2)):
    cache_key = f"weather:{location.lower()}"
    client = get_redis_client()

    cached = client.get(cache_key)
    if cached:
        return json.loads(cached)

    try:
        async with httpx.AsyncClient(timeout=8.0) as http:
            last_error: str | None = None
            for candidate in location_candidates(location):
                if OPENWEATHER_API_KEY:
                    payload = await fetch_weather_by_query(http, candidate, location)
                    if payload is not None:
                        client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(payload))
                        return payload

                    payload = await fetch_weather_by_geocode(http, candidate, location)
                    if payload is not None:
                        client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(payload))
                        return payload

                payload = await fetch_weather_via_open_meteo(http, candidate, location)
                if payload is not None:
                    client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(payload))
                    return payload

                last_error = '{"cod":"404","message":"city not found"}'

            raise HTTPException(status_code=502, detail=f"weather provider error: {last_error}")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch live weather data")
