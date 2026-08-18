"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/fetcher";
import { ChatInput } from "./chat-input";
import type { Conversation } from "@/features/trainer/api/use-conversations";

const PROMPT_CHIPS = [
  { cat: "Programming", text: "I'm short on time today — give me a 30-min full-body session." },
  { cat: "Form", text: "Cue me through a heavy deadlift warm-up." },
  { cat: "Recovery", text: "Slept 5 hours and my CNS feels fried. Train or skip?" },
  { cat: "Nutrition", text: "What should I eat 90 minutes before squats?" },
];

export function NewChatWindow() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleSend(content: string) {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const conversation = await apiFetch<Conversation>("/api/ai/conversations", { method: "POST" });
      sessionStorage.setItem(`pending_${conversation.id}`, content);
      router.push(`/trainer/${conversation.id}`);
    } catch {
      setIsCreating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Welcome state */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 32 }}>
        <div style={{ maxWidth: 640 }}>
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#FF5A1F",
            display: "block", marginBottom: 16,
          }}>
            Forge AI · v 4.2
          </span>
          <h2 style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-heading, inherit)",
            fontWeight: 900,
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            textTransform: "uppercase",
            color: "#FAFAFA",
          }}>
            What are we<br />
            <em style={{ fontStyle: "italic", color: "#FF5A1F", fontWeight: 900 }}>training today?</em>
          </h2>
          <p style={{
            color: "#B8B9C0",
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: "56ch",
            margin: "0 0 28px",
          }}>
            Your AI coach is online — ask about form, programming, recovery, or
            start a session with one of the prompts below.
          </p>

          {/* Prompt chips 2×2 grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}>
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip.cat}
                onClick={() => handleSend(chip.text)}
                disabled={isCreating}
                style={{
                  textAlign: "left",
                  padding: "13px 14px",
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  color: "#FAFAFA",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 4,
                  transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FF5A1F";
                  e.currentTarget.style.background = "#16171A";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                  e.currentTarget.style.background = "#111113";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "#FF5A1F",
                }}>
                  {chip.cat}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: "#FAFAFA" }}>
                  {chip.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={isCreating} />
    </div>
  );
}
