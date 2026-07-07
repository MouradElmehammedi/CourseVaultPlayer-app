"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileAudio,
  RotateCcw,
  SkipBack,
  SkipForward,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculatePercent } from "@/lib/progress";
import { formatDuration, formatFileSize, PLAYBACK_RATES } from "@/lib/media-utils";
import type { Lecture } from "@/types/course";
import type { AppSettings } from "@/types/settings";
import type { LectureNote, LectureProgress } from "@/types/progress";

type MediaPlayerProps = {
  lecture: Lecture | null;
  nextLecture: Lecture | null;
  note?: LectureNote;
  previousLecture: Lecture | null;
  progress?: LectureProgress;
  settings: AppSettings;
  onMarkComplete: (lectureId: string) => void;
  onNoteChange: (lectureId: string, content: string) => void;
  onPlayStarted: (lectureId: string) => void;
  onProgressUpdate: (
    lectureId: string,
    patch: Partial<LectureProgress> & { lectureId: string },
  ) => void;
  onSelectLecture: (lectureId: string) => void;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
};

function formatDate(value?: string): string {
  if (!value) {
    return "Not watched yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MediaPlayer({
  lecture,
  nextLecture,
  note,
  previousLecture,
  progress,
  settings,
  onMarkComplete,
  onNoteChange,
  onPlayStarted,
  onProgressUpdate,
  onSelectLecture,
  onSettingsChange,
}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const lastSavedAtRef = useRef(0);
  const playStartedRef = useRef(false);
  const autoplayNextLectureRef = useRef(false);
  const progressRef = useRef(progress);
  const thresholdRef = useRef(settings.autoMarkCompletedAt);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const isUnsupported = lecture?.mediaType === "unsupported";
  const isVideo = lecture?.mediaType === "video";
  const progressPercent = progress?.completed ? 100 : progress?.percent ?? 0;
  const playbackRate = settings.defaultPlaybackRate;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    thresholdRef.current = settings.autoMarkCompletedAt;
  }, [settings.autoMarkCompletedAt]);

  const metadata = useMemo(
    () => [
      ["Section", lecture?.folderPath || "Root files"],
      ["Type", lecture ? `${lecture.extension.toUpperCase()} ${lecture.mediaType}` : ""],
      ["Progress", `${progressPercent}%`],
      ["Duration", formatDuration(progress?.duration)],
      ["Size", lecture ? formatFileSize(lecture.size) : ""],
      ["Last watched", formatDate(progress?.lastPlayedAt)],
    ],
    [lecture, progress?.duration, progress?.lastPlayedAt, progressPercent],
  );

  const persistFromMedia = useCallback(
    (
      options: {
        completed?: boolean;
        manuallyCompleted?: boolean;
        percent?: number;
      } = {},
    ) => {
      const media = mediaRef.current;

      if (!lecture || !media) {
        return;
      }

      const currentProgress = progressRef.current;
      const threshold = thresholdRef.current;
      const duration =
        Number.isFinite(media.duration) && media.duration > 0
          ? media.duration
          : currentProgress?.duration ?? 0;
      const percent =
        options.percent ?? calculatePercent(media.currentTime, duration);
      const completed =
        currentProgress?.completed ||
        options.completed ||
        percent >= threshold;

      onProgressUpdate(lecture.id, {
        lectureId: lecture.id,
        currentTime: media.currentTime,
        duration,
        percent: completed ? Math.max(percent, threshold) : percent,
        completed,
        manuallyCompleted:
          options.manuallyCompleted || currentProgress?.manuallyCompleted || undefined,
        lastPlayedAt: new Date().toISOString(),
      });
    },
    [lecture, onProgressUpdate],
  );

  useEffect(() => {
    let cancelled = false;

    if (!lecture || isUnsupported) {
      queueMicrotask(() => {
        if (!cancelled) {
          autoplayNextLectureRef.current = false;
          setSourceUrl(null);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    const url = URL.createObjectURL(lecture.file);
    queueMicrotask(() => {
      if (!cancelled) {
        setSourceUrl(url);
        setMediaError(null);
        setShowResumePrompt(false);
      }
    });
    lastSavedAtRef.current = 0;
    playStartedRef.current = false;

    return () => {
      cancelled = true;
      persistFromMedia();
      URL.revokeObjectURL(url);
    };
  }, [isUnsupported, lecture, persistFromMedia]);

  useEffect(() => {
    const media = mediaRef.current;

    if (media) {
      media.playbackRate = playbackRate;
    }
  }, [playbackRate, sourceUrl]);

  if (!lecture) {
    return (
      <section className="player-panel grid place-items-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Select a lecture
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Choose a lesson from the course content list.
          </p>
        </div>
      </section>
    );
  }

  const handleLoadedMetadata = () => {
    const media = mediaRef.current;

    if (!media) {
      return;
    }

    media.playbackRate = playbackRate;
    const duration =
      Number.isFinite(media.duration) && media.duration > 0 ? media.duration : 0;

    onProgressUpdate(lecture.id, {
      lectureId: lecture.id,
      duration,
    });

    if (progress?.currentTime && !progress.completed) {
      media.currentTime = Math.min(progress.currentTime, Math.max(0, duration - 2));
    } else if (progress?.completed && progress.currentTime > 0) {
      setShowResumePrompt(true);
    }

    if (autoplayNextLectureRef.current) {
      autoplayNextLectureRef.current = false;
      setShowResumePrompt(false);
      void media.play().catch(() => undefined);
    }
  };

  const handleTimeUpdate = () => {
    const now = Date.now();

    if (now - lastSavedAtRef.current >= 5000) {
      lastSavedAtRef.current = now;
      persistFromMedia();
    }
  };

  const handlePlay = () => {
    if (!playStartedRef.current) {
      playStartedRef.current = true;
      onPlayStarted(lecture.id);
    }
  };

  const handleEnded = () => {
    persistFromMedia({ completed: true, percent: 100 });

    if (settings.autoplayNext && nextLecture) {
      autoplayNextLectureRef.current = true;
      onSelectLecture(nextLecture.id);
    }
  };

  const handleRestart = () => {
    const media = mediaRef.current;

    if (!media) {
      return;
    }

    media.currentTime = 0;
    setShowResumePrompt(false);
    onProgressUpdate(lecture.id, {
      lectureId: lecture.id,
      currentTime: 0,
      percent: progress?.completed ? 100 : 0,
      completed: progress?.completed ?? false,
      lastPlayedAt: new Date().toISOString(),
    });
    void media.play().catch(() => undefined);
  };

  const handleManualComplete = () => {
    persistFromMedia({ completed: true, manuallyCompleted: true, percent: 100 });
    onMarkComplete(lecture.id);
  };

  const handleSpeedChange = (rate: number) => {
    onSettingsChange({ defaultPlaybackRate: rate });

    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
    }
  };

  return (
    <section className="player-panel">
      <div className="player-stage">
        {isUnsupported ? (
          <div className="grid min-h-[320px] place-items-center p-8 text-center text-white">
            <div className="max-w-lg">
              <AlertTriangle aria-hidden="true" className="mx-auto mb-4" size={42} />
              <h1 className="text-2xl font-semibold">
                This file type may not be supported by your browser.
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Try opening it in VLC or convert it to MP4 or MP3.
              </p>
            </div>
          </div>
        ) : isVideo ? (
          <video
            className="h-full w-full bg-black"
            controls
            onEnded={handleEnded}
            onError={() =>
              setMediaError(
                "This media file could not be played. The format or codec may not be supported by your browser.",
              )
            }
            onLoadedMetadata={handleLoadedMetadata}
            onPause={() => persistFromMedia()}
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={sourceUrl ?? undefined}
          />
        ) : (
          <div className="grid min-h-[320px] place-items-center p-6">
            <div className="w-full max-w-2xl text-center text-white">
              <FileAudio aria-hidden="true" className="mx-auto mb-5" size={54} />
              <h1 className="text-2xl font-semibold">{lecture.title}</h1>
              <p className="mt-2 text-sm text-white/65">{lecture.fileName}</p>
              <audio
                className="mt-8 w-full"
                controls
                onEnded={handleEnded}
                onError={() =>
                  setMediaError(
                    "This media file could not be played. The format or codec may not be supported by your browser.",
                  )
                }
                onLoadedMetadata={handleLoadedMetadata}
                onPause={() => persistFromMedia()}
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={sourceUrl ?? undefined}
              />
            </div>
          </div>
        )}

        {showResumePrompt && !isUnsupported ? (
          <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/15 bg-black/70 p-4 text-white backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                You watched {progress?.percent ?? 0}% of this lecture.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  onClick={() => {
                    const media = mediaRef.current;

                    if (media && progress?.currentTime) {
                      media.currentTime = progress.currentTime;
                    }

                    setShowResumePrompt(false);
                  }}
                  type="button"
                >
                  Resume
                </button>
                <button
                  className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    setShowResumePrompt(false);
                    handleRestart();
                  }}
                  type="button"
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {mediaError ? (
        <div className="danger-alert border-x-0 border-t-0 px-5 py-3 text-sm">
          {mediaError}
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-bold uppercase tracking-normal text-[var(--primary)]">
              {lecture.mediaType === "video" ? (
                <Video aria-hidden="true" size={14} />
              ) : lecture.mediaType === "audio" ? (
                <FileAudio aria-hidden="true" size={14} />
              ) : (
                <AlertTriangle aria-hidden="true" size={14} />
              )}
              {lecture.mediaType}
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-[var(--text)]">
              {lecture.title}
            </h1>
            <p className="mt-2 break-words text-sm text-[var(--muted)]">
              {lecture.relativePath}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-secondary"
              disabled={!previousLecture}
              onClick={() => previousLecture && onSelectLecture(previousLecture.id)}
              type="button"
            >
              <SkipBack aria-hidden="true" size={17} />
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={!nextLecture}
              onClick={() => nextLecture && onSelectLecture(nextLecture.id)}
              type="button"
            >
              <SkipForward aria-hidden="true" size={17} />
              Next
            </button>
            <button className="btn-secondary" onClick={handleRestart} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Restart
            </button>
            <button className="btn-primary" onClick={handleManualComplete} type="button">
              <CheckCircle2 aria-hidden="true" size={17} />
              Mark Complete
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metadata.map(([label, value]) => (
            <div className="metadata-cell" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-[var(--line)] bg-[var(--bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
            Playback speed
            <select
              className="field h-10 min-w-28"
              onChange={(event) => handleSpeedChange(Number(event.target.value))}
              value={playbackRate}
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-[var(--muted)]">
            Auto-completes at {settings.autoMarkCompletedAt}% watched.
          </p>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-[var(--text)]">
            My Notes
          </span>
          <textarea
            className="field min-h-32 resize-y p-4 leading-6"
            onChange={(event) => onNoteChange(lecture.id, event.target.value)}
            placeholder="Write notes for this lecture..."
            value={note?.content ?? ""}
          />
        </label>
      </div>
    </section>
  );
}
