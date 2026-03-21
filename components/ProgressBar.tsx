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
          className="h-2.5 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)',
          }}
        >
          {pct > 5 && (
            <span className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }} />
          )}
        </div>
      </div>
      {showPercent && (
        <span className="text-xs font-semibold text-blue-600 w-10 text-right shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
