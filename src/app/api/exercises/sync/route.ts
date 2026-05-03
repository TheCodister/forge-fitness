import { ExerciseCategory, MuscleGroup } from "@/generated/prisma/client";
import { fetchExerciseDbAll } from "@/lib/exercisedb";
import { prisma } from "@/lib/db/prisma";
import { getExerciseImageUrl } from "@/lib/exercise-images";
import { handleRouteError, jsonOk } from "@/lib/http";
import type { ExerciseDbExercise } from "@/lib/exercisedb";

function toMuscleGroup(bodyPart: string): MuscleGroup {
  const map: Record<string, MuscleGroup> = {
    back: MuscleGroup.back,
    chest: MuscleGroup.chest,
    "lower arms": MuscleGroup.arms,
    "lower legs": MuscleGroup.legs,
    neck: MuscleGroup.full_body,
    shoulders: MuscleGroup.shoulders,
    "upper arms": MuscleGroup.arms,
    "upper legs": MuscleGroup.legs,
    waist: MuscleGroup.core,
    cardio: MuscleGroup.full_body,
  };
  return map[bodyPart] ?? MuscleGroup.full_body;
}

function toCategory(edbCategory: ExerciseDbExercise["category"]): ExerciseCategory {
  const map: Record<ExerciseDbExercise["category"], ExerciseCategory> = {
    strength: ExerciseCategory.strength,
    cardio: ExerciseCategory.cardio,
    mobility: ExerciseCategory.mobility,
    balance: ExerciseCategory.conditioning,
    stretching: ExerciseCategory.flexibility,
    plyometrics: ExerciseCategory.conditioning,
    rehabilitation: ExerciseCategory.flexibility,
  };
  return map[edbCategory] ?? ExerciseCategory.strength;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toProxyGifUrl(exerciseDbId: string): string {
  return getExerciseImageUrl(exerciseDbId);
}

const SYNC_CONCURRENCY = 8;

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
    const exercises = await fetchExerciseDbAll();
    let upserted = 0;

    await runWithConcurrency(exercises, SYNC_CONCURRENCY, async (ex) => {
      const slug = `edb-${ex.id}`;
      const description = ex.description || ex.instructions[0] || ex.name;

      await prisma.exercise.upsert({
        where: { exerciseDbId: ex.id },
        create: {
          slug,
          name: capitalize(ex.name),
          description,
          category: toCategory(ex.category),
          muscleGroup: toMuscleGroup(ex.bodyPart),
          equipment: ex.equipment,
          exerciseDbId: ex.id,
          gifUrl: toProxyGifUrl(ex.id),
          instructions: ex.instructions,
          targetMuscle: ex.target,
          secondaryMuscles: ex.secondaryMuscles,
          isActive: true,
        },
        update: {
          name: capitalize(ex.name),
          description,
          category: toCategory(ex.category),
          gifUrl: toProxyGifUrl(ex.id),
          instructions: ex.instructions,
          targetMuscle: ex.target,
          secondaryMuscles: ex.secondaryMuscles,
          equipment: ex.equipment,
        },
      });

      upserted++;
    });

    return jsonOk({ upserted, total: exercises.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
