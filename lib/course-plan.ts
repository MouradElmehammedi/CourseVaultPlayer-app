import type { Course, Lecture } from "@/types/course";
import type { CourseProgress } from "@/types/progress";

export const COURSE_PLAN_DAY_PRESETS = [7, 10, 14, 20, 30, 45, 60] as const;

const DEFAULT_LECTURE_SECONDS = 12 * 60;
const MAX_PLAN_DAYS = 365;
const PREVIEW_DAY_COUNT = 5;

export type CoursePlanConfidence = "high" | "medium" | "low";

export type PlannedLecture = {
  id: string;
  title: string;
  section: string;
  order: number;
  durationKnown: boolean;
  durationSeconds: number;
  progressPercent: number;
  remainingSeconds: number;
};

export type CoursePlanDay = {
  day: number;
  lectureCount: number;
  runtimeSeconds: number;
  realTimeSeconds: number;
  lectures: PlannedLecture[];
};

export type CoursePlan = {
  targetDays: number;
  playbackRate: number;
  totalLectures: number;
  completedLectures: number;
  remainingLectures: number;
  completionPercent: number;
  estimatedTotalSeconds: number;
  estimatedRemainingSeconds: number;
  dailyRuntimeSeconds: number;
  dailyRealTimeSeconds: number;
  dailyLectureGoal: number;
  knownDurationCount: number;
  missingDurationCount: number;
  averageLectureSeconds: number;
  confidence: CoursePlanConfidence;
  remainingLecturesPreview: PlannedLecture[];
  dayPreview: CoursePlanDay[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function safeSeconds(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function getLectureDuration(
  lecture: Lecture,
  courseProgress: CourseProgress | undefined,
): number | null {
  const progressDuration = safeSeconds(courseProgress?.lectures[lecture.id]?.duration);
  const lectureDuration = safeSeconds(lecture.duration);

  return progressDuration ?? lectureDuration;
}

function getPlanConfidence(
  knownDurationCount: number,
  totalLectures: number,
): CoursePlanConfidence {
  if (totalLectures === 0 || knownDurationCount === totalLectures) {
    return "high";
  }

  if (knownDurationCount / totalLectures >= 0.5) {
    return "medium";
  }

  return "low";
}

function buildDayPreview(
  lectures: PlannedLecture[],
  dailyRuntimeSeconds: number,
  playbackRate: number,
  targetDays: number,
): CoursePlanDay[] {
  const previewDays = Math.min(targetDays, PREVIEW_DAY_COUNT);
  const days: CoursePlanDay[] = [];
  let lectureIndex = 0;

  for (let day = 1; day <= previewDays; day += 1) {
    const lecturesForDay: PlannedLecture[] = [];
    let runtimeSeconds = 0;

    while (lectureIndex < lectures.length) {
      const futureDays = targetDays - day;
      const remainingAfterCurrent = lectures.length - lectureIndex - 1;
      const shouldReserveLectures =
        futureDays > 0 &&
        remainingAfterCurrent < futureDays &&
        lecturesForDay.length > 0;

      if (shouldReserveLectures) {
        break;
      }

      const lecture = lectures[lectureIndex];
      lecturesForDay.push(lecture);
      runtimeSeconds += lecture.remainingSeconds;
      lectureIndex += 1;

      if (
        runtimeSeconds >= dailyRuntimeSeconds &&
        lectures.length - lectureIndex >= futureDays
      ) {
        break;
      }
    }

    days.push({
      day,
      lectureCount: lecturesForDay.length,
      runtimeSeconds,
      realTimeSeconds: runtimeSeconds / playbackRate,
      lectures: lecturesForDay,
    });
  }

  return days;
}

export function normalizeTargetDays(days: number): number {
  if (!Number.isFinite(days)) {
    return 10;
  }

  return Math.round(clamp(days, 1, MAX_PLAN_DAYS));
}

export function createCoursePlan(
  course: Course,
  courseProgress: CourseProgress | undefined,
  targetDays: number,
  playbackRate: number,
): CoursePlan {
  const normalizedDays = normalizeTargetDays(targetDays);
  const normalizedPlaybackRate = clamp(
    Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1,
    0.25,
    4,
  );
  const knownDurations = course.lectures
    .map((lecture) => getLectureDuration(lecture, courseProgress))
    .filter((duration): duration is number => duration !== null);
  const averageLectureSeconds =
    knownDurations.length > 0
      ? knownDurations.reduce((total, duration) => total + duration, 0) /
        knownDurations.length
      : DEFAULT_LECTURE_SECONDS;

  const plannedLectures: PlannedLecture[] = course.lectures.map((lecture) => {
    const lectureProgress = courseProgress?.lectures[lecture.id];
    const knownDuration = getLectureDuration(lecture, courseProgress);
    const durationSeconds = knownDuration ?? averageLectureSeconds;
    const completed = Boolean(lectureProgress?.completed);
    const progressPercent = completed
      ? 100
      : clamp(lectureProgress?.percent ?? 0, 0, 100);
    const remainingFromTime =
      knownDuration && safeSeconds(lectureProgress?.currentTime)
        ? Math.max(0, durationSeconds - (lectureProgress?.currentTime ?? 0))
        : null;
    const remainingSeconds = completed
      ? 0
      : clamp(
          remainingFromTime ?? durationSeconds * (1 - progressPercent / 100),
          0,
          durationSeconds,
        );

    return {
      id: lecture.id,
      title: lecture.title,
      section: lecture.folderPath || "Root files",
      order: lecture.order,
      durationKnown: knownDuration !== null,
      durationSeconds,
      progressPercent,
      remainingSeconds,
    };
  });

  const remainingLectures = plannedLectures
    .filter((lecture) => lecture.remainingSeconds > 1)
    .sort((left, right) => left.order - right.order);
  const completedLectures = course.totalLectures - remainingLectures.length;
  const estimatedTotalSeconds = plannedLectures.reduce(
    (total, lecture) => total + lecture.durationSeconds,
    0,
  );
  const estimatedRemainingSeconds = remainingLectures.reduce(
    (total, lecture) => total + lecture.remainingSeconds,
    0,
  );
  const dailyRuntimeSeconds = estimatedRemainingSeconds / normalizedDays;
  const dailyRealTimeSeconds = dailyRuntimeSeconds / normalizedPlaybackRate;

  return {
    targetDays: normalizedDays,
    playbackRate: normalizedPlaybackRate,
    totalLectures: course.totalLectures,
    completedLectures,
    remainingLectures: remainingLectures.length,
    completionPercent:
      course.totalLectures > 0
        ? Math.round((completedLectures / course.totalLectures) * 100)
        : 0,
    estimatedTotalSeconds,
    estimatedRemainingSeconds,
    dailyRuntimeSeconds,
    dailyRealTimeSeconds,
    dailyLectureGoal: remainingLectures.length / normalizedDays,
    knownDurationCount: knownDurations.length,
    missingDurationCount: Math.max(0, course.totalLectures - knownDurations.length),
    averageLectureSeconds,
    confidence: getPlanConfidence(knownDurations.length, course.totalLectures),
    remainingLecturesPreview: remainingLectures.slice(0, 6),
    dayPreview: buildDayPreview(
      remainingLectures,
      dailyRuntimeSeconds,
      normalizedPlaybackRate,
      normalizedDays,
    ),
  };
}

export function formatPlanDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0m";
  }

  const roundedMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
