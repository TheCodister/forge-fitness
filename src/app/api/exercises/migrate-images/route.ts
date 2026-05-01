import { prisma } from "@/lib/db/prisma";
import { handleRouteError, jsonOk } from "@/lib/http";

export async function POST() {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { exerciseDbId: { not: null } },
      select: { id: true, exerciseDbId: true },
    });

    let updated = 0;
    for (const ex of exercises) {
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { gifUrl: `/api/exercise-image/${ex.exerciseDbId}` },
      });
      updated++;
    }

    return jsonOk({ updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
