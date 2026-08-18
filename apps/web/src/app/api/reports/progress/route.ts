import type { NextRequest } from "next/server";

import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { getProgressReport } from "@/lib/server/workouts";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const searchParams = request.nextUrl.searchParams;
    const report = await getProgressReport(user.id, {
      exerciseId: searchParams.get("exerciseId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return jsonOk(report);
  } catch (error) {
    return handleRouteError(error);
  }
}
