export type ExerciseDbExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "strength" | "cardio" | "mobility" | "balance" | "stretching" | "plyometrics" | "rehabilitation";
};

const BASE_URL = "https://exercisedb.p.rapidapi.com";

function getHeaders() {
  const key = process.env.EXERCISEDB_API_KEY;
  if (!key) throw new Error("EXERCISEDB_API_KEY is not set.");
  return {
    "X-RapidAPI-Key": key,
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
  };
}

export async function fetchExerciseDbAll(): Promise<ExerciseDbExercise[]> {
  const all: ExerciseDbExercise[] = [];
  let offset = 0;
  // Basic plan max = 10 per request
  const limit = 10;

  while (true) {
    const res = await fetch(`${BASE_URL}/exercises?limit=${limit}&offset=${offset}`, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`ExerciseDB responded with ${res.status}: ${await res.text()}`);
    }

    const batch = (await res.json()) as ExerciseDbExercise[];
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return all;
}

export async function fetchExerciseDbById(id: string): Promise<ExerciseDbExercise> {
  const res = await fetch(`${BASE_URL}/exercises/exercise/${id}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ExerciseDB responded with ${res.status}`);
  }

  return res.json() as Promise<ExerciseDbExercise>;
}

export function getExerciseImageUrl(exerciseDbId: string, resolution: 180 | 360 = 180): string {
  const key = process.env.EXERCISEDB_API_KEY;
  return `${BASE_URL}/image?exerciseId=${exerciseDbId}&resolution=${resolution}&rapidapi-key=${key}`;
}
