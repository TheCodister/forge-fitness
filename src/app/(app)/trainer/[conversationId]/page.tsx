import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/features/trainer/components/chat-window";
import { ConversationList } from "@/features/trainer/components/conversation-list";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;

  return (
    <div className="flex gap-6" style={{ minHeight: "calc(100vh - 140px)" }}>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/trainer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            All chats
          </Link>
        </div>
        <ConversationList activeId={conversationId} />
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Link
            href="/trainer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <ChatWindow conversationId={conversationId} />
      </div>
    </div>
  );
}
