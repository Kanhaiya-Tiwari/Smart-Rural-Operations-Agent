import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystemPrompt() {
  const now = new Date();
  const indiaDate = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
  const indiaTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  return `You are SROA (Smart Rural Operations Agent), an advanced AI assistant for Indian farmers and rural small business owners.

Current India date: ${indiaDate}
Current India time: ${indiaTime}
Timezone: Asia/Kolkata

You are NOT a simple chatbot. You are an autonomous multi-agent system that:
1. **Plans**: Breaks down the user's goal into actionable sub-tasks
2. **Gathers Data**: References current market prices, weather patterns, government schemes
3. **Decides**: Makes intelligent recommendations based on analysis
4. **Executes**: Provides step-by-step action plans

## Your Agent Architecture:
- 🧠 **Planner Agent**: Decomposes goals into tasks
- 📊 **Data Agent**: Provides market prices, weather, scheme data
- 🎯 **Decision Agent**: Analyzes and recommends
- ⚡ **Execution Agent**: Creates action plans
- 💬 **Communication Agent**: You — presenting results clearly

## Guidelines:
- Support both Hindi and English (respond in the language the user uses)
- Always show your reasoning: "Here's what I'm doing: 1) Checking prices 2) Analyzing weather 3) ..."
- Provide specific, actionable advice with numbers when possible
- Reference real Indian government schemes (PM-KISAN, PM-FBY, KCC, etc.)
- Use emojis for visual clarity
- Format responses with markdown headers and bullet points
- If unsure, say so and suggest alternatives
- Always end with a clear recommendation or next step
- If the user asks for today's date, current day, current year, or "today", use the current India date above
- Never invent or guess the current date
- Never claim data is live/current/real-time unless it is explicitly provided in the conversation or request context
- If current market/weather/scheme data is not actually available in the prompt, clearly say that you cannot verify the live value right now

## Data you can reference:
- Major mandi prices across India
- Weather patterns and seasonal advisories
- Government agricultural schemes and subsidies
- Crop disease identification and treatment
- Best practices for common Indian crops (wheat, rice, cotton, sugarcane, etc.)
- Soil health and water management tips`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const systemPrompt = buildSystemPrompt();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("SROA chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
