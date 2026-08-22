"use client";

import { useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useConversation } from "@/features/trainer/api/use-conversations";
import { useChat } from "@/features/trainer/api/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

const PROMPT_CHIPS = [
  { cat: "Programming", text: "I'm short on time today — give me a 30-min full-body session." },
  { cat: "Form", text: "Cue me through a heavy deadlift warm-up." },
  { cat: "Recovery", text: "Slept 5 hours and my CNS feels fried. Train or skip?" },
  { cat: "Nutrition", text: "What should I eat 90 minutes before squats?" },
];

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: conversation, isLoading } = useConversation(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, isStreaming, error, sendMessage } = useChat(conversationId, []);

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(
        conversation.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation) return;
    const key = `pending_${conversationId}`;
    const pending = sessionStorage.getItem(key);
    if (pending) {
      sessionStorage.removeItem(key);
      void sendMessage(pending);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#5A5B62",
        }}>
          Loading session…
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;
  const title = conversation?.title ?? "AI Coach Session";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Chat header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 0 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 4,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Coach mark */}
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: "#FF5A1F",
            color: "#0A0604",
            display: "grid", placeItems: "center",
            fontWeight: 900, fontSize: 14,
            letterSpacing: "-0.02em",
            position: "relative",
            flexShrink: 0,
          }}>
            FA
            <span style={{
              position: "absolute",
              bottom: -2, right: -2,
              width: 9, height: 9,
              background: "#2dd07f",
              borderRadius: "50%",
              border: "2px solid #0A0A0C",
              boxShadow: "0 0 5px #2dd07f",
            }} />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-heading, inherit)",
              fontWeight: 800, fontSize: 16,
              letterSpacing: "-0.01em", textTransform: "uppercase",
              color: "#FAFAFA",
            }}>
              {hasMessages ? (title.length > 40 ? title.slice(0, 40) + "…" : title) : "Forge AI Coach"}
            </h1>
            <div style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10, fontWeight: 600,
              color: "#8A8B92",
              letterSpacing: "0.10em", textTransform: "uppercase",
              marginTop: 2,
            }}>
              Online · Knows your numbers
            </div>
          </div>
        </div>
        <Link
          href="/trainer/settings"
          style={{
            width: 34, height: 34,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "#111113",
            color: "#8A8B92",
            display: "grid", placeItems: "center",
            textDecoration: "none",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "#FAFAFA";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            e.currentTarget.style.color = "#8A8B92";
          }}
        >
          <Settings style={{ width: 15, height: 15 }} />
        </Link>
      </div>

      {/* Message list */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 0",
        display: "flex", flexDirection: "column",
        gap: 24,
        minHeight: 0,
      }}>
        {!hasMessages && (
          /* Welcome state when empty */
          <div style={{ padding: "16px 0 8px", maxWidth: 640 }}>
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#FF5A1F",
              display: "block", marginBottom: 14,
            }}>Forge AI · Online</span>
            <h2 style={{
              margin: "0 0 14px",
              fontFamily: "var(--font-heading, inherit)",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 48px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "#FAFAFA",
            }}>
              What are we<br />
              <em style={{ fontStyle: "italic", color: "#FF5A1F" }}>training today?</em>
            </h2>
            <p style={{ color: "#B8B9C0", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", maxWidth: "52ch" }}>
              Ask about form, programming, swaps, recovery — or pick a prompt below.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.cat}
                  onClick={() => sendMessage(chip.text)}
                  disabled={isStreaming}
                  style={{
                    textAlign: "left", padding: "12px 13px",
                    background: "#111113",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 10,
                    color: "#FAFAFA", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: 3,
                    transition: "border-color 0.15s, background 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FF5A1F";
                    e.currentTarget.style.background = "#16171A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                    e.currentTarget.style.background = "#111113";
                  }}
                >
                  <span style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: "#FF5A1F",
                  }}>
                    {chip.cat}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, color: "#B8B9C0" }}>
                    {chip.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.06)",
            fontSize: 13, color: "#f87171",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.03em",
          }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div style={{ flexShrink: 0 }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
