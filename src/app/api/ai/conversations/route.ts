import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { createConversation, listConversations } from "@/lib/server/chat";

export async function GET() {
  try {
    const user = await requireUser();
    const conversations = await listConversations(user.id);
    return jsonOk(conversations);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const conversation = await createConversation(user.id);
    return jsonOk(conversation, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
