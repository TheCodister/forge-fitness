import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConversationList } from "@/features/trainer/components/conversation-list";
import { NewChatWindow } from "@/features/trainer/components/new-chat-window";
import { MobileSidebar } from "@/features/trainer/components/mobile-sidebar";

export default function NewChatPage() {
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
        }}>
          <Link href="/trainer" className="trainer-back-link">
            <ArrowLeft style={{ width: 12, height: 12 }} />
            Sessions
          </Link>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "12px 12px", display: "flex", flexDirection: "column" }}>
          <ConversationList />
        </div>
      </aside>

      <div
        style={{
          flex: 1, minWidth: 0,
          display: "flex", flexDirection: "column",
          padding: "20px 28px",
          overflow: "hidden",
        }}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Link href="/trainer" className="trainer-back-link">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back
          </Link>
          <MobileSidebar />
        </div>
        <NewChatWindow />
      </div>
    </div>
  );
}
