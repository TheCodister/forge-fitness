import { WorkoutDetailClient } from "./workout-detail-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function WorkoutDetailPage() {
  return <WorkoutDetailClient />;
}
