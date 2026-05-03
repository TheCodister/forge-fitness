import { prisma } from "@/lib/db/prisma";
import { getExerciseImageUrl } from "@/lib/exercise-images";
import { handleRouteError, jsonOk } from "@/lib/http";

const MIGRATE_CONCURRENCY = 12;

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  );
}

export async function POST() {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { exerciseDbId: { not: null } },
      select: { id: true, exerciseDbId: true },
    });

    let updated = 0;

    await runWithConcurrency(exercises, MIGRATE_CONCURRENCY, async (ex) => {
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { gifUrl: getExerciseImageUrl(ex.exerciseDbId!) },
      });
      updated++;
    });

    return jsonOk({ updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
