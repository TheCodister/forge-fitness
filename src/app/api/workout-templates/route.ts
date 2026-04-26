import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { createWorkoutTemplate, listWorkoutTemplates } from "@/lib/server/workouts";

export async function GET() {
  try {
    const user = await requireUser();
    const templates = await listWorkoutTemplates(user.id);
    return jsonOk(templates);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const template = await createWorkoutTemplate(user.id, body);
    return jsonOk(template, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
