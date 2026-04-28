import { PageHeader } from "@/components/shared/page-header";
import { ExerciseGrid } from "@/features/exercises/components/exercise-grid";

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Exercise Library"
        description="Browse exercises, view instructions and animations."
      />
      <ExerciseGrid />
    </div>
  );
}
