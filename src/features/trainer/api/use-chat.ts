"use client";

import { useCallback, useState } from "react";

export type TextMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ToolCallMessage = {
  role: "tool_call";
  toolCallId: string;
  toolName: string;
  status: "pending" | "done";
};

export type DisplayMessage = TextMessage | ToolCallMessage;

type SseEvent =
  | { type: "token"; token: string }
  | { type: "tool_call"; name: string; id: string }
  | { type: "tool_result"; name: string; id: string }
  | { type: "done" }
  | { type: "error"; error: string };

export function useChat(conversationId: string, initialMessages: DisplayMessage[] = []) {
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
      setError(null);
      setIsStreaming(true);

      // Optimistically add user + empty assistant placeholder
      setMessages((prev) => [
        ...prev,
        { role: "user", content },
        { role: "assistant", content: "" },
      ]);

      try {
        const response = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message?: string };
          throw new Error(errorData.message ?? "Failed to send message");
        }

        if (!response.body) throw new Error("No response stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6);

            let event: SseEvent;
            try {
              event = JSON.parse(raw) as SseEvent;
            } catch {
              continue;
            }

            if (event.type === "error") throw new Error(event.error);

            if (event.type === "token") {
              // Append to the last assistant message
              setMessages((prev) => {
                const next = [...prev];
                for (let i = next.length - 1; i >= 0; i--) {
                  const m = next[i];
                  if (m.role === "assistant") {
                    next[i] = { role: "assistant", content: (m as TextMessage).content + event.token };
                    break;
                  }
                }
                return next;
              });
            }

            if (event.type === "tool_call") {
              // Insert tool card before the trailing assistant placeholder
              setMessages((prev) => {
                const next = [...prev];
                const assistantIdx = next.findLastIndex((m) => m.role === "assistant");
                const toolCard: ToolCallMessage = {
                  role: "tool_call",
                  toolCallId: event.id,
                  toolName: event.name,
                  status: "pending",
                };
                next.splice(assistantIdx, 0, toolCard);
                return next;
              });
            }

            if (event.type === "tool_result") {
              // Mark matching pending tool card as done (match by run_id)
              setMessages((prev) =>
                prev.map((m) =>
                  m.role === "tool_call" && (m as ToolCallMessage).toolCallId === event.id
                    ? ({ ...m, status: "done" } as ToolCallMessage)
                    : m,
                ),
              );
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        // Remove the optimistic assistant placeholder
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && (last as TextMessage).content === "") {
            next.pop();
          }
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming],
  );

  return { messages, setMessages, isStreaming, error, sendMessage };
}
