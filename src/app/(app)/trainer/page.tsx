import Link from "next/link";
import { Settings } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getAiSettings } from "@/lib/server/ai-settings";
import { ConversationList } from "@/features/trainer/components/conversation-list";

export default async function TrainerPage() {
  const user = await requireUser();
  const settings = await getAiSettings(user.id);

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        height: "calc(100vh - 110px)",
        margin: "-28px -32px",
        overflow: "hidden",
      }}
    >
      {/* Conversation sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col"
        style={{
          width: 248,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          background: "#080809",
          overflow: "hidden",
        }}
      >
        <div style={{
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#FF5A1F",
              margin: 0, marginBottom: 2,
            }}>AI Trainer</p>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-heading, inherit)",
              fontWeight: 800, fontSize: 15,
              letterSpacing: "0.01em", textTransform: "uppercase",
              color: "#FAFAFA",
            }}>Sessions</h2>
          </div>
          <Link
            href="/trainer/settings"
            title="AI Settings"
            className="trainer-icon-btn"
          >
            <Settings style={{ width: 14, height: 14 }} />
          </Link>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "12px 12px", display: "flex", flexDirection: "column" }}>
          <ConversationList />
        </div>
      </aside>

      {/* Welcome / empty state */}
      <div
        style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 48px",
          textAlign: "center",
        }}
      >
        {!settings && (
          <div style={{
            marginBottom: 32,
            padding: "12px 18px",
            borderRadius: 10,
            border: "1px solid rgba(255,90,31,0.25)",
            background: "rgba(255,90,31,0.06)",
            fontSize: 13,
            color: "#FF5A1F",
            maxWidth: 420,
            textAlign: "left",
          }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>AI not configured</p>
            <p style={{ margin: 0, color: "#B8B9C0" }}>
              Add your API key to start chatting.{" "}
              <Link href="/trainer/settings" className="trainer-inline-link">
                Go to settings →
              </Link>
            </p>
          </div>
        )}

        {/* Coach mark */}
        <div style={{
          width: 56, height: 56,
          borderRadius: 14,
          background: "#FF5A1F",
          color: "#0A0604",
          display: "grid", placeItems: "center",
          fontWeight: 900, fontSize: 20,
          letterSpacing: "-0.03em",
          marginBottom: 24,
          position: "relative",
        }}>
          FA
          <span style={{
            position: "absolute",
            bottom: -3, right: -3,
            width: 12, height: 12,
            background: "#2dd07f",
            borderRadius: "50%",
            border: "2px solid #0A0A0C",
            boxShadow: "0 0 6px #2dd07f",
          }} />
        </div>

        <h1 style={{
          margin: "0 0 12px",
          fontFamily: "var(--font-heading, inherit)",
          fontWeight: 900, fontSize: "clamp(28px, 4vw, 48px)",
          lineHeight: 0.95, letterSpacing: "-0.03em",
          textTransform: "uppercase", color: "#FAFAFA",
        }}>
          Forge AI Coach
        </h1>
        <p style={{
          margin: "0 0 32px",
          fontSize: 15, lineHeight: 1.6,
          color: "#8A8B92",
          maxWidth: "40ch",
        }}>
          Your AI-powered training partner — ask about form, programming, recovery, or start a new session.
        </p>

        <Link href="/trainer/new" className="trainer-cta-btn">
          Start new session →
        </Link>

        <div className="lg:hidden mt-8 w-full max-w-sm">
          <ConversationList />
        </div>
      </div>
    </div>
  );
}
