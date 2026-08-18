import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { aiSettingsUpsertSchema } from "@forge/shared";
import { z } from "zod";

import { decryptApiKey, encryptApiKey, maskApiKey } from "../lib/ai-crypto.js";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { listExercises } from "./exercises.js";
import { createWorkoutSession, createWorkoutTemplate } from "./workouts.js";

// ---------- AI settings ----------

export async function getAiSettings(userId: string) {
  const settings = await prisma.aiSettings.findUnique({ where: { userId } });
  if (!settings) return null;
  return {
    provider: settings.provider,
    model: settings.model,
    maskedApiKey: maskApiKey(decryptApiKey(settings.encryptedApiKey)),
  };
}

export async function getDecryptedAiSettings(userId: string) {
  const settings = await prisma.aiSettings.findUnique({ where: { userId } });
  if (!settings) {
    throw new ApiError(
      400,
      "AI_NOT_CONFIGURED",
      "AI settings are not configured. Go to AI Trainer settings to add your API key.",
    );
  }
  return {
    provider: settings.provider as string,
    model: settings.model,
    apiKey: decryptApiKey(settings.encryptedApiKey),
  };
}

export async function upsertAiSettings(userId: string, input: unknown) {
  const parsed = aiSettingsUpsertSchema.parse(input);
  const encryptedApiKey = encryptApiKey(parsed.apiKey);
  await prisma.aiSettings.upsert({
    where: { userId },
    create: { userId, provider: parsed.provider, model: parsed.model, encryptedApiKey },
    update: { provider: parsed.provider, model: parsed.model, encryptedApiKey },
  });
  return {
    provider: parsed.provider,
    model: parsed.model,
    maskedApiKey: maskApiKey(parsed.apiKey),
  };
}

// ---------- Chat CRUD ----------

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
    include: { messages: { orderBy: { createdAt: "asc" } } },
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

// ---------- LLM factory ----------

interface LlmSettings {
  provider: string;
  model: string;
  apiKey: string;
}

function createLLM(settings: LlmSettings) {
  switch (settings.provider) {
    case "openai":
      return new ChatOpenAI({ model: settings.model, apiKey: settings.apiKey, streaming: true });
    case "anthropic":
      return new ChatAnthropic({ model: settings.model, apiKey: settings.apiKey, streaming: true });
    case "google":
      return new ChatGoogleGenerativeAI({
        model: settings.model,
        apiKey: settings.apiKey,
        streaming: true,
      });
    default:
      throw new ApiError(
        400,
        "UNSUPPORTED_PROVIDER",
        `Unknown AI provider: ${settings.provider}`,
      );
  }
}

// ---------- Trainer tools ----------

function buildTrainerTools(userId: string) {
  const searchExercises = tool(
    async (input) => {
      const results = await listExercises(input);
      return JSON.stringify(
        (results as Array<Record<string, unknown>>).map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup,
          category: e.category,
          equipment: e.equipment,
          description: e.description,
        })),
      );
    },
    {
      name: "search_exercises",
      description:
        "Search the exercise database by name keyword, muscle group, or category. Returns matching exercises with their IDs. Use this to find exercises before creating a workout template.",
      schema: z.object({
        search: z.string().optional().describe("Exercise name or keyword to search for"),
        muscleGroup: z
          .enum(["chest", "back", "legs", "shoulders", "arms", "core", "full_body"])
          .optional()
          .describe("Filter by muscle group"),
        category: z
          .enum(["cardio", "strength", "flexibility", "mobility", "conditioning"])
          .optional()
          .describe("Filter by exercise category"),
        limit: z.string().optional().describe("Max results, default 10"),
      }),
    },
  );

  const createTemplate = tool(
    async (input) => {
      const template = await createWorkoutTemplate(userId, input);
      return JSON.stringify({
        id: template.id,
        name: template.name,
        exerciseCount: template.exercises.length,
        message: `Workout template "${template.name}" created successfully with ${template.exercises.length} exercise(s).`,
      });
    },
    {
      name: "create_workout_template",
      description:
        "Create a workout template for the user with a list of exercises. Each exercise needs an ID from search_exercises, sets, reps, and weight targets. Call search_exercises first to get valid exercise IDs.",
      schema: z.object({
        name: z.string().min(2).max(80).describe("Name of the workout template"),
        description: z.string().max(400).optional().describe("Optional description"),
        exercises: z
          .array(
            z.object({
              exerciseId: z.string().describe("Exercise ID from search_exercises"),
              sortOrder: z.number().int().min(0).describe("Order in the workout (0-based)"),
              targetSets: z.number().int().min(1).describe("Number of sets"),
              targetReps: z.number().int().min(1).describe("Number of reps per set"),
              targetWeight: z.number().min(0).describe("Target weight in kg (0 for bodyweight)"),
              restSeconds: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Rest between sets in seconds"),
              notes: z.string().max(300).optional().describe("Notes for this exercise"),
            }),
          )
          .min(1),
      }),
    },
  );

  const scheduleWorkout = tool(
    async (input) => {
      const session = await createWorkoutSession(userId, {
        templateId: input.templateId,
        name: input.name,
        scheduledAt: input.scheduledAt,
        comments: input.comments,
      });
      return JSON.stringify({
        id: session.id,
        name: session.name,
        scheduledAt: session.scheduledAt,
        message: `Workout "${session.name}" scheduled for ${new Date(session.scheduledAt).toLocaleDateString()}.`,
      });
    },
    {
      name: "schedule_workout",
      description:
        "Schedule a workout session from an existing template for a specific date and time.",
      schema: z.object({
        templateId: z.string().describe("ID of the workout template to use"),
        name: z.string().min(2).max(80).describe("Name for this workout session"),
        scheduledAt: z
          .string()
          .describe("ISO 8601 datetime for when to schedule, e.g. 2025-01-15T10:00:00Z"),
        comments: z.string().max(400).optional().describe("Optional notes for the session"),
      }),
    },
  );

  return [searchExercises, createTemplate, scheduleWorkout];
}

// ---------- Trainer agent ----------

interface AgentRunInput {
  userId: string;
  settings: LlmSettings;
  history: Array<{ role: string; content: string }>;
  userMessage: string;
}

const SYSTEM_PROMPT = `You are a professional AI personal trainer for Forge Fitness — a strength and fitness tracking app.

Your role:
- Ask the user about their fitness goals, experience level, available equipment, physical limitations, and schedule
- Based on their answers, recommend exercises and create personalized workout plans
- Use search_exercises to find exercises from the database before creating templates
- Use create_workout_template to build their workout program with specific exercises, sets, reps, and weights
- Use schedule_workout to book sessions once a template is created

Guidelines:
- Be encouraging, knowledgeable, and personalized
- Start by asking a few key questions about the user if you don't know them yet
- Recommend beginner-friendly weights (e.g., bodyweight or light weights) for new users
- Always search for exercises first before creating a template
- When scheduling, ask the user for their preferred dates/times

Today's date: {TODAY}`;

export async function runTrainerAgent({ userId, settings, history, userMessage }: AgentRunInput) {
  const llm = createLLM(settings);
  const tools = buildTrainerTools(userId);
  const agent = createReactAgent({ llm, tools });

  const systemPrompt = SYSTEM_PROMPT.replace("{TODAY}", new Date().toISOString().split("T")[0]);

  const langchainMessages = [
    new SystemMessage(systemPrompt),
    ...history.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    ),
    new HumanMessage(userMessage),
  ];

  return agent.streamEvents({ messages: langchainMessages }, { version: "v2" });
}

// ---------- Title generation ----------

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return firstMessage.slice(0, 60);

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite-preview",
      apiKey,
      maxOutputTokens: 20,
    });

    const response = await llm.invoke([
      new SystemMessage(
        "Generate a short conversation title (max 6 words) from the user message. Return only the title, no quotes, no punctuation at the end.",
      ),
      new HumanMessage(firstMessage),
    ]);

    const title = (response.content as string).trim();
    return title.slice(0, 80) || firstMessage.slice(0, 60);
  } catch {
    return firstMessage.slice(0, 60);
  }
}
