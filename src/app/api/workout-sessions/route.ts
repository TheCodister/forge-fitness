import type { NextRequest } from "next/server";

import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { createWorkoutSession, listWorkoutSessions } from "@/lib/server/workouts";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const searchParams = request.nextUrl.searchParams;
    const sessions = await listWorkoutSessions(user.id, {
      status: searchParams.get("status") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    return jsonOk(sessions);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const session = await createWorkoutSession(user.id, body);
    return jsonOk(session, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
