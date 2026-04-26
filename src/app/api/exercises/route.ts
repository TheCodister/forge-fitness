import type { NextRequest } from "next/server";

import { handleRouteError, jsonOk } from "@/lib/http";
import { listExercises } from "@/lib/server/exercises";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exercises = await listExercises({
      category: searchParams.get("category") ?? undefined,
      muscleGroup: searchParams.get("muscleGroup") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    return jsonOk(exercises);
  } catch (error) {
    return handleRouteError(error);
  }
}
