"use client";

import Link from "next/link";
import {
  Download,
  FolderOpen,
  Home,
  ListVideo,
  Moon,
  PowerOff,
  Settings,
  Sun,
  Upload,
} from "lucide-react";
import type { Course } from "@/types/course";
import type { AppSettings } from "@/types/settings";

type TopBarProps = {
  course: Course | null;
  completionPercent: number;
  resolvedTheme: "light" | "dark";
  theme: AppSettings["theme"];
  onExport: () => void;
  onHome: () => void;
  onImport: () => void;
  onOpenCourseContent: () => void;
  onPickFolder: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
};

export function TopBar({
  course,
  completionPercent,
  resolvedTheme,
  theme,
  onExport,
  onHome,
  onImport,
  onOpenCourseContent,
  onPickFolder,
  onSettings,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="app-header sticky top-0 z-30 border-b border-[var(--line)] backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm">
            LV
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">
              LearnVault Player
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {course ? course.name : "No course selected"}
            </p>
          </div>
        </div>

        {course ? (
          <div className="hidden min-w-[170px] items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 md:flex">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Progress
            </span>
            <div className="h-2 min-w-20 overflow-hidden rounded-full bg-[var(--field-bg)]">
              <div
                className="h-full rounded-full bg-[var(--success)]"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--text)]">
              {completionPercent}%
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            aria-label="Go to course library"
            className="icon-button"
            onClick={onHome}
            title="Course library"
            type="button"
          >
            <Home aria-hidden="true" size={18} />
          </button>
          <Link
            aria-label="Open landing page"
            className="icon-button"
            href="/landing"
            title="Landing page"
          >
            <PowerOff aria-hidden="true" size={18} />
          </Link>
          {course ? (
            <button
              aria-label="Open course content"
              className="icon-button lg:hidden"
              onClick={onOpenCourseContent}
              title="Course content"
              type="button"
            >
              <ListVideo aria-hidden="true" size={18} />
            </button>
          ) : null}
          <button
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="theme-toggle"
            onClick={onToggleTheme}
            title={`Theme: ${theme}`}
            type="button"
          >
            <span className={resolvedTheme === "dark" ? "" : "theme-toggle-active"}>
              <Sun aria-hidden="true" size={15} />
            </span>
            <span className={resolvedTheme === "dark" ? "theme-toggle-active" : ""}>
              <Moon aria-hidden="true" size={15} />
            </span>
          </button>
          <button
            className="btn-secondary hidden sm:inline-flex"
            onClick={onPickFolder}
            type="button"
          >
            <FolderOpen aria-hidden="true" size={17} />
            Select New Folder
          </button>
          <button
            aria-label="Select new folder"
            className="icon-button sm:hidden"
            onClick={onPickFolder}
            type="button"
          >
            <FolderOpen aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Export progress"
            className="icon-button"
            onClick={onExport}
            type="button"
          >
            <Download aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Import progress"
            className="icon-button"
            onClick={onImport}
            type="button"
          >
            <Upload aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Settings"
            className="icon-button"
            onClick={onSettings}
            type="button"
          >
            <Settings aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
