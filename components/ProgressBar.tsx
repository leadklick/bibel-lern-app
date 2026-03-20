interface Props {
  value: number; // 0-100
  className?: string;
  color?: string;
}

export default function ProgressBar({
  value,
  className = '',
  color = 'bg-blue-500',
}: Props) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-blue-100 rounded-full h-2.5 ${className}`}>
      <div
        className={`${color} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
