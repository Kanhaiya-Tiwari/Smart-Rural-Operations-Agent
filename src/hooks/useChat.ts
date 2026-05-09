import { useState, useCallback } from "react";
import { serviceUrl } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${serviceUrl(8096)}/chat`;

function buildRuntimeContextMessage(): Message {
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

  return {
    role: "user",
    content:
      `System context for accuracy: Current India date is ${indiaDate}. Current India time is ${indiaTime}. ` +
      "If asked for today, current day, current month, or current year, use this date context. " +
      "Do not invent live or real-time facts unless they are explicitly provided in the conversation.",
  };
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🌾 **Namaste! I'm SROA** — your Smart Rural Operations Agent.\n\nI can help you with:\n- 📈 Best crop prices & mandi rates\n- 🌦️ Weather-based harvest decisions\n- 🏛️ Government schemes you can apply for\n- 🐛 Crop damage solutions\n\nTell me your goal and I'll take care of the rest!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (input: string) => {
      const userMsg: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      let assistantSoFar = "";
      const allMessages = [...messages, userMsg];
      const requestMessages = [
        buildRuntimeContextMessage(),
        ...allMessages,
      ];

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: requestMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!resp.ok || !resp.body) {
          throw new Error(`Request failed: ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantSoFar += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                    return prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                    );
                  }
                  return [...prev, { role: "assistant", content: assistantSoFar }];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e) {
        console.error("Chat error:", e);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Sorry, I couldn't process that. Please try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return { messages, isLoading, sendMessage };
}
