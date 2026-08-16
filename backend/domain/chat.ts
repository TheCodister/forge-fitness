import { prisma } from "../database/prisma";
import { ApiError } from "../lib/api-error";

export async function listConversations(userId: string) {
  return prisma.chatConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
}

export async function createConversation(userId: string) {
  return prisma.chatConversation.create({
    data: { userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
}

export async function getConversation(userId: string, conversationId: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) {
    throw new ApiError(404, "CONVERSATION_NOT_FOUND", "Conversation not found.");
  }
  return conversation;
}

export async function appendMessages(
  conversationId: string,
  messages: Array<{ role: string; content: string }>,
) {
  await prisma.$transaction([
    prisma.chatMessage.createMany({
      data: messages.map((m) => ({ conversationId, role: m.role, content: m.content })),
    }),
    prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

export async function updateConversationTitle(conversationId: string, title: string) {
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { title },
  });
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conversation) {
    throw new ApiError(404, "CONVERSATION_NOT_FOUND", "Conversation not found.");
  }
  await prisma.chatConversation.delete({ where: { id: conversationId } });
}
