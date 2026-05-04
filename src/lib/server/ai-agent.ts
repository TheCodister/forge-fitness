import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createLLM } from "./ai-llm";
import { buildTrainerTools } from "./ai-tools";

interface AgentSettings {
  provider: string;
  model: string;
  apiKey: string;
}

interface StoredMessage {
  role: string;
  content: string;
}

interface AgentRunInput {
  userId: string;
  settings: AgentSettings;
  history: StoredMessage[];
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
    ...history.map((m) => {
      if (m.role === "user") return new HumanMessage(m.content);
      return new AIMessage(m.content);
    }),
    new HumanMessage(userMessage),
  ];

  return agent.streamEvents({ messages: langchainMessages }, { version: "v2" });
}
