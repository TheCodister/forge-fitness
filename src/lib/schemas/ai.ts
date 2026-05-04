import { z } from "zod";

export const aiProviderSchema = z.enum(["openai", "anthropic", "google"]);

export const aiSettingsUpsertSchema = z.object({
  provider: aiProviderSchema,
  model: z.string().trim().min(1).max(80),
  apiKey: z.string().trim().min(10).max(300),
});

export const chatMessageCreateSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});
