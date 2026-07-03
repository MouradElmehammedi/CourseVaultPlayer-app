"use client";

import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  open,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]"
        role="dialog"
      >
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
            <AlertTriangle aria-hidden="true" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
