"use client";

import { CheckCircle2, Loader2, Search, Calendar, Dumbbell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DisplayMessage, ToolCallMessage } from "@/features/trainer/api/use-chat";

const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  search_exercises: { label: "Searching exercises", icon: Search },
  create_workout_template: { label: "Creating workout template", icon: Dumbbell },
  schedule_workout: { label: "Scheduling workout", icon: Calendar },
};

function ToolCallCard({ message }: { message: ToolCallMessage }) {
  const meta = TOOL_META[message.toolName] ?? { label: message.toolName, icon: Dumbbell };
  const Icon = meta.icon;
  const done = message.status === "done";
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        border: `1px solid ${done ? "rgba(45,208,127,0.2)" : "rgba(255,90,31,0.2)"}`,
        background: done ? "rgba(45,208,127,0.05)" : "rgba(255,90,31,0.05)",
        color: done ? "#2dd07f" : "#FF5A1F",
        fontSize: 12, fontWeight: 600,
        fontFamily: "ui-monospace, monospace",
        letterSpacing: "0.04em",
      }}>
        {done ? <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }} /> : <Loader2 style={{ width: 14, height: 14, flexShrink: 0, animation: "spin 1s linear infinite" }} />}
        <Icon className="h-3.5 w-3.5" />
        <span>
          {done
            ? meta.label.replace("Searching", "Searched").replace("Creating", "Created").replace("Scheduling", "Scheduled")
            : meta.label + "..."}
        </span>
      </div>
    </div>
  );
}

function CoachAvatar() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "#FF5A1F", color: "#0A0604",
      display: "grid", placeItems: "center",
      fontWeight: 900, fontSize: 12,
      letterSpacing: "-0.02em",
      flexShrink: 0,
      position: "relative",
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
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "#1C1D21",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "#FAFAFA",
      display: "grid", placeItems: "center",
      fontWeight: 800, fontSize: 12,
      letterSpacing: "-0.02em",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{
      display: "inline-flex", gap: 4, alignItems: "center",
      padding: "13px 16px",
      background: "#111113",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 12,
      borderTopLeftRadius: 3,
    }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: "#8A8B92",
          display: "inline-block",
          animation: "ff-typing 1.4s ease-in-out infinite",
          animationDelay: `${delay}s`,
        }} />
      ))}
    </div>
  );
}

export function ChatMessage({ message, userInitials = "ME" }: { message: DisplayMessage; userInitials?: string }) {
  if (message.role === "tool_call") {
    return <ToolCallCard message={message} />;
  }

  const isUser = message.role === "user";
  const isEmpty = !message.content;

  return (
    <div style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      flexDirection: isUser ? "row-reverse" : "row",
    }}>
      {isUser ? <UserAvatar initials={userInitials} /> : <CoachAvatar />}

      <div style={{
        display: "flex", flexDirection: "column",
        gap: 6,
        maxWidth: "calc(100% - 48px)",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        {isEmpty ? (
          <TypingIndicator />
        ) : (
          <div style={{
            padding: "13px 16px",
            borderRadius: 12,
            fontSize: 15,
            lineHeight: 1.55,
            color: isUser ? "#0A0604" : "#FAFAFA",
            background: isUser ? "#FF5A1F" : "#111113",
            border: isUser ? "none" : "1px solid rgba(255,255,255,0.10)",
            borderTopLeftRadius: isUser ? 12 : 3,
            borderTopRightRadius: isUser ? 3 : 12,
            fontWeight: isUser ? 500 : 400,
          }}>
            {!isUser && (
              <p style={{
                margin: "0 0 6px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#FF5A1F",
              }}>
                Forge AI
              </p>
            )}
            {isUser ? (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin: "0 0 8px" }} className="last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#FAFAFA" }}>{children}</strong>,
                  em: ({ children }) => <em style={{ fontStyle: "italic", color: "#B8B9C0" }}>{children}</em>,
                  ul: ({ children }) => <ul style={{ margin: "0 0 8px", paddingLeft: 18 }} className="space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "0 0 8px", paddingLeft: 18 }} className="space-y-1">{children}</ol>,
                  li: ({ children }) => <li style={{ color: "#B8B9C0" }}>{children}</li>,
                  h1: ({ children }) => <h1 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#FAFAFA" }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#FAFAFA" }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#B8B9C0" }}>{children}</h3>,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    return isBlock ? (
                      <code style={{ display: "block", overflowX: "auto", borderRadius: 6, background: "rgba(0,0,0,0.4)", padding: "10px 12px", fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#B8B9C0", margin: "4px 0" }}>
                        {children}
                      </code>
                    ) : (
                      <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 3, fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#FF5A1F" }}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre style={{ margin: "0 0 8px" }}>{children}</pre>,
                  blockquote: ({ children }) => (
                    <blockquote style={{ margin: "0 0 8px", borderLeft: "2px solid rgba(255,90,31,0.5)", paddingLeft: 12, color: "#8A8B92", fontStyle: "italic" }}>
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr style={{ margin: "8px 0", borderColor: "rgba(255,255,255,0.1)" }} />,
                  a: ({ children, href }) => (
                    <a href={href} style={{ color: "#FF5A1F", textDecoration: "underline", textUnderlineOffset: 2 }} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
