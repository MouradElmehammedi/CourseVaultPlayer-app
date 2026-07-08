import type { CoursePlanConfidence } from "@/lib/course-plan";

export type CoursePlanApiLecture = {
  title: string;
  section: string;
  remainingMinutes: number;
  progressPercent: number;
};

export type CoursePlanApiRequest = {
  courseName: string;
  targetDays: number;
  playbackRate: number;
  totalLectures: number;
  completedLectures: number;
  remainingLectures: number;
  completionPercent: number;
  estimatedRemainingMinutes: number;
  dailyRuntimeMinutes: number;
  dailyRealMinutes: number;
  watchedTodayMinutes: number;
  remainingTodayMinutes: number;
  confidence: CoursePlanConfidence;
  missingDurationCount: number;
  upcomingLectures: CoursePlanApiLecture[];
};

export type CoursePlanAiAdvice = {
  headline: string;
  dailyPlan: string[];
  pacing: string[];
  risks: string[];
  nextActions: string[];
};

export type CoursePlanApiResponse = {
  source: "groq" | "local";
  advice: CoursePlanAiAdvice;
  model?: string;
  warning?: string;
};
