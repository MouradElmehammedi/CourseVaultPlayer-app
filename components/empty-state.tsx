"use client";

import {
  CalendarClock,
  Check,
  Edit3,
  FolderOpen,
  GraduationCap,
  Library,
  MoreHorizontal,
  NotebookPen,
  PlayCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "./progress-bar";

export type SavedCourseSummary = {
  id: string;
  name: string;
  completedLectures: number;
  totalLectures: number;
  percent: number;
  lastOpenedAt: string;
  noteCount: number;
  watchedLectures: number;
};

type EmptyStateProps = {
  courses: SavedCourseSummary[];
  onDeleteCourse: (courseId: string) => void;
  onPickFolder: (courseId?: string) => void;
  onRenameCourse: (courseId: string, name: string) => void;
  onResumeCourse: (courseId: string) => void;
  error?: string | null;
};

function formatLastOpened(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not opened yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(course: SavedCourseSummary): string {
  if (course.percent >= 100) {
    return "Completed";
  }

  if (course.percent > 0) {
    return "In progress";
  }

  return "Ready";
}

export function EmptyState({
  courses,
  onDeleteCourse,
  onPickFolder,
  onRenameCourse,
  onResumeCourse,
  error,
}: EmptyStateProps) {
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [openMenuCourseId, setOpenMenuCourseId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuCourseId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuCourseId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuCourseId(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuCourseId]);

  const beginRename = (course: SavedCourseSummary) => {
    setEditingCourseId(course.id);
    setOpenMenuCourseId(null);
    setDraftName(course.name);
  };

  const cancelRename = () => {
    setEditingCourseId(null);
    setDraftName("");
  };

  const saveRename = (courseId: string) => {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      return;
    }

    onRenameCourse(courseId, trimmedName);
    cancelRename();
  };

  const deleteCourse = (courseId: string) => {
    if (editingCourseId === courseId) {
      cancelRename();
    }

    setOpenMenuCourseId(null);
    onDeleteCourse(courseId);
  };

  const chooseNewFolder = (courseId?: string) => {
    setOpenMenuCourseId(null);
    onPickFolder(courseId);
  };

  return (
    <main className="px-5 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-bold uppercase tracking-normal text-[var(--primary)]">
              <Library aria-hidden="true" size={14} />
              Local library
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              Saved courses
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Progress is saved here. Resume reopens connected local folders
              without uploading your course files.
            </p>
          </div>
          <button
            className="btn-secondary w-fit"
            onClick={() => onPickFolder()}
            type="button"
          >
            <FolderOpen aria-hidden="true" size={17} />
            Add course
          </button>
        </div>

        {error ? (
          <div className="danger-alert mb-4 rounded-2xl px-4 py-3 text-sm leading-6">
            {error}
          </div>
        ) : null}

        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className="course-card-top">
                  <div
                    className="course-card-action"
                    ref={openMenuCourseId === course.id ? menuRef : null}
                  >
                    <button
                      aria-expanded={openMenuCourseId === course.id}
                      aria-haspopup="menu"
                      aria-label={`Open actions for ${course.name}`}
                      className="course-card-menu-button"
                      onClick={() =>
                        setOpenMenuCourseId((current) =>
                          current === course.id ? null : course.id,
                        )
                      }
                      type="button"
                    >
                      <MoreHorizontal aria-hidden="true" size={19} />
                    </button>

                    {openMenuCourseId === course.id ? (
                      <div className="course-card-menu" role="menu">
                        <button
                          className="card-menu-item"
                          onClick={() => beginRename(course)}
                          role="menuitem"
                          type="button"
                        >
                          <Edit3 aria-hidden="true" size={16} />
                          Rename
                        </button>
                        <button
                          className="card-menu-item"
                          onClick={() => chooseNewFolder(course.id)}
                          role="menuitem"
                          type="button"
                        >
                          <FolderOpen aria-hidden="true" size={16} />
                          Select folder
                        </button>
                        <button
                          className="card-menu-item card-menu-danger"
                          onClick={() => deleteCourse(course.id)}
                          role="menuitem"
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="course-card-status">
                    <GraduationCap aria-hidden="true" size={14} />
                    {statusLabel(course)}
                  </div>
                  <div className="course-card-percent">{course.percent}%</div>
                </div>

                <div className="course-card-title-zone">
                  {editingCourseId === course.id ? (
                    <div className="grid gap-3">
                      <label className="sr-only" htmlFor={`course-name-${course.id}`}>
                        Course name
                      </label>
                      <input
                        autoFocus
                        className="field h-11"
                        id={`course-name-${course.id}`}
                        onChange={(event) => setDraftName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            saveRename(course.id);
                          }

                          if (event.key === "Escape") {
                            cancelRename();
                          }
                        }}
                        value={draftName}
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn-primary h-10 px-4"
                          disabled={!draftName.trim()}
                          onClick={() => saveRename(course.id)}
                          type="button"
                        >
                          <Check aria-hidden="true" size={16} />
                          Save
                        </button>
                        <button
                          className="btn-secondary h-10 px-4"
                          onClick={cancelRename}
                          type="button"
                        >
                          <X aria-hidden="true" size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="course-card-title line-clamp-2" title={course.name}>
                        {course.name}
                      </h3>
                      <p className="course-card-subtitle">
                        {course.completedLectures} of {course.totalLectures} lessons complete
                      </p>
                    </>
                  )}
                </div>

                <div className="course-card-progress">
                  <ProgressBar label={`${course.name} progress`} value={course.percent} />
                  <div className="course-card-stats">
                    <span>
                      <strong>{course.watchedLectures}</strong>
                      watched
                    </span>
                    <span>
                      <strong>{course.totalLectures}</strong>
                      lessons
                    </span>
                  </div>
                </div>

                <div className="course-card-meta">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock aria-hidden="true" size={16} />
                    {formatLastOpened(course.lastOpenedAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <NotebookPen aria-hidden="true" size={16} />
                    {course.noteCount} {course.noteCount === 1 ? "note" : "notes"}
                  </span>
                </div>

                <div className="course-card-footer">
                  <button
                    className="btn-primary h-12 w-full"
                    onClick={() => onResumeCourse(course.id)}
                    type="button"
                  >
                    <PlayCircle aria-hidden="true" size={17} />
                    Resume
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center">
            <Library
              aria-hidden="true"
              className="mx-auto mb-4 text-[var(--muted)]"
              size={34}
            />
            <h3 className="text-lg font-semibold text-[var(--text)]">
              No saved courses yet
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Select a folder once, then LearnVault will keep a progress card
              here for your next study session.
            </p>
            <button
              className="btn-primary mt-5 h-12 px-6"
              onClick={() => onPickFolder()}
              type="button"
            >
              <FolderOpen aria-hidden="true" size={18} />
              Select Course Folder
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
