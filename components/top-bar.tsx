"use client";

import {
  Download,
  FileText,
  FolderOpen,
  Home,
  ListVideo,
  Menu,
  Moon,
  Settings,
  Sun,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const runMenuAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <header className="app-header sticky top-0 z-30 border-b border-[var(--line)] backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open menu"
              className="icon-button"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Menu aria-hidden="true" size={20} />
            </button>

            {menuOpen ? (
              <div
                className="absolute left-0 top-12 z-50 w-72 overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-2 shadow-[var(--shadow)]"
                role="menu"
              >
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onHome)}
                  role="menuitem"
                  type="button"
                >
                  <Home aria-hidden="true" size={17} />
                  Course library
                </button>
                <a className="menu-item" href="/landing" role="menuitem">
                  <FileText aria-hidden="true" size={17} />
                  Landing page
                </a>
                <button
                  className="menu-item"
                  disabled={!course}
                  onClick={() => runMenuAction(onOpenCourseContent)}
                  role="menuitem"
                  type="button"
                >
                  <ListVideo aria-hidden="true" size={17} />
                  Course content
                </button>
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onPickFolder)}
                  role="menuitem"
                  type="button"
                >
                  <FolderOpen aria-hidden="true" size={17} />
                  Select course folder
                </button>
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onToggleTheme)}
                  role="menuitem"
                  type="button"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun aria-hidden="true" size={17} />
                  ) : (
                    <Moon aria-hidden="true" size={17} />
                  )}
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <div className="my-2 h-px bg-[var(--line)]" />
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onExport)}
                  role="menuitem"
                  type="button"
                >
                  <Download aria-hidden="true" size={17} />
                  Export progress
                </button>
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onImport)}
                  role="menuitem"
                  type="button"
                >
                  <Upload aria-hidden="true" size={17} />
                  Import progress
                </button>
                <button
                  className="menu-item"
                  onClick={() => runMenuAction(onSettings)}
                  role="menuitem"
                  type="button"
                >
                  <Settings aria-hidden="true" size={17} />
                  Settings
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)] shadow-sm">
            CV
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">
              CourseVault Player
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
