export function getExerciseImageUrl(exerciseId: string): string {
  return `${process.env.EXERCISE_IMAGE_BASE_URL}/${exerciseId}.jpg`;
}
