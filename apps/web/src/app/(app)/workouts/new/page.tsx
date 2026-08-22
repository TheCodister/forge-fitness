import { PageHeader } from "@/components/shared/page-header";
import { WorkoutForm } from "@/features/workouts/components/workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Schedule Workout"
        description="Choose a template or build a one-off session with custom exercise targets."
      />
      <WorkoutForm />
    </div>
  );
}
