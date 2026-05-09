import os
import json
from typing import AsyncIterable
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from openai import AsyncOpenAI

router = APIRouter(prefix="/chat", tags=["chat"])

# ── Google Gemini (primary) ────────────────────────────────────────────────
GEMINI_API_KEY  = os.getenv("GEMINI_API_KEY", "")
GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")

# ── OpenRouter (fallback) ─────────────────────────────────────────────────
OPENROUTER_API_KEY  = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_CHAT_MODEL = os.getenv("OPENROUTER_CHAT_MODEL", "google/gemini-2.0-flash-001")

_gemini     = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
_openrouter = AsyncOpenAI(api_key=OPENROUTER_API_KEY, base_url=OPENROUTER_BASE_URL) if OPENROUTER_API_KEY else None


def build_system_prompt() -> str:
    from datetime import datetime
    import pytz

    india_tz   = pytz.timezone("Asia/Kolkata")
    now        = datetime.now(india_tz)
    india_date = now.strftime("%A, %d %B %Y")
    india_time = now.strftime("%I:%M:%S %p")

    return f"""You are SROA (Smart Rural Operations Agent), the most advanced AI companion for Indian farmers and rural small business owners.
Current India date: {india_date}
Current India time: {india_time}
Timezone: Asia/Kolkata

Your mission is to empower farmers with data-driven, practical, and culturally relevant advice.

## Your Capabilities:
1. **Real-time Market Insights**: You analyze mandi prices and predict trends.
2. **Weather Intelligence**: You interpret weather forecasts into actionable farming tasks.
3. **Crop Doctor**: You identify diseases from photos and suggest organic/chemical treatments.
4. **Govt Scheme Navigator**: You guide users through PM-KISAN, PM-FBY, and other subsidies.

## Interaction Style:
- **Language**: Respond in the language used by the user (primarily Hindi or English).
- **Empathy**: Farming is hard work. Be encouraging and respectful. Use "Namaste" and appropriate honorifics.
- **Clarity**: Use markdown formatting, bullet points, and emojis (🌾, 🚜, 📉, 🌤️).
- **Reasoning**: Explain *why* you are making a recommendation.

## Critical Rules:
- If asked for "today", use the date: {india_date}.
- Never claim you have live data if you aren't sure.
- Support both organic (Prakritik kheti) and modern farming techniques.
- Always provide specific dosage or application instructions when suggesting treatments."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


def _sse(content: str) -> str:
    """Wrap content in OpenAI-compatible SSE JSON."""
    return json.dumps({
        "choices": [{
            "delta": {"content": content, "role": "assistant"},
            "index": 0,
            "finish_reason": None,
        }]
    })


async def stream_gemini(messages: list[ChatMessage], system_prompt: str) -> AsyncIterable[str]:
    """Stream from Gemini. Raises on error."""
    contents: list[types.Content] = []
    for msg in messages:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

    async for chunk in await _gemini.aio.models.generate_content_stream(
        model=GEMINI_CHAT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
        ),
    ):
        yield chunk.text or ""


async def stream_openrouter(messages: list[ChatMessage], system_prompt: str) -> AsyncIterable[str]:
    """Stream from OpenRouter. Raises on error."""
    openai_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        role = "user" if msg.role == "user" else "assistant"
        openai_messages.append({"role": role, "content": msg.content})

    async with await _openrouter.chat.completions.create(
        model=OPENROUTER_CHAT_MODEL,
        messages=openai_messages,
        temperature=0.7,
        stream=True,
    ) as stream:
        async for chunk in stream:
            yield chunk.choices[0].delta.content or ""


async def stream_chat_response(messages: list[ChatMessage]) -> AsyncIterable[str]:
    """Try Gemini first; if it fails before any content is yielded, fall back to OpenRouter."""
    system_prompt = build_system_prompt()
    started = False

    # ── Gemini (primary) ─────────────────────────────────────────────────
    if _gemini:
        try:
            async for content in stream_gemini(messages, system_prompt):
                if content:
                    started = True
                    yield f"data: {_sse(content)}\n\n"
            if started:
                yield "data: [DONE]\n\n"
                return
            # Gemini returned nothing but no exception → fall through
        except Exception:
            if started:
                # Already sent partial content; end the stream gracefully
                yield "data: [DONE]\n\n"
                return
            # No content sent yet → fall through to OpenRouter

    # ── OpenRouter (fallback) ─────────────────────────────────────────────
    if _openrouter:
        try:
            async for content in stream_openrouter(messages, system_prompt):
                if content:
                    yield f"data: {_sse(content)}\n\n"
            yield "data: [DONE]\n\n"
            return
        except Exception as e:
            yield f"data: {json.dumps({'error': f'OpenRouter error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"
            return

    # No providers configured
    yield f"data: {json.dumps({'error': 'No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.'})}\n\n"
    yield "data: [DONE]\n\n"


@router.post("")
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint that streams responses. Gemini primary, OpenRouter fallback."""
    return StreamingResponse(
        stream_chat_response(request.messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/health")
def chat_health():
    """Health check for chat service."""
    return {
        "status": "ok",
        "service": "chat",
        "providers": {
            "gemini":     {"model": GEMINI_CHAT_MODEL,     "active": bool(_gemini)},
            "openrouter": {"model": OPENROUTER_CHAT_MODEL, "active": bool(_openrouter)},
        },
    }
