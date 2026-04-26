export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string | Date;
};

export type Exercise = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  muscleGroup: string;
  equipment: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type WorkoutTemplateExercise = {
  id?: string;
  exerciseId: string;
  sortOrder: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restSeconds?: number | null;
  notes?: string | null;
  exercise?: Exercise;
};

export type WorkoutTemplate = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  exercises: WorkoutTemplateExercise[];
};

export type WorkoutSessionExercise = {
  id?: string;
  exerciseId: string;
  sortOrder: number;
  plannedSets: number;
  plannedReps: number;
  plannedWeight: number;
  actualSets?: number | null;
  actualReps?: number | null;
  actualWeight?: number | null;
  notes?: string | null;
  exercise?: Exercise;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  templateId: string | null;
  name: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string | Date;
  startedAt: string | Date | null;
  completedAt: string | Date | null;
  comments: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  template?: {
    id: string;
    name: string;
  } | null;
  exercises: WorkoutSessionExercise[];
};

export type SummaryReport = {
  completedSessions: number;
  upcomingSessions: number;
  totalVolume: number;
  currentStreak: number;
  recentSessions: WorkoutSession[];
};

export type ProgressEntry = {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  lastPerformedAt: string | Date;
  totalSessions: number;
};
