import { aiSettingsUpsertSchema, chatMessageCreateSchema } from "@forge/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { assertRateLimit, getClientIp } from "../lib/rate-limit.js";
import {
  appendMessages,
  createConversation,
  deleteConversation,
  generateConversationTitle,
  getAiSettings,
  getConversation,
  getDecryptedAiSettings,
  listConversations,
  runTrainerAgent,
  updateConversationTitle,
  upsertAiSettings,
} from "../services/ai.js";

const idParamsSchema = z.object({ id: z.string().min(1) });

export async function aiSettingsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => getAiSettings(request.userId));

  app.put(
    "/",
    { schema: { body: aiSettingsUpsertSchema } },
    async (request) => upsertAiSettings(request.userId, request.body),
  );
}

export async function aiConversationRoutes(app: FastifyInstance) {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => listConversations(request.userId));

  app.post("/", async (request, reply) => {
    assertRateLimit(`ai:conversations:create:${request.userId}:${getClientIp(request)}`, {
      maxRequests: 20,
      windowMs: 10 * 60 * 1000,
      message: "Too many new conversations. Please try again shortly.",
    });
    const conversation = await createConversation(request.userId);
    return reply.status(201).send(conversation);
  });

  app.get(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request) => getConversation(request.userId, request.params.id),
  );

  app.delete(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      await deleteConversation(request.userId, request.params.id);
      return reply.status(204).send();
    },
  );

  app.post(
    "/:id/messages",
    { schema: { params: idParamsSchema, body: chatMessageCreateSchema } },
    async (request, reply) => {
      const userId = request.userId;
      const conversationId = request.params.id;
      const { content } = request.body;

      assertRateLimit(`ai:messages:${userId}:${getClientIp(request)}`, {
        maxRequests: 30,
        windowMs: 10 * 60 * 1000,
        message: "Too many AI requests. Please try again shortly.",
      });

      const settings = await getDecryptedAiSettings(userId);
      const conversation = await getConversation(userId, conversationId);

      await appendMessages(conversationId, [{ role: "user", content }]);

      const history = conversation.messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));
      const agentStream = await runTrainerAgent({
        userId,
        settings,
        history,
        userMessage: content,
      });

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      });

      const emit = (data: Record<string, unknown>) => {
        if (reply.raw.writableEnded) return;
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      let clientAborted = false;
      const onClose = () => {
        clientAborted = true;
      };
      request.raw.once("close", onClose);

      let fullResponse = "";
      const seenRunIds = new Set<string>();

      try {
        for await (const event of agentStream) {
          if (clientAborted) break;
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

        if (fullResponse) {
          await appendMessages(conversationId, [{ role: "assistant", content: fullResponse }]);
        }

        if (clientAborted) return reply;

        emit({ type: "done" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Stream error";
        emit({ type: "error", error: message });
      } finally {
        request.raw.off("close", onClose);
        if (!reply.raw.writableEnded) reply.raw.end();
      }

      // Title generation runs after the client sees `done`. Failures here must
      // not swallow the terminal event or corrupt the conversation list.
      if (!clientAborted && !conversation.title && content) {
        generateConversationTitle(content)
          .then((title) => updateConversationTitle(conversationId, title))
          .catch((err) => {
            request.log.warn({ err, conversationId }, "failed to generate title");
          });
      }

      return reply;
    },
  );
}
