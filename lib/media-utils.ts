import type { MediaType } from "@/types/course";

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov"]);
const UNSUPPORTED_MEDIA_EXTENSIONS = new Set([
  "avi",
  "flv",
  "mkv",
  "mpeg",
  "mpg",
  "wmv",
]);

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

export function detectMediaType(file: File): MediaType | null {
  const extension = getFileExtension(file.name);

  if (extension === "ogg") {
    if (file.type.startsWith("video")) {
      return "video";
    }

    return "audio";
  }

  if (AUDIO_EXTENSIONS.has(extension)) {
    return "audio";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  if (UNSUPPORTED_MEDIA_EXTENSIONS.has(extension)) {
    return "unsupported";
  }

  return null;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const rounded = Math.floor(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainingSeconds = rounded % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function cleanLectureTitle(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/^[\s._-]*\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
