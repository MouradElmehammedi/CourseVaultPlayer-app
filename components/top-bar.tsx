"use client";

import { useEffect, useRef, useState } from "react";
import {
  FolderOpen,
  Home,
  ListVideo,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Timer,
} from "lucide-react";
import type { Course } from "@/types/course";

type TopBarProps = {
  course: Course | null;
  completionPercent: number;
  courseContentVisible: boolean;
  pomodoroMinutes: number;
  onHome: () => void;
  onPickFolder: () => void;
  onSettings: () => void;
  onToggleCourseContent: () => void;
};

type PomodoroTimerProps = {
  minutes: number;
  totalSeconds: number;
};

type PomodoroMode = "focus" | "break";

type PomodoroTimerState = {
  mode: PomodoroMode;
  running: boolean;
  seconds: number;
};

const POMODORO_BREAK_SECONDS = 5 * 60;
const FOCUS_END_SOUND_SRC = "/sounds/cute_sound.mp3";
const BREAK_END_SOUND_SRC = "/sounds/ding_ding_ding_ding.mp3";

function getPomodoroSeconds(minutes: number): number {
  const normalizedMinutes = Number.isFinite(minutes)
    ? Math.min(180, Math.max(1, Math.round(minutes)))
    : 25;

  return normalizedMinutes * 60;
}

function formatPomodoro(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function playTimerSound(audio: HTMLAudioElement | null) {
  if (!audio) {
    return;
  }

  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

function PomodoroTimer({ minutes, totalSeconds }: PomodoroTimerProps) {
  const focusEndAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakEndAudioRef = useRef<HTMLAudioElement | null>(null);
  const previousTimerRef = useRef<PomodoroTimerState | null>(null);
  const [timer, setTimer] = useState<PomodoroTimerState>({
    mode: "focus",
    running: false,
    seconds: totalSeconds,
  });
  const isAtFocusStart =
    timer.mode === "focus" && !timer.running && timer.seconds === totalSeconds;
  const modeLabel = timer.mode === "focus" ? "Focus" : "Break";

  useEffect(() => {
    if (!timer.running) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimer((current) => {
        if (!current.running) {
          return current;
        }

        const nextSeconds = Math.max(current.seconds - 1, 0);

        if (nextSeconds === 0 && current.mode === "focus") {
          return {
            mode: "break",
            running: true,
            seconds: POMODORO_BREAK_SECONDS,
          };
        }

        if (nextSeconds === 0) {
          return {
            mode: "focus",
            running: false,
            seconds: totalSeconds,
          };
        }

        return {
          ...current,
          seconds: nextSeconds,
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer.running, totalSeconds]);

  useEffect(() => {
    const previousTimer = previousTimerRef.current;

    if (
      previousTimer?.mode === "focus" &&
      previousTimer.running &&
      previousTimer.seconds === 1 &&
      timer.mode === "break"
    ) {
      playTimerSound(focusEndAudioRef.current);
    }

    if (
      previousTimer?.mode === "break" &&
      previousTimer.running &&
      previousTimer.seconds === 1 &&
      timer.mode === "focus" &&
      !timer.running
    ) {
      playTimerSound(breakEndAudioRef.current);
    }

    previousTimerRef.current = timer;
  }, [timer]);

  const togglePomodoro = () => {
    setTimer((current) => {
      return {
        ...current,
        running: !current.running,
      };
    });
  };

  const resetPomodoro = () => {
    setTimer({
      mode: "focus",
      running: false,
      seconds: totalSeconds,
    });
  };

  return (
    <div
      className="pomodoro-control"
      title={`Pomodoro: ${Math.round(minutes)} minute focus, 5 minute break`}
    >
      <audio preload="auto" ref={focusEndAudioRef} src={FOCUS_END_SOUND_SRC} />
      <audio preload="auto" ref={breakEndAudioRef} src={BREAK_END_SOUND_SRC} />
      <button
        aria-label={
          timer.running
            ? `Pause ${modeLabel.toLowerCase()} timer`
            : `Start ${modeLabel.toLowerCase()} timer`
        }
        className={`pomodoro-pill ${timer.running ? "pomodoro-running" : ""} ${
          timer.mode === "break" ? "pomodoro-break" : ""
        }`}
        onClick={togglePomodoro}
        type="button"
      >
        <Timer aria-hidden="true" size={16} />
        <span className="pomodoro-time-group">
          <span className="pomodoro-time">{formatPomodoro(timer.seconds)}</span>
          <span className="pomodoro-mode">{modeLabel}</span>
        </span>
        {timer.running ? (
          <Pause
            aria-hidden="true"
            className="pomodoro-state-icon"
            size={15}
          />
        ) : (
          <Play
            aria-hidden="true"
            className="pomodoro-state-icon"
            size={15}
          />
        )}
      </button>
      <button
        aria-label="Reset Pomodoro timer"
        className="pomodoro-reset"
        disabled={isAtFocusStart}
        onClick={resetPomodoro}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={15} />
      </button>
    </div>
  );
}

export function TopBar({
  course,
  completionPercent,
  courseContentVisible,
  pomodoroMinutes,
  onHome,
  onPickFolder,
  onSettings,
  onToggleCourseContent,
}: TopBarProps) {
  const pomodoroTotalSeconds = getPomodoroSeconds(pomodoroMinutes);

  return (
    <header className="app-header sticky top-0 z-30 border-b border-[var(--line)] backdrop-blur-xl">
      <div className="app-topbar-inner flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="app-brand-mark" aria-hidden="true">
            <span className="brand-bracket">[</span>
            <span className="brand-signal" />
            <span className="brand-bracket">]</span>
          </div>
          <div className="app-brand-copy min-w-0">
            <p className="app-brand-name text-sm font-semibold text-[var(--text)]">
              LEARNVAULT
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {course ? course.name : "Private study workspace"}
            </p>
          </div>
        </div>

        {course ? (
          <div className="topbar-progress hidden min-w-[170px] items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 md:flex">
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
          {course ? (
            <button
              aria-label={
                courseContentVisible
                  ? "Hide course content and expand player"
                  : "Show course content"
              }
              aria-pressed={courseContentVisible}
              className="icon-button"
              onClick={onToggleCourseContent}
              title={
                courseContentVisible
                  ? "Hide course content"
                  : "Show course content"
              }
              type="button"
            >
              <ListVideo aria-hidden="true" size={18} />
            </button>
          ) : null}
          <PomodoroTimer
            key={pomodoroTotalSeconds}
            minutes={pomodoroMinutes}
            totalSeconds={pomodoroTotalSeconds}
          />
          <button
            className="btn-secondary topbar-folder-action hidden sm:inline-flex"
            onClick={onPickFolder}
            type="button"
          >
            <FolderOpen aria-hidden="true" size={17} />
            Add course
          </button>
          <button
            aria-label="Select new folder"
            className="icon-button topbar-folder-mobile sm:hidden"
            onClick={onPickFolder}
            type="button"
          >
            <FolderOpen aria-hidden="true" size={18} />
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
