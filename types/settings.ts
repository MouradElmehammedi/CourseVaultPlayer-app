export type AppSettings = {
  sidebarPosition: "right" | "left";
  autoplayNext: boolean;
  autoMarkCompletedAt: number;
  defaultPlaybackRate: number;
  pomodoroMinutes: number;
  theme: "light" | "dark" | "system";
  compactSidebar: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  sidebarPosition: "right",
  autoplayNext: false,
  autoMarkCompletedAt: 90,
  defaultPlaybackRate: 1,
  pomodoroMinutes: 25,
  theme: "light",
  compactSidebar: false,
};
