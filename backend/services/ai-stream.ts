import type { FastifyReply, FastifyRequest } from "fastify";

import { generateConversationTitle } from "../domain/ai-title";
import { appendMessages, updateConversationTitle } from "../domain/chat";

type AgentEvent = {
  event: string;
  name: string;
  run_id: string;
  data: Record<string, unknown>;
};

function startEventStream(request: FastifyRequest, reply: FastifyReply, allowedOrigins: string[]) {
  reply.hijack();
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": request.headers.origin ?? allowedOrigins[0],
    "Access-Control-Allow-Credentials": "true",
  });
  return (data: Record<string, unknown>) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };
}

export async function streamAgentResponse({
  request,
  reply,
  allowedOrigins,
  conversationId,
  content,
  conversationTitle,
  stream,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  allowedOrigins: string[];
  conversationId: string;
  content: string;
  conversationTitle: string | null;
  stream: AsyncIterable<unknown>;
}) {
  const emit = startEventStream(request, reply, allowedOrigins);
  const seenRunIds = new Set<string>();
  let fullResponse = "";

  try {
    for await (const event of stream) {
      const item = event as AgentEvent;
      if (item.event === "on_chat_model_stream") {
        const chunk = item.data?.chunk as { content?: string } | undefined;
        if (typeof chunk?.content === "string" && chunk.content) {
          fullResponse += chunk.content;
          emit({ type: "token", token: chunk.content });
        }
      }
      if (item.event === "on_tool_start" && !seenRunIds.has(item.run_id)) {
        seenRunIds.add(item.run_id);
        emit({ type: "tool_call", name: item.name, id: item.run_id });
      }
      if (item.event === "on_tool_end") {
        emit({ type: "tool_result", name: item.name, id: item.run_id });
      }
    }

    await appendMessages(conversationId, [{ role: "assistant", content: fullResponse }]);
    if (!conversationTitle && content) {
      await updateConversationTitle(conversationId, await generateConversationTitle(content));
    }
    emit({ type: "done" });
  } catch (error) {
    emit({ type: "error", error: error instanceof Error ? error.message : "Stream error" });
  } finally {
    reply.raw.end();
  }
}
