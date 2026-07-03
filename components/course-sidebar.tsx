"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  FileAudio,
  PlayCircle,
  Search,
  Video,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { formatDuration } from "@/lib/media-utils";
import { getCourseCompletion } from "@/lib/progress";
import type { Course, CourseSection, Lecture } from "@/types/course";
import type { CourseProgress } from "@/types/progress";
import { ProgressBar } from "./progress-bar";

type CourseSidebarProps = {
  activeLectureId: string | null;
  compact: boolean;
  course: Course;
  courseProgress?: CourseProgress;
  expandedSections: Record<string, boolean>;
  mobile?: boolean;
  searchQuery: string;
  onCloseMobile?: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectLecture: (lectureId: string) => void;
  onToggleSection: (sectionId: string) => void;
};

function matchesLecture(lecture: Lecture, query: string): boolean {
  const searchTarget = [
    lecture.title,
    lecture.fileName,
    lecture.folderPath,
    lecture.extension,
    lecture.mediaType,
  ]
    .join(" ")
    .toLowerCase();

  return searchTarget.includes(query);
}

function filterSection(
  section: CourseSection,
  query: string,
): CourseSection | null {
  if (!query) {
    return section;
  }

  const sectionMatches = `${section.title} ${section.path}`
    .toLowerCase()
    .includes(query);

  const lectures = section.lectures.filter((lecture) =>
    sectionMatches ? true : matchesLecture(lecture, query),
  );
  const children = section.children
    .map((child) => filterSection(child, query))
    .filter((child): child is CourseSection => Boolean(child));

  if (lectures.length === 0 && children.length === 0) {
    return null;
  }

  return {
    ...section,
    lectures,
    children,
  };
}

function StatusIcon({
  active,
  completed,
  inProgress,
}: {
  active: boolean;
  completed: boolean;
  inProgress: boolean;
}) {
  if (active) {
    return <PlayCircle aria-hidden="true" className="text-[var(--primary)]" size={17} />;
  }

  if (completed) {
    return <CheckCircle2 aria-hidden="true" className="text-[var(--success)]" size={17} />;
  }

  if (inProgress) {
    return <Clock3 aria-hidden="true" className="text-[var(--warning)]" size={17} />;
  }

  return <Circle aria-hidden="true" className="text-[var(--muted)]" size={15} />;
}

function LectureRow({
  active,
  compact,
  lecture,
  onSelectLecture,
  progress,
}: {
  active: boolean;
  compact: boolean;
  lecture: Lecture;
  onSelectLecture: (lectureId: string) => void;
  progress?: CourseProgress["lectures"][string];
}) {
  const percent = progress?.percent ?? 0;
  const completed = Boolean(progress?.completed);
  const inProgress = percent > 0 && !completed;
  const mediaIcon =
    lecture.mediaType === "audio" ? (
      <FileAudio aria-hidden="true" size={13} />
    ) : lecture.mediaType === "video" ? (
      <Video aria-hidden="true" size={13} />
    ) : (
      <AlertTriangle aria-hidden="true" size={13} />
    );

  return (
    <button
      aria-current={active ? "true" : undefined}
      className={`lecture-row ${active ? "lecture-row-active" : ""} ${
        compact ? "py-2" : "py-3"
      }`}
      onClick={() => onSelectLecture(lecture.id)}
      type="button"
    >
      <span className="mt-0.5 shrink-0">
        <StatusIcon active={active} completed={completed} inProgress={inProgress} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-left text-sm font-semibold leading-5 text-[var(--text)]">
          {lecture.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1">
            {mediaIcon}
            {lecture.extension.toUpperCase() || lecture.mediaType.toUpperCase()}
          </span>
          {progress?.duration ? <span>{formatDuration(progress.duration)}</span> : null}
          {lecture.mediaType === "unsupported" ? (
            <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 font-semibold text-[var(--warning)]">
              May not play
            </span>
          ) : null}
        </span>
        {percent > 0 ? (
          <span className="mt-2 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
              <span
                className="block h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </span>
            <span className="text-[11px] font-semibold text-[var(--muted)]">
              {completed ? "Done" : `${percent}%`}
            </span>
          </span>
        ) : null}
      </span>
    </button>
  );
}

function SectionAccordion({
  activeLectureId,
  compact,
  courseProgress,
  expandedSections,
  forceOpen,
  level = 0,
  section,
  onSelectLecture,
  onToggleSection,
}: {
  activeLectureId: string | null;
  compact: boolean;
  courseProgress?: CourseProgress;
  expandedSections: Record<string, boolean>;
  forceOpen: boolean;
  level?: number;
  section: CourseSection;
  onSelectLecture: (lectureId: string) => void;
  onToggleSection: (sectionId: string) => void;
}) {
  const isOpen = forceOpen || (expandedSections[section.id] ?? section.isOpen);
  const totalLectures =
    section.lectures.length +
    section.children.reduce((count, child) => count + child.lectures.length, 0);

  return (
    <div className={level === 0 ? "border-b border-[var(--line)] last:border-b-0" : ""}>
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[var(--soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
        onClick={() => onToggleSection(section.id)}
        type="button"
      >
        {isOpen ? (
          <ChevronDown aria-hidden="true" size={17} />
        ) : (
          <ChevronRight aria-hidden="true" size={17} />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--text)]">
            {section.title}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {totalLectures} {totalLectures === 1 ? "lecture" : "lectures"}
          </span>
        </span>
      </button>

      {isOpen ? (
        <div className={level > 0 ? "border-l border-[var(--line)] pl-3" : ""}>
          {section.lectures.map((lecture) => (
            <LectureRow
              active={lecture.id === activeLectureId}
              compact={compact}
              key={lecture.id}
              lecture={lecture}
              onSelectLecture={onSelectLecture}
              progress={courseProgress?.lectures[lecture.id]}
            />
          ))}
          {section.children.map((child) => (
            <SectionAccordion
              activeLectureId={activeLectureId}
              compact={compact}
              courseProgress={courseProgress}
              expandedSections={expandedSections}
              forceOpen={forceOpen}
              key={child.id}
              level={level + 1}
              onSelectLecture={onSelectLecture}
              onToggleSection={onToggleSection}
              section={child}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CourseSidebar({
  activeLectureId,
  compact,
  course,
  courseProgress,
  expandedSections,
  mobile = false,
  searchQuery,
  onCloseMobile,
  onSearchQueryChange,
  onSelectLecture,
  onToggleSection,
}: CourseSidebarProps) {
  const completion = getCourseCompletion(course, courseProgress);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sections = useMemo(
    () =>
      course.sections
        .map((section) => filterSection(section, normalizedQuery))
        .filter((section): section is CourseSection => Boolean(section)),
    [course.sections, normalizedQuery],
  );

  return (
    <aside
      className={`course-sidebar ${mobile ? "h-full w-full" : "hidden lg:flex"}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Course Content</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {completion.completedLectures} / {completion.totalLectures} completed
          </p>
        </div>
        {mobile ? (
          <button
            aria-label="Close course content"
            className="icon-button"
            onClick={onCloseMobile}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        ) : null}
      </div>

      <div className="border-b border-[var(--line)] p-4">
        <div className="mb-4 flex items-center gap-3">
          <ProgressBar
            className="flex-1"
            label="Course completion"
            value={completion.percent}
          />
          <span className="text-sm font-bold text-[var(--text)]">
            {completion.percent}%
          </span>
        </div>
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            size={17}
          />
          <input
            className="field h-11 pl-10"
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search lectures..."
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {sections.length > 0 ? (
          sections.map((section) => (
            <SectionAccordion
              activeLectureId={activeLectureId}
              compact={compact}
              courseProgress={courseProgress}
              expandedSections={expandedSections}
              forceOpen={Boolean(normalizedQuery)}
              key={section.id}
              onSelectLecture={onSelectLecture}
              onToggleSection={onToggleSection}
              section={section}
            />
          ))
        ) : (
          <div className="p-6 text-sm leading-6 text-[var(--muted)]">
            No lectures match your search.
          </div>
        )}
      </div>
    </aside>
  );
}
