import json
import os
from difflib import SequenceMatcher
from datetime import datetime, timezone
import httpx
import redis
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="market-service")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
AGMARKNET_API_KEY = os.getenv("AGMARKNET_API_KEY", "")
CACHE_TTL_SECONDS = 600
AGMARKNET_ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
COMMODITY_ALIASES = {
    "wheat": ["Wheat"],
    "rice": ["Rice", "Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)"],
    "paddy": ["Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)", "Rice"],
    "potato": ["Potato"],
    "onion": ["Onion"],
    "maize": ["Maize"],
    "corn": ["Maize"],
    "mustard": ["Mustard"],
    "soybean": ["Soyabean"],
    "soyabean": ["Soyabean"],
    "tomato": ["Tomato"],
    "cotton": ["Cotton"],
}

BASE_PRICES = {
    "wheat": 2275,
    "rice": 2183,
    "paddy": 2183,
    "maize": 2090,
    "soybean": 4892,
    "mustard": 5650,
    "cotton": 7121,
    "tomato": 1500,
    "potato": 1200,
    "onion": 2000,
}

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


def commodity_candidates(crop: str) -> list[str]:
    crop_key = crop.strip().lower()
    aliases = COMMODITY_ALIASES.get(crop_key)
    if aliases:
        return aliases
    normalized = crop.strip().title()
    return [normalized]


def location_tokens(location: str) -> list[str]:
    return [token.strip().lower() for token in location.replace("/", ",").split(",") if token.strip()]


def record_score(record: dict, tokens: list[str]) -> float:
    haystacks = [
        str(record.get("district", "")).lower(),
        str(record.get("market", "")).lower(),
        str(record.get("state", "")).lower(),
    ]
    if not tokens:
        return 0.0

    score = 0.0
    for token in tokens:
        for haystack in haystacks:
            if not haystack:
                continue
            if token == haystack:
                score += 10
            elif token in haystack or haystack in token:
                score += 5
            else:
                score += SequenceMatcher(None, token, haystack).ratio()
    return score


def choose_best_record(records: list[dict], location: str) -> dict | None:
    if not records:
        return None
    tokens = location_tokens(location)
    ranked = sorted(records, key=lambda record: record_score(record, tokens), reverse=True)
    return ranked[0]


def parse_arrival_date(value: str | None) -> str:
    if not value:
        return datetime.now(timezone.utc).isoformat()

    for date_format in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(value, date_format)
            return parsed.replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue

    return datetime.now(timezone.utc).isoformat()


def fetch_records(params: dict) -> list[dict]:
    try:
        resp = httpx.get(AGMARKNET_ENDPOINT, params=params, timeout=5)
        if resp.status_code == 200:
            return resp.json().get("records") or []
    except Exception as e:
        print(f"Mandi API error: {e}")
    return []


def fetch_records_public(params: dict) -> list[dict]:
    try:
        resp = httpx.get(AGMARKNET_ENDPOINT, params=params, timeout=10)
    except httpx.HTTPError:
        return []

    if resp.status_code != 200:
        return []

    data = resp.json()
    return data.get("records") or []


def estimate_market_price(crop: str, location: str) -> dict:
    crop_key = crop.strip().lower()
    base_price = BASE_PRICES.get(crop_key, 3000)
    district_name = location.split(",")[0].strip().title() if location else "Local"

    day = datetime.now(timezone.utc).day
    month = datetime.now(timezone.utc).month
    drift = ((day * 31 + month * 17 + len(crop_key) * 7) % 9) - 4
    price = base_price + drift * max(1, round(base_price / 100))
    trend = "down" if drift < 0 else "up"

    return {
        "crop": crop,
        "location": location,
        "mandi_name": f"{district_name} Mandi (Estimated)",
        "price": max(1, int(price)),
        "trend": trend,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "estimated-fallback",
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "market-service"}


@app.get("/market-price")
def market_price(crop: str = Query(...), location: str = Query(...)):
    key = f"market:{crop.lower()}:{location.lower()}"
    client = get_redis_client()
    cached = client.get(key)
    if cached:
        return json.loads(cached)

    district_name = location.split(",")[0].strip().title()
    aliases = commodity_candidates(crop)
    latest = None

    if not AGMARKNET_API_KEY:
        for alias in aliases:
            public_records = fetch_records_public(
                {
                    "format": "json",
                    "limit": 50,
                    "filters[commodity]": alias,
                    "filters[district]": district_name,
                }
            )
            latest = choose_best_record(public_records, location)
            if latest:
                break

        if latest is None:
            for alias in aliases:
                public_records = fetch_records_public(
                    {
                        "format": "json",
                        "limit": 100,
                        "filters[commodity]": alias,
                    }
                )
                latest = choose_best_record(public_records, location)
                if latest:
                    break

        if latest is None:
            estimated = estimate_market_price(crop, location)
            client.setex(key, CACHE_TTL_SECONDS, json.dumps(estimated))
            return estimated

    if AGMARKNET_API_KEY:
        for alias in aliases:
            exact_records = fetch_records(
                {
                    "api-key": AGMARKNET_API_KEY,
                    "format": "json",
                    "limit": 50,
                    "filters[commodity]": alias,
                    "filters[district]": district_name,
                }
            )
            latest = choose_best_record(exact_records, location)
            if latest:
                break

        if latest is None:
            for alias in aliases:
                broad_records = fetch_records(
                    {
                        "api-key": AGMARKNET_API_KEY,
                        "format": "json",
                        "limit": 100,
                        "filters[commodity]": alias,
                    }
                )
                latest = choose_best_record(broad_records, location)
                if latest:
                    break

    if latest is None:
        # Final fallback to estimated data if no live records found (or API failed)
        estimated = estimate_market_price(crop, location)
        client.setex(key, CACHE_TTL_SECONDS, json.dumps(estimated))
        return estimated

    market_name = latest.get("market") or f"{district_name} Mandi"
    district = latest.get("district") or district_name
    state = latest.get("state") or "India"
    price_raw = latest.get("modal_price") or latest.get("max_price") or latest.get("min_price")
    try:
        price = int(str(price_raw).replace(",", "").strip())
    except ValueError:
        raise HTTPException(status_code=502, detail="Invalid live mandi price format")

    previous_price_key = f"market-prev:{crop.lower()}:{location.lower()}"
    previous_price = client.get(previous_price_key)
    trend = "up"
    if previous_price is not None:
        prev = int(previous_price)
        trend = "down" if price < prev else "up"
    client.setex(previous_price_key, 86400, str(price))

    last_updated = parse_arrival_date(latest.get("arrival_date"))

    payload = {
        "crop": crop,
        "location": location,
        "mandi_name": f"{market_name}, {district}, {state}",
        "price": price,
        "trend": trend,
        "last_updated": last_updated,
        "source": "agmarknet-live",
    }
    client.setex(key, CACHE_TTL_SECONDS, json.dumps(payload))
    return payload
