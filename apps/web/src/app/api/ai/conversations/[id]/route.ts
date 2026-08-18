import { handleRouteError, jsonOk, noContent } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { deleteConversation, getConversation } from "@/lib/server/chat";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const conversation = await getConversation(user.id, id);
    return jsonOk(conversation);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteConversation(user.id, id);
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
