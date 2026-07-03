"use client";

import {
  BookOpenCheck,
  CalendarClock,
  Check,
  Edit3,
  FolderOpen,
  GraduationCap,
  Library,
  LockKeyhole,
  Music2,
  NotebookPen,
  PlayCircle,
  Trash2,
  X,
  Video,
} from "lucide-react";
import { useState } from "react";
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
  onPickFolder: () => void;
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
  const [draftName, setDraftName] = useState("");

  const beginRename = (course: SavedCourseSummary) => {
    setEditingCourseId(course.id);
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

    onDeleteCourse(courseId);
  };

  return (
    <main className="px-5 py-8 sm:py-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-sm">
            <LockKeyhole aria-hidden="true" size={16} />
            Local files stay on this computer
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-[var(--text)] sm:text-6xl">
            Open a folder. Keep your place.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            CourseVault turns local MP3 and MP4 folders into a private course
            player with saved progress.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary h-12 px-6" onClick={onPickFolder} type="button">
              <FolderOpen aria-hidden="true" size={19} />
              Select Course Folder
            </button>
          </div>
          {error ? (
            <div className="danger-alert mt-5 rounded-2xl px-4 py-3 text-sm leading-6">
              {error}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
          <div className="absolute inset-x-0 top-0 h-16 border-b border-[var(--line)] bg-[var(--panel)]" />
          <div className="absolute left-6 top-5 flex gap-2">
            <span className="size-3 rounded-full bg-red-300" />
            <span className="size-3 rounded-full bg-amber-300" />
            <span className="size-3 rounded-full bg-emerald-300" />
          </div>
          <div className="absolute inset-x-6 top-24 overflow-hidden rounded-[22px] bg-[#121826] p-5 text-white">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0b111c]">
              <div className="absolute left-5 top-5 h-3 w-32 rounded-full bg-white/15" />
              <div className="absolute bottom-5 left-5 right-5 h-2 rounded-full bg-white/10" />
              <div className="absolute bottom-5 left-5 h-2 w-1/3 rounded-full bg-white/70" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-2/5 rounded-full bg-white" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6 grid gap-3">
            {[
              ["Supported", "MP3, MP4, WAV, M4A, WEBM"],
              ["Progress", "Saved in your browser"],
              ["Structure", "Folders become sections"],
            ].map(([label, value], index) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
                key={label}
                style={{ transform: `translateX(${index * 10}px)` }}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  {index === 0 ? (
                    <Video aria-hidden="true" size={16} />
                  ) : (
                    <Music2 aria-hidden="true" size={16} />
                  )}
                  {label}
                </span>
                <span className="text-sm text-[var(--muted)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 w-full max-w-6xl">
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
              Progress is saved here. Because browsers cannot keep local file
              access forever, choose the same folder again to continue a course.
            </p>
          </div>
          <button className="btn-secondary w-fit" onClick={onPickFolder} type="button">
            <FolderOpen aria-hidden="true" size={17} />
            Add course
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                      <GraduationCap aria-hidden="true" size={14} />
                      {statusLabel(course)}
                    </div>
                    {editingCourseId === course.id ? (
                      <div className="grid gap-2">
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
                            aria-label="Save course name"
                            className="mini-icon-button"
                            disabled={!draftName.trim()}
                            onClick={() => saveRename(course.id)}
                            type="button"
                          >
                            <Check aria-hidden="true" size={17} />
                          </button>
                          <button
                            aria-label="Cancel course rename"
                            className="mini-icon-button"
                            onClick={cancelRename}
                            type="button"
                          >
                            <X aria-hidden="true" size={17} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-start gap-2">
                        <h3 className="line-clamp-2 text-lg font-bold leading-6 text-[var(--text)]">
                          {course.name}
                        </h3>
                        <button
                          aria-label={`Rename ${course.name}`}
                          className="mini-icon-button shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          onClick={() => beginRename(course)}
                          type="button"
                        >
                          <Edit3 aria-hidden="true" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid size-16 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-sm font-black text-[var(--text)]">
                    {course.percent}%
                  </div>
                </div>

                <div className="mt-5">
                  <ProgressBar label={`${course.name} progress`} value={course.percent} />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--text)]">
                      {course.completedLectures} / {course.totalLectures} complete
                    </span>
                    <span className="text-[var(--muted)]">
                      {course.watchedLectures} watched
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock aria-hidden="true" size={16} />
                    {formatLastOpened(course.lastOpenedAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <NotebookPen aria-hidden="true" size={16} />
                    {course.noteCount} {course.noteCount === 1 ? "note" : "notes"}
                  </span>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <button
                    className="btn-primary"
                    onClick={() => onResumeCourse(course.id)}
                    type="button"
                  >
                    <PlayCircle aria-hidden="true" size={17} />
                    Resume
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={onPickFolder}
                    type="button"
                  >
                    <BookOpenCheck aria-hidden="true" size={17} />
                    New folder
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => deleteCourse(course.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={17} />
                    Delete
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
              Select a folder once, then CourseVault will keep a progress card
              here for your next study session.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
