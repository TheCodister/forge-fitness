"use client";

import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Ask about form, programming, recovery, anything…" }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(200, el.scrollHeight) + "px";
    }
  }

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div style={{
      background: "color-mix(in oklab, #0A0A0C 92%, transparent)",
      backdropFilter: "blur(8px)",
      paddingTop: 16,
    }}>
      <div style={{
        background: "#111113",
        border: `1px solid ${canSend || value.length > 0 ? "rgba(255,90,31,0.5)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: 16,
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: value.length > 0 ? "0 0 0 4px rgba(255,90,31,0.06)" : "none",
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "#FAFAFA",
            fontFamily: "inherit",
            fontSize: 15,
            lineHeight: 1.5,
            padding: "14px 16px 4px",
            minHeight: 52,
            maxHeight: 200,
            display: "block",
          }}
        />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 8px 8px 14px",
        }}>
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "#5A5B62",
          }}>
            <kbd style={{
              fontFamily: "ui-monospace, monospace", fontSize: 10,
              padding: "2px 5px",
              background: "#1C1D21",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 3, color: "#8A8B92",
              margin: "0 2px",
            }}>Enter</kbd>
            to send ·
            <kbd style={{
              fontFamily: "ui-monospace, monospace", fontSize: 10,
              padding: "2px 5px",
              background: "#1C1D21",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 3, color: "#8A8B92",
              margin: "0 2px",
            }}>Shift</kbd>
            +
            <kbd style={{
              fontFamily: "ui-monospace, monospace", fontSize: 10,
              padding: "2px 5px",
              background: "#1C1D21",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 3, color: "#8A8B92",
              margin: "0 2px",
            }}>Enter</kbd>
            new line
          </div>
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              background: canSend ? "#FF5A1F" : "#2A2B30",
              color: canSend ? "#0A0604" : "#5A5B62",
              border: "none",
              width: 34, height: 34,
              borderRadius: 8,
              cursor: canSend ? "pointer" : "not-allowed",
              display: "grid", placeItems: "center",
              fontSize: 16, fontWeight: 700,
              transition: "background 0.15s ease, transform 0.1s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = "#FF7A3D"; }}
            onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = "#FF5A1F"; }}
            onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = "scale(0.93)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
