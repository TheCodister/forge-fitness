import { handleRouteError, jsonOk, noContent } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import {
  deleteWorkoutTemplate,
  getWorkoutTemplate,
  updateWorkoutTemplate,
} from "@/lib/server/workouts";

export async function GET(_: Request, context: RouteContext<"/api/workout-templates/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const template = await getWorkoutTemplate(user.id, id);
    return jsonOk(template);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/workout-templates/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const template = await updateWorkoutTemplate(user.id, id, body);
    return jsonOk(template);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext<"/api/workout-templates/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteWorkoutTemplate(user.id, id);
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
