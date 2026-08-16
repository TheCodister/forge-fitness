import type { FastifyPluginAsync } from "fastify";

import { requireUser } from "../auth";
import { clientIp } from "../config";
import { streamAgentResponse } from "../services/ai-stream";
import type { IdParams } from "../types";
import { runTrainerAgent } from "../domain/ai-agent";
import { getDecryptedAiSettings, getAiSettings, upsertAiSettings } from "../domain/ai-settings";
import {
  appendMessages,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
} from "../domain/chat";
import { chatMessageCreateSchema } from "../schemas/ai";
import { assertRateLimit } from "../security/rate-limit";

type AiRoutesOptions = {
  allowedOrigins: string[];
};

export const aiRoutes: FastifyPluginAsync<AiRoutesOptions> = async (app, options) => {
  app.get("/api/ai/settings", async (request) => {
    const user = await requireUser(request);
    return getAiSettings(user.id);
  });

  app.put("/api/ai/settings", async (request) => {
    const user = await requireUser(request);
    return upsertAiSettings(user.id, request.body);
  });

  app.get("/api/ai/conversations", async (request) => {
    const user = await requireUser(request);
    return listConversations(user.id);
  });

  app.post("/api/ai/conversations", async (request, reply) => {
    const user = await requireUser(request);
    assertRateLimit(`ai:conversations:create:${user.id}:${clientIp(request)}`, {
      maxRequests: 20,
      windowMs: 10 * 60_000,
      message: "Too many new conversations. Please try again shortly.",
    });
    return reply.status(201).send(await createConversation(user.id));
  });

  app.get<{ Params: IdParams }>("/api/ai/conversations/:id", async (request) => {
    const user = await requireUser(request);
    return getConversation(user.id, request.params.id);
  });

  app.delete<{ Params: IdParams }>("/api/ai/conversations/:id", async (request, reply) => {
    const user = await requireUser(request);
    await deleteConversation(user.id, request.params.id);
    return reply.status(204).send();
  });

  app.post<{ Params: IdParams }>("/api/ai/conversations/:id/messages", async (request, reply) => {
    const user = await requireUser(request);
    assertRateLimit(`ai:messages:${user.id}:${clientIp(request)}`, {
      maxRequests: 30,
      windowMs: 10 * 60_000,
      message: "Too many AI requests. Please try again shortly.",
    });

    const { content } = chatMessageCreateSchema.parse(request.body);
    const conversation = await getConversation(user.id, request.params.id);
    const settings = await getDecryptedAiSettings(user.id);
    await appendMessages(conversation.id, [{ role: "user", content }]);
    const stream = await runTrainerAgent({
      userId: user.id,
      settings,
      history: conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      userMessage: content,
    });

    await streamAgentResponse({
      request,
      reply,
      allowedOrigins: options.allowedOrigins,
      conversationId: conversation.id,
      conversationTitle: conversation.title,
      content,
      stream,
    });
  });
};
