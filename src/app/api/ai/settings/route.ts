import { handleRouteError, jsonOk, parseJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { getAiSettings, upsertAiSettings } from "@/lib/server/ai-settings";

export async function GET() {
  try {
    const user = await requireUser();
    const settings = await getAiSettings(user.id);
    return jsonOk(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await parseJsonBody(request);
    const settings = await upsertAiSettings(user.id, body);
    return jsonOk(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}
