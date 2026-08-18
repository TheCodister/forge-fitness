import { handleRouteError, jsonOk } from "@/lib/http";
import { getExerciseById } from "@/lib/server/exercises";

export async function GET(
  _: Request,
  context: RouteContext<"/api/exercises/[id]">,
) {
  try {
    const { id } = await context.params;
    const exercise = await getExerciseById(id);
    return jsonOk(exercise);
  } catch (error) {
    return handleRouteError(error);
  }
}
