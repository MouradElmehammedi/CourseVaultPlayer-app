import type { Course } from "@/types/course";
import type { CourseProgress, LectureProgress } from "@/types/progress";

export function getLocalActivityDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDailyWatchedSeconds(
  courseProgress: CourseProgress | undefined,
  dateKey = getLocalActivityDate(),
): number {
  return Math.max(
    0,
    courseProgress?.dailyActivity?.[dateKey]?.watchedSeconds ?? 0,
  );
}

export function getLectureProgress(
  courseProgress: CourseProgress | undefined,
  lectureId: string | null,
): LectureProgress | undefined {
  if (!courseProgress || !lectureId) {
    return undefined;
  }

  return courseProgress.lectures[lectureId];
}

export function getCourseCompletion(course: Course, courseProgress?: CourseProgress) {
  const completedLectures = course.lectures.filter(
    (lecture) => courseProgress?.lectures[lecture.id]?.completed,
  ).length;

  const percent =
    course.totalLectures > 0
      ? Math.round((completedLectures / course.totalLectures) * 100)
      : 0;

  return {
    completedLectures,
    totalLectures: course.totalLectures,
    percent,
  };
}

export function calculatePercent(currentTime: number, duration: number): number {
  if (!duration || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
}
