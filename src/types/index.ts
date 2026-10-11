import { ConfidenceLevel, Category, Difficulty, ProblemStatus } from "@prisma/client";

export type { ConfidenceLevel, Category, Difficulty, ProblemStatus };

export interface DashboardMetrics {
  totalHours: number;
  totalSessions: number;
  totalProblemsSolved: number;
  currentStreak: number;
  totalScorePoints: number;
  topicsCovered: number;
  weeklyHours: number;
  monthlyHours: number;
}

export interface LearningSessionFormData {
  title: string;
  topic: string;
  category: Category;
  date: string;
  durationMinutes: number;
  conceptsCovered: string[];
  practiceNotes?: string;
  keyTakeaway?: string;
  confidence: ConfidenceLevel;
  revisionNeeded: boolean;
  nextStep?: string;
}
