import os
import uuid
import base64
import hashlib
import hmac
import secrets
import psycopg2
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from pydantic import BaseModel

app = FastAPI(title="auth-service")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
POSTGRES_DSN = os.getenv("POSTGRES_DSN", "postgresql://sroa:sroa@localhost:5432/sroa")
ALGORITHM = "HS256"
PBKDF2_ITERATIONS = 200_000

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    user_id: str
    email: str
    name: str
    token_type: str = "bearer"


def get_conn():
    return psycopg2.connect(POSTGRES_DSN)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    digest_b64 = base64.b64encode(digest).decode("utf-8")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algo, iter_text, salt_b64, digest_b64 = encoded.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iterations = int(iter_text)
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected = base64.b64decode(digest_b64.encode("utf-8"))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def ensure_schema() -> None:
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )


def issue_token(user_id: str):
    expires = datetime.now(timezone.utc) + timedelta(hours=12)
    return jwt.encode(
        {
            "sub": user_id,
            "exp": int(expires.timestamp()),
            "iat": int(datetime.now(timezone.utc).timestamp()),
        },
        JWT_SECRET,
        algorithm=ALGORITHM,
    )


@app.get("/health")
def health():
    ensure_schema()
    return {"status": "ok", "service": "auth-service"}


@app.post("/auth/register", response_model=TokenResponse)
def register(payload: RegisterRequest):
    ensure_schema()
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user_id = str(uuid.uuid4())
    password_hash = hash_password(payload.password)

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id FROM users WHERE email = %s", (payload.email.lower(),))
        exists = cur.fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="Email already registered")

        cur.execute(
            "INSERT INTO users (id, name, email, password_hash) VALUES (%s, %s, %s, %s)",
            (user_id, payload.name.strip(), payload.email.lower().strip(), password_hash),
        )

    return TokenResponse(
        access_token=issue_token(user_id),
        user_id=user_id,
        email=payload.email.lower().strip(),
        name=payload.name.strip(),
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    ensure_schema()
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, name, email, password_hash FROM users WHERE email = %s", (payload.email.lower().strip(),))
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id, name, email, password_hash = row
    if not verify_password(payload.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(
        access_token=issue_token(str(user_id)),
        user_id=str(user_id),
        email=email,
        name=name,
    )
