import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { getDecryptedAiSettings } from "@/lib/server/ai-settings";
import { appendMessages, getConversation, updateConversationTitle } from "@/lib/server/chat";
import { runTrainerAgent } from "@/lib/server/ai-agent";
import { chatMessageCreateSchema } from "@/lib/schemas/ai";


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
    const seenRunIds = new Set<string>();

    const readable = new ReadableStream({
      async start(controller) {
        const emit = (data: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          for await (const event of agentStream) {
            const { event: eventType, name, run_id } = event as {
              event: string;
              name: string;
              run_id: string;
              data: Record<string, unknown>;
            };
            const data = (event as { data: Record<string, unknown> }).data;

            if (eventType === "on_chat_model_stream") {
              const chunk = data?.chunk as { content?: string } | undefined;
              if (typeof chunk?.content === "string" && chunk.content) {
                fullResponse += chunk.content;
                emit({ type: "token", token: chunk.content });
              }
            }

            if (eventType === "on_tool_start" && !seenRunIds.has(run_id)) {
              seenRunIds.add(run_id);
              emit({ type: "tool_call", name, id: run_id });
            }

            if (eventType === "on_tool_end") {
              emit({ type: "tool_result", name, id: run_id });
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
