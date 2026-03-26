import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="user-profile-service")
POSTGRES_DSN = os.getenv("POSTGRES_DSN", "postgresql://sroa:sroa@localhost:5432/sroa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NotificationSettings(BaseModel):
    in_app: bool = True
    sms: bool = False
    whatsapp: bool = False


class UserProfile(BaseModel):
    user_id: str
    location: str = Field(min_length=2)
    crops: list[str] = Field(default_factory=list)
    language: str = Field(default="en", pattern="^(en|hi)$")
    notification_settings: NotificationSettings
    privacy: dict = Field(default_factory=lambda: {"share_data_for_insights": True, "allow_personalized_ai": True})
    phone: str | None = None
    whatsapp_number: str | None = None


def get_conn():
    return psycopg2.connect(POSTGRES_DSN)


@app.get("/health")
def health():
    return {"status": "ok", "service": "user-profile-service"}


@app.get("/profile/{user_id}")
def get_profile(user_id: str):
    with get_conn() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM user_profiles WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="profile not found")
        return {
            "user_id": row["user_id"],
            "location": row["location"],
            "crops": row["crops"],
            "language": row["language"],
            "notification_settings": {
                "in_app": row["notify_in_app"],
                "sms": row["notify_sms"],
                "whatsapp": row["notify_whatsapp"],
            },
            "privacy": {
                "share_data_for_insights": row["privacy_share_data"],
                "allow_personalized_ai": row["privacy_personalized_ai"],
            },
            "phone": row["phone"],
            "whatsapp_number": row["whatsapp_number"],
            "updated_at": row["updated_at"],
        }


@app.put("/profile/{user_id}")
def upsert_profile(user_id: str, profile: UserProfile):
    if user_id != profile.user_id:
        raise HTTPException(status_code=400, detail="path user_id must match body user_id")

    with get_conn() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO user_profiles (user_id, location, crops, language, notify_in_app, notify_sms, notify_whatsapp, privacy_share_data, privacy_personalized_ai, phone, whatsapp_number, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
              location = EXCLUDED.location,
              crops = EXCLUDED.crops,
              language = EXCLUDED.language,
              notify_in_app = EXCLUDED.notify_in_app,
              notify_sms = EXCLUDED.notify_sms,
              notify_whatsapp = EXCLUDED.notify_whatsapp,
                            privacy_share_data = EXCLUDED.privacy_share_data,
                            privacy_personalized_ai = EXCLUDED.privacy_personalized_ai,
              phone = EXCLUDED.phone,
              whatsapp_number = EXCLUDED.whatsapp_number,
              updated_at = NOW()
            RETURNING updated_at;
            """,
            (
                profile.user_id,
                profile.location,
                profile.crops,
                profile.language,
                profile.notification_settings.in_app,
                profile.notification_settings.sms,
                profile.notification_settings.whatsapp,
                bool(profile.privacy.get("share_data_for_insights", True)),
                bool(profile.privacy.get("allow_personalized_ai", True)),
                profile.phone,
                profile.whatsapp_number,
            ),
        )
        row = cur.fetchone()
    return {"status": "saved", "updated_at": row["updated_at"]}
