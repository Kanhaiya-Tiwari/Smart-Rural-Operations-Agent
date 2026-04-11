import os
import uuid
import psycopg2
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg2.extras import Json

app = FastAPI(title="notification-service")
POSTGRES_DSN = os.getenv("POSTGRES_DSN", "postgresql://sroa:sroa@localhost:5432/sroa")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluateRequest(BaseModel):
    user_id: str
    weather: dict
    market: dict
    analysis: dict


class RuleSyncRequest(BaseModel):
    rules: list[dict]


def get_conn():
    return psycopg2.connect(POSTGRES_DSN)


def init_tables():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS alert_rules (
                id UUID PRIMARY KEY,
                user_id TEXT NOT NULL,
                rule_id TEXT NOT NULL,
                rule_payload JSONB NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (user_id, rule_id)
            );
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_alert_rules_user_updated
            ON alert_rules (user_id, updated_at DESC);
            """
        )


@app.on_event("startup")
def startup():
    init_tables()


@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}


@app.get("/alert-rules/{user_id}")
def get_alert_rules(user_id: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT rule_payload
            FROM alert_rules
            WHERE user_id = %s
            ORDER BY updated_at DESC
            """,
            (user_id,),
        )
        rows = cur.fetchall()

    return {"rules": [row[0] for row in rows]}


@app.put("/alert-rules/{user_id}")
def put_alert_rules(user_id: str, payload: RuleSyncRequest):
    # Replace strategy keeps client/server state deterministic across devices.
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM alert_rules WHERE user_id = %s", (user_id,))

        for rule in payload.rules:
            rule_id = str(rule.get("id", "")).strip()
            if not rule_id:
                continue
            cur.execute(
                """
                INSERT INTO alert_rules (id, user_id, rule_id, rule_payload, updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                """,
                (str(uuid.uuid4()), user_id, rule_id, Json(rule)),
            )

    return {"status": "saved", "count": len(payload.rules)}


def persist_notification(user_id: str, title: str, message: str, channel: str, severity: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT 1 FROM notifications
            WHERE user_id = %s AND title = %s AND message = %s AND channel = %s
              AND created_at > NOW() - INTERVAL '30 minutes'
            LIMIT 1
            """,
            (user_id, title, message, channel),
        )
        exists = cur.fetchone()
        if exists:
            return

        cur.execute(
            "INSERT INTO notifications (id, user_id, title, message, channel, severity) VALUES (%s, %s, %s, %s, %s, %s)",
            (str(uuid.uuid4()), user_id, title, message, channel, severity),
        )


def send_twilio_message(to: str, body: str, from_number: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return False
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    resp = requests.post(
        url,
        data={"From": from_number, "To": to, "Body": body},
        auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
        timeout=8,
    )
    return resp.status_code < 300


def get_user_notification_settings(user_id: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT notify_in_app, notify_sms, notify_whatsapp, phone, whatsapp_number FROM user_profiles WHERE user_id = %s",
            (user_id,),
        )
        row = cur.fetchone()

    if not row:
        return {
            "notify_in_app": True,
            "notify_sms": False,
            "notify_whatsapp": False,
            "phone": None,
            "whatsapp_number": None,
        }

    return {
        "notify_in_app": row[0],
        "notify_sms": row[1],
        "notify_whatsapp": row[2],
        "phone": row[3],
        "whatsapp_number": row[4],
    }


def emit(user_id: str, title: str, message: str, severity: str):
    settings = get_user_notification_settings(user_id)

    if settings["notify_in_app"]:
        persist_notification(user_id, title, message, "in_app", severity)

    if settings["notify_whatsapp"] and settings["whatsapp_number"]:
        send_twilio_message(
            f"whatsapp:{settings['whatsapp_number']}",
            f"{title}: {message}",
            TWILIO_WHATSAPP_FROM,
        )
        persist_notification(user_id, title, message, "whatsapp", severity)

    if settings["notify_sms"] and settings["phone"] and TWILIO_SMS_FROM:
        send_twilio_message(settings["phone"], f"{title}: {message}", TWILIO_SMS_FROM)
        persist_notification(user_id, title, message, "sms", severity)


@app.post("/alerts/evaluate")
def evaluate(payload: EvaluateRequest):
    created = []

    rainfall_text = str(payload.weather.get("rainfall_prediction", "")).lower()
    if "rain" in rainfall_text or "storm" in rainfall_text:
        title = "Weather Alert"
        message = "Heavy rain expected tomorrow. Delay harvest and protect stock."
        emit(payload.user_id, title, message, "warning")
        created.append({"title": title, "message": message, "severity": "warning"})

    trend = str(payload.market.get("trend", "")).lower()
    if trend == "down":
        title = "Market Drop"
        message = "Market trend is down. Consider selling quickly."
        emit(payload.user_id, title, message, "critical")
        created.append({"title": title, "message": message, "severity": "critical"})
    elif trend == "up":
        title = "Market Opportunity"
        message = "Market trend is up. Good window to hold and sell later."
        emit(payload.user_id, title, message, "info")
        created.append({"title": title, "message": message, "severity": "info"})

    for risk in payload.analysis.get("risk_alerts", []):
        emit(payload.user_id, "Crop Risk", risk, "warning")
        created.append({"title": "Crop Risk", "message": risk, "severity": "warning"})

    return {"status": "ok", "alerts": created}


@app.get("/alerts/{user_id}")
def list_alerts(user_id: str, limit: int = 20):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, title, message, channel, severity, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (user_id, limit),
        )
        rows = cur.fetchall()
    return {
        "alerts": [
            {
                "id": str(r[0]),
                "title": r[1],
                "message": r[2],
                "channel": r[3],
                "severity": r[4],
                "created_at": r[5].isoformat() if r[5] else None,
            }
            for r in rows
        ]
    }
