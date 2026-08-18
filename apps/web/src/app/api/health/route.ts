import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type CheckStatus = "up" | "down";

async function checkDatabase(): Promise<{ status: CheckStatus; latencyMs: number; error?: string }> {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "up", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return {
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : "Unknown database error.",
    };
  }
}

function checkRequiredEnv(): { status: CheckStatus; missing: string[] } {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  return { status: missing.length === 0 ? "up" : "down", missing };
}

export async function GET() {
  const [database, env] = [await checkDatabase(), checkRequiredEnv()];
  const healthy = database.status === "up" && env.status === "up";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { database, env },
    },
    { status: healthy ? 200 : 503 },
  );
}
