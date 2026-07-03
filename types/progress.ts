import type { AppSettings } from "./settings";

export type LectureProgress = {
  lectureId: string;
  currentTime: number;
  duration: number;
  percent: number;
  completed: boolean;
  lastPlayedAt: string;
  playCount: number;
  manuallyCompleted?: boolean;
};

export type LectureNote = {
  lectureId: string;
  content: string;
  updatedAt: string;
};

export type CourseProgress = {
  courseId: string;
  courseName: string;
  rootFolderName: string;
  totalLectures: number;
  completedLectures: number;
  lastLectureId: string | null;
  lastOpenedAt: string;
  lectures: Record<string, LectureProgress>;
  notes: Record<string, LectureNote>;
};

export type AppStorage = {
  version: 1;
  courses: Record<string, CourseProgress>;
  settings: AppSettings;
  lastCourseId: string | null;
};
