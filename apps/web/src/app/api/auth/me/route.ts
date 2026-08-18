import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { jsonOk } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonOk({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, createdAt: true },
  });

  return jsonOk({ user }, { headers: { "Cache-Control": "no-store" } });
}
