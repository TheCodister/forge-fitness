import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return firstMessage.slice(0, 60);
  }

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite-preview",
      apiKey,
      maxOutputTokens: 20,
    });

    const response = await llm.invoke([
      new SystemMessage(
        "Generate a short conversation title (max 6 words) from the user message. Return only the title, no quotes, no punctuation at the end."
      ),
      new HumanMessage(firstMessage),
    ]);

    const title = (response.content as string).trim();
    return title.slice(0, 80) || firstMessage.slice(0, 60);
  } catch {
    return firstMessage.slice(0, 60);
  }
}
