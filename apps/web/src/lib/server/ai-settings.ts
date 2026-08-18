import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";
import { aiSettingsUpsertSchema } from "@forge/shared";
import { decryptApiKey, encryptApiKey, maskApiKey } from "./ai-crypto";

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
    throw new ApiError(400, "AI_NOT_CONFIGURED", "AI settings are not configured. Go to AI Trainer settings to add your API key.");
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
