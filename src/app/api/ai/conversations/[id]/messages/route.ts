import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { getDecryptedAiSettings } from "@/lib/server/ai-settings";
import { appendMessages, getConversation, updateConversationTitle } from "@/lib/server/chat";
import { runTrainerAgent } from "@/lib/server/ai-agent";
import { chatMessageCreateSchema } from "@/lib/schemas/ai";

type ToolCallChunk = { name?: string; id?: string; index?: number; args?: string };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: conversationId } = await params;
    const body = await parseJsonBody(request, 8 * 1024);
    const { content } = chatMessageCreateSchema.parse(body);

    const settings = await getDecryptedAiSettings(user.id);
    const conversation = await getConversation(user.id, conversationId);

    await appendMessages(conversationId, [{ role: "user", content }]);

    const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
    const agentStream = await runTrainerAgent({
      userId: user.id,
      settings,
      history,
      userMessage: content,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";
    const seenToolCallIds = new Set<string>();

    const readable = new ReadableStream({
      async start(controller) {
        const emit = (data: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          for await (const item of agentStream) {
            const [chunk, metadata] = item as unknown as [Record<string, unknown>, Record<string, unknown>];
            const node = metadata?.langgraph_node as string | undefined;

            if (node === "agent") {
              // AI text tokens
              if (typeof chunk?.content === "string" && chunk.content) {
                fullResponse += chunk.content;
                emit({ type: "token", token: chunk.content });
              }

              // Tool call intent — emit once per unique tool call ID when name is available
              const toolCallChunks = chunk?.tool_call_chunks as ToolCallChunk[] | undefined;
              if (toolCallChunks?.length) {
                for (const tc of toolCallChunks) {
                  if (tc.name && tc.id && !seenToolCallIds.has(tc.id)) {
                    seenToolCallIds.add(tc.id);
                    emit({ type: "tool_call", name: tc.name, id: tc.id });
                  }
                }
              }
            }

            if (node === "tools") {
              // Tool execution result
              if (typeof chunk?.content === "string" && chunk.content) {
                const toolName = (chunk as Record<string, unknown>).name as string | undefined;
                emit({ type: "tool_result", name: toolName ?? "tool", content: chunk.content });
              }
            }
          }

          await appendMessages(conversationId, [{ role: "assistant", content: fullResponse }]);

          if (!conversation.title && content) {
            await updateConversationTitle(conversationId, content.slice(0, 60));
          }

          emit({ type: "done" });
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Stream error";
          emit({ type: "error", error: message });
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
