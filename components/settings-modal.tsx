"use client";

import { Download, Settings, Timer, Trash2, Upload, X } from "lucide-react";
import type { AppSettings } from "@/types/settings";
import { PLAYBACK_RATES } from "@/lib/media-utils";

type SettingsModalProps = {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
  onClearCourse: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  hasCourse: boolean;
};

export function SettingsModal({
  open,
  settings,
  onClose,
  onExport,
  onImport,
  onClearAll,
  onClearCourse,
  onUpdateSettings,
  hasCourse,
}: SettingsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--soft)] text-[var(--primary)]">
              <Settings aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">
                Settings
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Playback, layout, and local progress data.
              </p>
            </div>
          </div>
          <button
            aria-label="Close settings"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <section className="settings-section">
            <h3 className="settings-title">Playback</h3>
            <label className="switch-row">
              <span>
                <span className="switch-label">Autoplay next lecture</span>
                <span className="switch-help">
                  Start the next item after a lecture ends.
                </span>
              </span>
              <input
                checked={settings.autoplayNext}
                onChange={(event) =>
                  onUpdateSettings({ autoplayNext: event.target.checked })
                }
                type="checkbox"
              />
            </label>

            <label className="field-label">
              Default playback speed
              <select
                className="field"
                onChange={(event) =>
                  onUpdateSettings({
                    defaultPlaybackRate: Number(event.target.value),
                  })
                }
                value={settings.defaultPlaybackRate}
              >
                {PLAYBACK_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Auto-complete threshold
              <input
                className="field"
                max={100}
                min={50}
                onChange={(event) =>
                  onUpdateSettings({
                    autoMarkCompletedAt: Number(event.target.value),
                  })
                }
                step={5}
                type="number"
                value={settings.autoMarkCompletedAt}
              />
            </label>
          </section>

          <section className="settings-section">
            <h3 className="settings-title">Layout</h3>
            <label className="field-label">
              Theme
              <select
                className="field"
                onChange={(event) =>
                  onUpdateSettings({
                    theme: event.target.value as AppSettings["theme"],
                  })
                }
                value={settings.theme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>

            <label className="field-label">
              Sidebar position
              <select
                className="field"
                onChange={(event) =>
                  onUpdateSettings({
                    sidebarPosition: event.target.value as "right" | "left",
                  })
                }
                value={settings.sidebarPosition}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </label>

            <label className="switch-row">
              <span>
                <span className="switch-label">Compact sidebar</span>
                <span className="switch-help">
                  Reduce spacing in long course lists.
                </span>
              </span>
              <input
                checked={settings.compactSidebar}
                onChange={(event) =>
                  onUpdateSettings({ compactSidebar: event.target.checked })
                }
                type="checkbox"
              />
            </label>
          </section>

          <section className="settings-section sm:col-span-2">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--soft)] text-[var(--primary)]">
                <Timer aria-hidden="true" size={18} />
              </span>
              <h3 className="settings-title mb-0">Pomodoro Timer</h3>
            </div>

            <label className="field-label">
              Focus length in minutes
              <input
                className="field"
                max={180}
                min={1}
                onChange={(event) =>
                  onUpdateSettings({
                    pomodoroMinutes: Number(event.target.value),
                  })
                }
                step={1}
                type="number"
                value={settings.pomodoroMinutes}
              />
              <span className="switch-help">
                Break length is fixed at 5 minutes.
              </span>
            </label>
          </section>

          <section className="settings-section sm:col-span-2">
            <h3 className="settings-title">Data</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="btn-secondary justify-start" onClick={onExport} type="button">
                <Download aria-hidden="true" size={17} />
                Export progress
              </button>
              <button className="btn-secondary justify-start" onClick={onImport} type="button">
                <Upload aria-hidden="true" size={17} />
                Import progress
              </button>
              <button
                className="btn-secondary justify-start"
                disabled={!hasCourse}
                onClick={onClearCourse}
                type="button"
              >
                <Trash2 aria-hidden="true" size={17} />
                Clear course progress
              </button>
              <button className="btn-danger justify-start" onClick={onClearAll} type="button">
                <Trash2 aria-hidden="true" size={17} />
                Clear all data
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
