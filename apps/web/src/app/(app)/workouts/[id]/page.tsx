import { WorkoutDetailClient } from "./workout-detail-client";

// generateStaticParams returns a sentinel so `next build --output=export`
// prerenders one shell (/workouts/_/index.html). Amplify's SPA rewrite
// serves that shell for any /workouts/<id>/; the client component reads
// the real id via useParams and calls the API.
//
// dynamicParams is intentionally NOT exported. In dev the default (true)
// lets Next serve arbitrary IDs; in export mode Next forces it to false
// so only the sentinel is emitted.
export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function WorkoutDetailPage() {
  return <WorkoutDetailClient />;
}
