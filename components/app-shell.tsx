"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiCoursePlanner } from "@/components/ai-course-planner";
import { CourseSidebar } from "@/components/course-sidebar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, type SavedCourseSummary } from "@/components/empty-state";
import { MediaPlayer } from "@/components/media-player";
import { SettingsModal } from "@/components/settings-modal";
import { TopBar } from "@/components/top-bar";
import {
  clearCourseDirectoryHandles,
  deleteCourseDirectoryHandle,
  ensureCourseDirectoryPermission,
  getCourseDirectoryHandle,
  pickCourseDirectory,
  readCourseDirectory,
  saveCourseDirectoryHandle,
  supportsCourseDirectoryPicker,
  type CourseDirectoryHandle,
} from "@/lib/course-directory";
import { parseCourseFiles } from "@/lib/course-parser";
import { getCourseCompletion } from "@/lib/progress";
import {
  addCourseDailyActivity,
  clearStorage,
  createCourseProgress,
  createDefaultStorage,
  ensureCourseProgress,
  loadStorage,
  mergeLectureProgress,
  normalizeStorage,
  saveStorage,
  updateCourseProgressCounts,
} from "@/lib/storage";
import type { Course } from "@/types/course";
import type { AppStorage, LectureProgress } from "@/types/progress";
import type { AppSettings } from "@/types/settings";

type ConfirmAction = "clear-all" | "clear-course" | "delete-saved-course" | null;
const MAX_WATCHED_DELTA_SECONDS = 45;

function getWatchedDeltaSeconds(
  current: LectureProgress | undefined,
  patch: Partial<LectureProgress> & { lectureId: string },
): number {
  if (
    typeof patch.currentTime !== "number" ||
    !Number.isFinite(patch.currentTime) ||
    typeof current?.currentTime !== "number" ||
    !Number.isFinite(current.currentTime)
  ) {
    return 0;
  }

  const delta = patch.currentTime - current.currentTime;

  if (delta <= 0 || delta > MAX_WATCHED_DELTA_SECONDS) {
    return 0;
  }

  return delta;
}

function buildExpandedSections(course: Course): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};

  const visit = (sections: Course["sections"]) => {
    sections.forEach((section) => {
      expanded[section.id] = section.isOpen;
      visit(section.children);
    });
  };

  visit(course.sections);
  return expanded;
}

function resolveTheme(theme: AppSettings["theme"]): "light" | "dark" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: AppSettings["theme"]): "light" | "dark" {
  const resolved = resolveTheme(theme);

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  }

  return resolved;
}

export function AppShell() {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const pendingResumeCourseIdRef = useRef<string | null>(null);
  const autoRestoreAttemptedRef = useRef(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [courseIdPendingDelete, setCourseIdPendingDelete] = useState<string | null>(null);
  const [courseContentVisible, setCourseContentVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorageState] = useState<AppStorage>(() => createDefaultStorage());
  const [storageReady, setStorageReady] = useState(false);

  const setFolderInputRef = useCallback((node: HTMLInputElement | null) => {
    folderInputRef.current = node;

    if (node) {
      node.setAttribute("webkitdirectory", "");
      node.setAttribute("directory", "");
    }
  }, []);

  const persistStorage = useCallback(
    (updater: AppStorage | ((current: AppStorage) => AppStorage)) => {
      setStorageState((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        const saved = saveStorage(next);

        if (!saved) {
          setError(
            "Progress could not be saved because browser storage is full. Export your progress or clear old data.",
          );
        }

        return next;
      });
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const loadedStorage = loadStorage();
      setStorageState(loadedStorage);
      applyTheme(loadedStorage.settings.theme);
      setStorageReady(true);
    });

  }, []);

  const settings = storage.settings;
  const savedCourses = useMemo<SavedCourseSummary[]>(
    () =>
      Object.values(storage.courses)
        .map((savedCourse) => {
          const lectureProgress = Object.values(savedCourse.lectures ?? {});
          const completedLectures = lectureProgress.filter(
            (lecture) => lecture.completed,
          ).length;
          const watchedLectures = lectureProgress.filter(
            (lecture) => lecture.percent > 0 || lecture.completed,
          ).length;
          const totalLectures = Math.max(savedCourse.totalLectures, 0);
          const noteCount = Object.values(savedCourse.notes ?? {}).filter((note) =>
            note.content.trim(),
          ).length;

          return {
            id: savedCourse.courseId,
            name: savedCourse.courseName || savedCourse.rootFolderName,
            completedLectures,
            totalLectures,
            percent:
              totalLectures > 0
                ? Math.round((completedLectures / totalLectures) * 100)
                : 0,
            lastOpenedAt: savedCourse.lastOpenedAt,
            noteCount,
            watchedLectures,
          };
        })
        .sort(
          (left, right) =>
            new Date(right.lastOpenedAt).getTime() -
            new Date(left.lastOpenedAt).getTime(),
        ),
    [storage.courses],
  );
  const courseProgress = course ? storage.courses[course.id] : undefined;
  const activeLecture = useMemo(
    () => course?.lectures.find((lecture) => lecture.id === activeLectureId) ?? null,
    [activeLectureId, course],
  );
  const activeIndex = activeLecture
    ? course?.lectures.findIndex((lecture) => lecture.id === activeLecture.id) ?? -1
    : -1;
  const previousLecture =
    course && activeIndex > 0 ? course.lectures[activeIndex - 1] : null;
  const nextLecture =
    course && activeIndex >= 0 && activeIndex < course.lectures.length - 1
      ? course.lectures[activeIndex + 1]
      : null;
  const completion = course
    ? getCourseCompletion(course, courseProgress)
    : { completedLectures: 0, totalLectures: 0, percent: 0 };

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const updateTheme = () => {
      applyTheme(settings.theme);
    };

    queueMicrotask(updateTheme);

    if (settings.theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [settings.theme, storageReady]);

  const openCourseFiles = useCallback(
    async (
      files: FileList | File[],
      options: {
        baseStorage?: AppStorage;
        directoryHandle?: CourseDirectoryHandle;
        expectedCourseId?: string | null;
      } = {},
    ): Promise<boolean> => {
      if (files.length === 0) {
        return false;
      }

      const parsedCourse = parseCourseFiles(files);
      const expectedCourseId = options.expectedCourseId ?? null;
      const baseStorage = options.baseStorage ?? storage;

      if (!parsedCourse) {
        setCourse(null);
        setActiveLectureId(null);
        setError(
          "No playable course files found. Supported files: MP3, MP4, WAV, M4A, WEBM.",
        );
        return false;
      }

      let handleWarning: string | null = null;

      if (options.directoryHandle) {
        try {
          await saveCourseDirectoryHandle(parsedCourse.id, options.directoryHandle);
        } catch {
          handleWarning =
            "Course opened, but the browser could not save folder access. Resume may need one folder reconnect later.";
        }
      }

      const expectedCourseName = expectedCourseId
        ? baseStorage.courses[expectedCourseId]?.courseName
        : null;
      const selectionWarning =
        expectedCourseId && parsedCourse.id !== expectedCourseId
          ? `That folder did not match "${expectedCourseName ?? "the saved course"}". I opened "${parsedCourse.name}" instead.`
          : null;
      const nextStorage = ensureCourseProgress(baseStorage, parsedCourse);
      const nextProgress = nextStorage.courses[parsedCourse.id];
      const displayCourse: Course = {
        ...parsedCourse,
        name: nextProgress.courseName || parsedCourse.name,
      };
      const savedLastLecture = nextProgress.lastLectureId;
      const activeId =
        savedLastLecture &&
        parsedCourse.lectures.some((lecture) => lecture.id === savedLastLecture)
          ? savedLastLecture
          : parsedCourse.lectures[0]?.id ?? null;

      const stored: AppStorage = {
        ...nextStorage,
        lastCourseId: parsedCourse.id,
        courses: {
          ...nextStorage.courses,
          [parsedCourse.id]: {
            ...nextProgress,
            lastLectureId: activeId,
            lastOpenedAt: new Date().toISOString(),
          },
        },
      };

      setCourse(displayCourse);
      setActiveLectureId(activeId);
      setExpandedSections(buildExpandedSections(displayCourse));
      setSearchQuery("");
      setError(selectionWarning ?? handleWarning);
      persistStorage(stored);
      return true;
    },
    [persistStorage, storage],
  );

  const openCourseFromHandle = useCallback(
    async (
      courseId: string,
      directoryHandle: CourseDirectoryHandle,
      options: {
        baseStorage?: AppStorage;
        requestPermission: boolean;
      },
    ): Promise<boolean> => {
      try {
        const hasPermission = await ensureCourseDirectoryPermission(
          directoryHandle,
          options.requestPermission,
        );

        if (!hasPermission) {
          if (options.requestPermission) {
            setError("Folder permission was not granted, so the course could not be resumed.");
          }

          return false;
        }

        const files = await readCourseDirectory(directoryHandle);
        return await openCourseFiles(files, {
          baseStorage: options.baseStorage,
          directoryHandle,
          expectedCourseId: courseId,
        });
      } catch {
        setError(
          "I could not reopen this folder. Use Select folder once to reconnect it.",
        );
        return false;
      }
    },
    [openCourseFiles],
  );

  const openFolderInputFallback = () => {
    if (!folderInputRef.current) {
      return false;
    }

    folderInputRef.current.value = "";
    folderInputRef.current.click();
    return true;
  };

  const pickFolder = async (expectedCourseId?: string) => {
    setError(null);
    pendingResumeCourseIdRef.current = expectedCourseId ?? null;

    if (supportsCourseDirectoryPicker()) {
      try {
        const selectedDirectory = await pickCourseDirectory();
        pendingResumeCourseIdRef.current = null;

        if (!selectedDirectory) {
          return;
        }

        await openCourseFiles(selectedDirectory.files, {
          directoryHandle: selectedDirectory.handle,
          expectedCourseId,
        });
      } catch {
        pendingResumeCourseIdRef.current = expectedCourseId ?? null;

        if (!openFolderInputFallback()) {
          setError("Folder selection is unavailable in this browser context.");
        }
      }

      return;
    }

    if (!openFolderInputFallback()) {
      setError("Folder selection is unavailable in this browser context.");
    }
  };

  const importProgress = () => {
    if (importInputRef.current) {
      importInputRef.current.value = "";
      importInputRef.current.click();
    }
  };

  const selectLecture = useCallback(
    (lectureId: string) => {
      setActiveLectureId(lectureId);

      if (!course) {
        return;
      }

      persistStorage((current) => {
        const currentCourse = current.courses[course.id] ?? createCourseProgress(course);

        return {
          ...current,
          lastCourseId: course.id,
          courses: {
            ...current.courses,
            [course.id]: {
              ...currentCourse,
              lastLectureId: lectureId,
              lastOpenedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [course, persistStorage],
  );

  const handleFolderSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const expectedCourseId = pendingResumeCourseIdRef.current;
    pendingResumeCourseIdRef.current = null;
    void openCourseFiles(files, { expectedCourseId });
  };

  const resumeSavedCourse = useCallback(
    async (courseId: string) => {
      setError(null);

      try {
        const directoryHandle = await getCourseDirectoryHandle(courseId);

        if (!directoryHandle) {
          setError(
            "This saved course is not connected to a folder yet. Use Select folder from the card menu once, then Resume will reopen it without the upload window.",
          );
          return;
        }

        await openCourseFromHandle(courseId, directoryHandle, {
          requestPermission: true,
        });
      } catch {
        setError(
          "I could not load the saved folder connection. Use Select folder once to reconnect this course.",
        );
      }
    },
    [openCourseFromHandle],
  );

  const goHome = useCallback(() => {
    autoRestoreAttemptedRef.current = true;
    setCourse(null);
    setActiveLectureId(null);
    persistStorage((current) => ({
      ...current,
      lastCourseId: null,
    }));
  }, [persistStorage]);

  useEffect(() => {
    const lastCourseId = storage.lastCourseId;

    if (!storageReady || course || !lastCourseId || autoRestoreAttemptedRef.current) {
      return;
    }

    autoRestoreAttemptedRef.current = true;

    void (async () => {
      const directoryHandle = await getCourseDirectoryHandle(lastCourseId);

      if (!directoryHandle) {
        setError(
          "The last course could not reopen because its folder is not connected yet. Use Select folder once from the saved course card.",
        );
        return;
      }

      const reopened = await openCourseFromHandle(
        lastCourseId,
        directoryHandle,
        {
          baseStorage: storage,
          requestPermission: false,
        },
      );

      if (!reopened) {
        setError("Click Resume to grant folder access and reopen the last course.");
      }
    })();
  }, [course, openCourseFromHandle, storage, storageReady]);

  const updateLectureProgress = useCallback(
    (
      lectureId: string,
      patch: Partial<LectureProgress> & { lectureId: string },
    ) => {
      if (!course) {
        return;
      }

      persistStorage((current) => {
        const currentCourse = current.courses[course.id] ?? createCourseProgress(course);
        const currentLecture = currentCourse.lectures[lectureId];
        const watchedDeltaSeconds = getWatchedDeltaSeconds(currentLecture, patch);
        const merged = mergeLectureProgress(
          currentLecture,
          patch,
        );
        const nextCourse = updateCourseProgressCounts(
          addCourseDailyActivity(
            {
              ...currentCourse,
              lastLectureId: lectureId,
              lastOpenedAt: new Date().toISOString(),
              lectures: {
                ...currentCourse.lectures,
                [lectureId]: merged,
              },
            },
            watchedDeltaSeconds,
          ),
        );

        return {
          ...current,
          courses: {
            ...current.courses,
            [course.id]: nextCourse,
          },
        };
      });
    },
    [course, persistStorage],
  );

  const markLectureComplete = useCallback(
    (lectureId: string) => {
      if (!course) {
        return;
      }

      persistStorage((current) => {
        const currentCourse = current.courses[course.id] ?? createCourseProgress(course);
        const currentLecture = currentCourse.lectures[lectureId];
        const merged = mergeLectureProgress(currentLecture, {
          lectureId,
          completed: true,
          currentTime: currentLecture?.currentTime ?? 0,
          duration: currentLecture?.duration ?? 0,
          percent: 100,
          manuallyCompleted: true,
          lastPlayedAt: new Date().toISOString(),
        });
        const nextCourse = updateCourseProgressCounts({
          ...currentCourse,
          lectures: {
            ...currentCourse.lectures,
            [lectureId]: merged,
          },
        });

        return {
          ...current,
          courses: {
            ...current.courses,
            [course.id]: nextCourse,
          },
        };
      });
    },
    [course, persistStorage],
  );

  const registerPlay = useCallback(
    (lectureId: string) => {
      if (!course) {
        return;
      }

      persistStorage((current) => {
        const currentCourse = current.courses[course.id] ?? createCourseProgress(course);
        const currentLecture = currentCourse.lectures[lectureId];
        const merged = mergeLectureProgress(currentLecture, {
          lectureId,
          playCount: (currentLecture?.playCount ?? 0) + 1,
          lastPlayedAt: new Date().toISOString(),
        });

        return {
          ...current,
          courses: {
            ...current.courses,
            [course.id]: {
              ...currentCourse,
              lastLectureId: lectureId,
              lastOpenedAt: new Date().toISOString(),
              lectures: {
                ...currentCourse.lectures,
                [lectureId]: merged,
              },
            },
          },
        };
      });
    },
    [course, persistStorage],
  );

  const updateNote = useCallback(
    (lectureId: string, content: string) => {
      if (!course) {
        return;
      }

      persistStorage((current) => {
        const currentCourse = current.courses[course.id] ?? createCourseProgress(course);

        return {
          ...current,
          courses: {
            ...current.courses,
            [course.id]: {
              ...currentCourse,
              notes: {
                ...(currentCourse.notes ?? {}),
                [lectureId]: {
                  lectureId,
                  content,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          },
        };
      });
    },
    [course, persistStorage],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      persistStorage((current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...patch,
        },
      }));
    },
    [persistStorage],
  );

  const renameCourse = useCallback(
    (courseId: string, name: string) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return;
      }

      persistStorage((current) => {
        const savedCourse = current.courses[courseId];

        if (!savedCourse) {
          return current;
        }

        return {
          ...current,
          courses: {
            ...current.courses,
            [courseId]: {
              ...savedCourse,
              courseName: trimmedName,
            },
          },
        };
      });

      setCourse((currentCourse) =>
        currentCourse?.id === courseId
          ? { ...currentCourse, name: trimmedName }
          : currentCourse,
      );
    },
    [persistStorage],
  );

  const requestDeleteCourse = useCallback((courseId: string) => {
    setCourseIdPendingDelete(courseId);
    setConfirmAction("delete-saved-course");
  }, []);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(storage, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "learnvault-progress.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const imported = normalizeStorage(JSON.parse(raw));
      const merged: AppStorage = {
        version: 1,
        lastCourseId: storage.lastCourseId,
        settings: {
          ...storage.settings,
          ...imported.settings,
        },
        courses: {
          ...storage.courses,
          ...imported.courses,
        },
      };

      persistStorage(merged);
      setError(null);
    } catch {
      setError("Import failed. Choose a valid LearnVault progress JSON file.");
    }
  };

  const confirmDestructiveAction = () => {
    if (confirmAction === "clear-all") {
      clearStorage();
      void clearCourseDirectoryHandles();
      setStorageState(createDefaultStorage());
      applyTheme("light");
      setStorageReady(true);
      setError(null);
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "delete-saved-course" && courseIdPendingDelete) {
      void deleteCourseDirectoryHandle(courseIdPendingDelete);
      persistStorage((current) => {
        const nextCourses = { ...current.courses };
        delete nextCourses[courseIdPendingDelete];

        return {
          ...current,
          lastCourseId:
            current.lastCourseId === courseIdPendingDelete
              ? null
              : current.lastCourseId,
          courses: nextCourses,
        };
      });

      if (course?.id === courseIdPendingDelete) {
        setCourse(null);
        setActiveLectureId(null);
      }

      setCourseIdPendingDelete(null);
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "clear-course" && course) {
      void deleteCourseDirectoryHandle(course.id);
      persistStorage((current) => {
        const nextCourses = { ...current.courses };
        delete nextCourses[course.id];

        return {
          ...current,
          lastCourseId: current.lastCourseId === course.id ? null : current.lastCourseId,
          courses: nextCourses,
        };
      });
      setConfirmAction(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key.toLowerCase() === "n" && nextLecture) {
        event.preventDefault();
        selectLecture(nextLecture.id);
      }

      if (event.key.toLowerCase() === "p" && previousLecture) {
        event.preventDefault();
        selectLecture(previousLecture.id);
      }

      if (event.key.toLowerCase() === "m" && activeLectureId) {
        event.preventDefault();
        markLectureComplete(activeLectureId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeLectureId,
    markLectureComplete,
    nextLecture,
    previousLecture,
    selectLecture,
    ]);

  const sharedInputs = (
    <>
      <input
        accept=".mp3,.wav,.ogg,.m4a,.aac,.mp4,.webm,.mov,.mkv,.avi,.wmv,.flv"
        className="sr-only"
        multiple
        onChange={(event) => handleFolderSelected(event.target.files)}
        ref={setFolderInputRef}
        type="file"
      />
      <input
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void handleImportFile(event.target.files?.[0] ?? null)}
        ref={importInputRef}
        type="file"
      />
    </>
  );

  const pendingDeleteCourseName = courseIdPendingDelete
    ? storage.courses[courseIdPendingDelete]?.courseName ??
      storage.courses[courseIdPendingDelete]?.rootFolderName ??
      "this course"
    : "this course";
  const confirmLabel =
    confirmAction === "clear-all"
      ? "Clear all data"
      : confirmAction === "delete-saved-course"
        ? "Delete course"
        : "Clear progress";
  const confirmDescription =
    confirmAction === "clear-all"
      ? "This will remove all saved LearnVault progress and settings from this browser."
      : confirmAction === "delete-saved-course"
        ? `This will remove "${pendingDeleteCourseName}" from your saved course library. Local files on your computer will not be touched.`
        : "This will remove saved progress for the current course from this browser.";

  const sharedDialogs = (
    <>
      <SettingsModal
        hasCourse={Boolean(course)}
        open={settingsOpen}
        settings={settings}
        onClearAll={() => setConfirmAction("clear-all")}
        onClearCourse={() => setConfirmAction("clear-course")}
        onClose={() => setSettingsOpen(false)}
        onExport={exportProgress}
        onImport={importProgress}
        onUpdateSettings={updateSettings}
      />

      <ConfirmDialog
        confirmLabel={confirmLabel}
        description={confirmDescription}
        onCancel={() => {
          setConfirmAction(null);
          setCourseIdPendingDelete(null);
        }}
        onConfirm={confirmDestructiveAction}
        open={Boolean(confirmAction)}
        title="Are you sure?"
      />
    </>
  );

  if (!course) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {sharedInputs}
        <TopBar
          completionPercent={0}
          course={null}
          courseContentVisible={courseContentVisible}
          pomodoroMinutes={settings.pomodoroMinutes}
          onHome={goHome}
          onPickFolder={() => void pickFolder()}
          onSettings={() => setSettingsOpen(true)}
          onToggleCourseContent={() =>
            setCourseContentVisible((current) => !current)
          }
        />
        <EmptyState
          courses={savedCourses}
          error={error}
          onDeleteCourse={requestDeleteCourse}
          onPickFolder={(courseId) => void pickFolder(courseId)}
          onRenameCourse={renameCourse}
          onResumeCourse={(courseId) => void resumeSavedCourse(courseId)}
        />
        {sharedDialogs}
      </div>
    );
  }

  const sidebar = (
    <CourseSidebar
      activeLectureId={activeLectureId}
      compact={settings.compactSidebar}
      course={course}
      courseProgress={courseProgress}
      expandedSections={expandedSections}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSelectLecture={selectLecture}
      onToggleSection={(sectionId) =>
        setExpandedSections((current) => ({
          ...current,
          [sectionId]: !(current[sectionId] ?? true),
        }))
      }
    />
  );
  const courseGridClass = courseContentVisible
    ? settings.sidebarPosition === "left"
      ? "lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]"
      : "lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]"
    : "course-layout-expanded lg:grid-cols-1";

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {sharedInputs}

      <TopBar
        completionPercent={completion.percent}
        course={course}
        courseContentVisible={courseContentVisible}
        pomodoroMinutes={settings.pomodoroMinutes}
        onHome={goHome}
        onPickFolder={() => void pickFolder()}
        onSettings={() => setSettingsOpen(true)}
        onToggleCourseContent={() =>
          setCourseContentVisible((current) => !current)
        }
      />

      {error ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
          <div className="danger-alert rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      ) : null}

      <main
        className={`mx-auto grid max-w-[1800px] gap-5 px-4 py-5 sm:px-6 ${courseGridClass}`}
      >
        {courseContentVisible && settings.sidebarPosition === "left" ? sidebar : null}
        <div className="grid min-w-0 gap-5">
          <MediaPlayer
            lecture={activeLecture}
            nextLecture={nextLecture}
            note={activeLecture ? courseProgress?.notes?.[activeLecture.id] : undefined}
            previousLecture={previousLecture}
            progress={
              activeLecture ? courseProgress?.lectures[activeLecture.id] : undefined
            }
            settings={settings}
            onMarkComplete={markLectureComplete}
            onNoteChange={updateNote}
            onPlayStarted={registerPlay}
            onProgressUpdate={updateLectureProgress}
            onSelectLecture={selectLecture}
            onSettingsChange={updateSettings}
          />
          <AiCoursePlanner
            course={course}
            courseProgress={courseProgress}
            playbackRate={settings.defaultPlaybackRate}
          />
        </div>
        {courseContentVisible && settings.sidebarPosition === "right" ? sidebar : null}
      </main>

      {sharedDialogs}
    </div>
  );
}
