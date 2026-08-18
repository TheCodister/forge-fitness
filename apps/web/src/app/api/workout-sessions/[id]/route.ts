import { handleRouteError, jsonOk, noContent } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import {
  deleteWorkoutSession,
  getWorkoutSession,
  updateWorkoutSession,
} from "@/lib/server/workouts";

export async function GET(_: Request, context: RouteContext<"/api/workout-sessions/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const session = await getWorkoutSession(user.id, id);
    return jsonOk(session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/workout-sessions/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const session = await updateWorkoutSession(user.id, id, body);
    return jsonOk(session);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext<"/api/workout-sessions/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteWorkoutSession(user.id, id);
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
