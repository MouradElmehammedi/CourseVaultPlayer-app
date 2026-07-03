type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalizedValue}
      className={`h-2 overflow-hidden rounded-full bg-[var(--line)] ${className}`}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}
