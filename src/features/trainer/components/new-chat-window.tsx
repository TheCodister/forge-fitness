"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/fetcher";
import { ChatInput } from "./chat-input";
import type { Conversation } from "@/features/trainer/api/use-conversations";

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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 pb-4">
        <p className="text-zinc-400 text-sm">Say hello to your AI personal trainer!</p>
        <p className="text-zinc-600 text-xs">Ask about goals, fitness level, or just say hi.</p>
      </div>
      <ChatInput onSend={handleSend} disabled={isCreating} />
    </div>
  );
}
