"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConversations, useDeleteConversation } from "@/features/trainer/api/use-conversations";

const CATEGORY_COLORS: Record<string, string> = {
  Strength: "#FF5A1F",
  Engine: "#FF5A1F",
  Hybrid: "#FF5A1F",
  Mobility: "#FF5A1F",
  default: "#5A5B62",
};

function categoryFromTitle(title: string | null): string {
  if (!title) return "";
  const map: Record<string, string> = {
    deadlift: "Strength", squat: "Strength", bench: "Strength", press: "Strength",
    run: "Engine", cardio: "Engine", endurance: "Engine", zone: "Engine",
    hybrid: "Hybrid", athlete: "Hybrid",
    mobility: "Mobility", stretch: "Mobility", recovery: "Mobility",
  };
  const lower = title.toLowerCase();
  for (const [key, cat] of Object.entries(map)) {
    if (lower.includes(key)) return cat;
  }
  return "";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const day = 86400000;
  if (diff < day) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase();
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({ activeId }: { activeId?: string }) {
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const router = useRouter();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteConversation.mutateAsync(id);
      if (activeId === id) router.push("/trainer");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* New session button */}
      <button
        onClick={() => router.push("/trainer/new")}
        style={{
          margin: "0 0 8px",
          padding: "11px 14px",
          background: "#FF5A1F",
          color: "#0A0604",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "background 0.15s ease",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#FF7A3D")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#FF5A1F")}
      >
        New session
        <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</span>
      </button>

      {/* Section label */}
      {!isLoading && (conversations?.length ?? 0) > 0 && (
        <p style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#3A3B41",
          padding: "10px 4px 4px",
          margin: 0,
        }}>
          Sessions
        </p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-1.5 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 56, borderRadius: 8, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && conversations?.length === 0 && (
        <p style={{
          textAlign: "center", fontSize: 13,
          color: "#5A5B62",
          padding: "24px 8px",
          fontFamily: "ui-monospace, monospace",
          letterSpacing: "0.04em",
        }}>
          No sessions yet.
        </p>
      )}

      {/* Conversation items */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {conversations?.map((conv) => {
          const isActive = activeId === conv.id;
          const cat = categoryFromTitle(conv.title);
          return (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/trainer/${conv.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/trainer/${conv.id}`)}
              className="group"
              style={{
                padding: "10px 10px",
                marginBottom: 2,
                borderRadius: 8,
                cursor: "pointer",
                border: `1px solid ${isActive ? "rgba(255,90,31,0.3)" : "transparent"}`,
                background: isActive ? "rgba(255,90,31,0.08)" : "transparent",
                transition: "background 0.15s, border-color 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#FAFAFA",
                lineHeight: 1.3, marginBottom: 4,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {conv.title ?? "New conversation"}
              </div>
              <div style={{
                display: "flex", gap: 8, alignItems: "center",
                fontFamily: "ui-monospace, monospace",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#5A5B62",
              }}>
                {cat && (
                  <span style={{
                    padding: "2px 6px",
                    background: isActive ? "rgba(255,90,31,0.14)" : "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    color: isActive ? "#FF5A1F" : "#8A8B92",
                  }}>
                    {cat}
                  </span>
                )}
                <span>{formatDate(conv.updatedAt)}</span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(conv.id, e)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  color: "#5A5B62",
                  display: "flex",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5B62")}
                aria-label="Delete conversation"
              >
                <Trash2 style={{ width: 12, height: 12 }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
