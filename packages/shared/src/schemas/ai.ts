import { z } from "zod";

import { aiProviderSchema } from "./enums.js";

export { aiProviderSchema };

export const aiSettingsUpsertSchema = z.object({
  provider: aiProviderSchema,
  model: z.string().trim().min(1).max(80),
  apiKey: z.string().trim().min(10).max(300),
});

export const chatMessageCreateSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export type AiSettingsUpsertInput = z.infer<typeof aiSettingsUpsertSchema>;
export type ChatMessageCreateInput = z.infer<typeof chatMessageCreateSchema>;
