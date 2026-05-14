"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useConversation } from "@/features/trainer/api/use-conversations";
import { useChat } from "@/features/trainer/api/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

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
      <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
        Loading conversation...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-zinc-400 text-sm">
              Say hello to your AI personal trainer!
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Ask about goals, fitness level, or just say hi.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
