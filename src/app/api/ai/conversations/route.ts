import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { createConversation, listConversations } from "@/lib/server/chat";
import { assertRateLimit, getClientIp } from "@/lib/server/rate-limit";

export async function GET() {
  try {
    const user = await requireUser();
    const conversations = await listConversations(user.id);
    return jsonOk(conversations);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const clientIp = getClientIp(request);
    assertRateLimit(`ai:conversations:create:${user.id}:${clientIp}`, {
      maxRequests: 20,
      windowMs: 10 * 60 * 1000,
      message: "Too many new conversations. Please try again shortly.",
    });

    const conversation = await createConversation(user.id);
    return jsonOk(conversation, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
