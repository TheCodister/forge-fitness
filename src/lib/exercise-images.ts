export function getExerciseImageUrl(exerciseId: string): string {
  const baseUrl = process.env.EXERCISE_IMAGE_BASE_URL ?? process.env.NEXT_PUBLIC_EXERCISE_IMAGE_BASE_URL ?? "";
  return `${baseUrl.replace(/\/$/, "")}/${exerciseId}.jpg`;
}
