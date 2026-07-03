import type { Course } from "@/types/course";
import type { AppStorage, CourseProgress, LectureProgress } from "@/types/progress";
import { DEFAULT_SETTINGS } from "@/types/settings";

export const STORAGE_KEY = "learnvault:v1:progress";

const LEGACY_STORAGE_KEYS = ["coursevault:v1:progress"];

export function createDefaultStorage(): AppStorage {
  return {
    version: 1,
    courses: {},
    settings: DEFAULT_SETTINGS,
    lastCourseId: null,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeStorage(value: unknown): AppStorage {
  if (!isObject(value) || value.version !== 1 || !isObject(value.courses)) {
    return createDefaultStorage();
  }

  const settings = isObject(value.settings)
    ? { ...DEFAULT_SETTINGS, ...value.settings }
    : DEFAULT_SETTINGS;

  return {
    version: 1,
    courses: value.courses as Record<string, CourseProgress>,
    settings,
    lastCourseId: typeof value.lastCourseId === "string" ? value.lastCourseId : null,
  };
}

export function loadStorage(): AppStorage {
  if (typeof window === "undefined") {
    return createDefaultStorage();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return normalizeStorage(JSON.parse(raw));
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);

      if (legacyRaw) {
        const legacyStorage = normalizeStorage(JSON.parse(legacyRaw));
        saveStorage(legacyStorage);
        return legacyStorage;
      }
    }

    return createDefaultStorage();
  } catch {
    return createDefaultStorage();
  }
}

export function saveStorage(data: AppStorage): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((legacyKey) => {
      window.localStorage.removeItem(legacyKey);
    });
    return true;
  } catch {
    return false;
  }
}

export function createCourseProgress(course: Course): CourseProgress {
  return {
    courseId: course.id,
    courseName: course.name,
    rootFolderName: course.rootFolderName,
    totalLectures: course.totalLectures,
    completedLectures: 0,
    lastLectureId: course.lectures[0]?.id ?? null,
    lastOpenedAt: new Date().toISOString(),
    lectures: {},
    notes: {},
  };
}

export function ensureCourseProgress(
  storage: AppStorage,
  course: Course,
): AppStorage {
  const existing = storage.courses[course.id];
  const nextCourse = existing
    ? {
        ...existing,
        courseName: existing.courseName || course.name,
        rootFolderName: course.rootFolderName,
        totalLectures: course.totalLectures,
        lastOpenedAt: new Date().toISOString(),
        notes: existing.notes ?? {},
      }
    : createCourseProgress(course);

  return {
    ...storage,
    courses: {
      ...storage.courses,
      [course.id]: nextCourse,
    },
  };
}

export function updateCourseProgressCounts(
  courseProgress: CourseProgress,
): CourseProgress {
  const completedLectures = Object.values(courseProgress.lectures).filter(
    (lecture) => lecture.completed,
  ).length;

  return {
    ...courseProgress,
    completedLectures,
  };
}

export function mergeLectureProgress(
  current: LectureProgress | undefined,
  patch: Partial<LectureProgress> & { lectureId: string },
): LectureProgress {
  return {
    lectureId: patch.lectureId,
    currentTime: patch.currentTime ?? current?.currentTime ?? 0,
    duration: patch.duration ?? current?.duration ?? 0,
    percent: patch.percent ?? current?.percent ?? 0,
    completed: patch.completed ?? current?.completed ?? false,
    lastPlayedAt:
      patch.lastPlayedAt ?? current?.lastPlayedAt ?? new Date().toISOString(),
    playCount: patch.playCount ?? current?.playCount ?? 0,
    manuallyCompleted: patch.manuallyCompleted ?? current?.manuallyCompleted,
  };
}
