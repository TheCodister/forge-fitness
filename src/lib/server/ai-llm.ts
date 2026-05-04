import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ApiError } from "@/lib/http";

interface LlmSettings {
  provider: string;
  model: string;
  apiKey: string;
}

export function createLLM(settings: LlmSettings) {
  switch (settings.provider) {
    case "openai":
      return new ChatOpenAI({
        model: settings.model,
        apiKey: settings.apiKey,
        streaming: true,
      });
    case "anthropic":
      return new ChatAnthropic({
        model: settings.model,
        apiKey: settings.apiKey,
        streaming: true,
      });
    case "google":
      return new ChatGoogleGenerativeAI({
        model: settings.model,
        apiKey: settings.apiKey,
        streaming: true,
      });
    default:
      throw new ApiError(400, "UNSUPPORTED_PROVIDER", `Unknown AI provider: ${settings.provider}`);
  }
}
