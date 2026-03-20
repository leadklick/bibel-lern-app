interface Props {
  value: number; // 0-100
  className?: string;
  color?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  value,
  className = '',
  color = 'bg-blue-500',
  showPercent = false,
}: Props) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-blue-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPercent && (
        <span className="text-xs font-semibold text-blue-600 w-10 text-right shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
