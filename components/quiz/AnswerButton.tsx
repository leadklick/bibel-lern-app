'use client';

const ANSWER_CONFIG = [
  { label: 'A', shape: '▲', bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-700' },
  { label: 'B', shape: '◆', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-700' },
  { label: 'C', shape: '●', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', border: 'border-yellow-600' },
  { label: 'D', shape: '■', bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-700' },
];

interface AnswerButtonProps {
  label: string;
  index: 0 | 1 | 2 | 3;
  selected?: boolean;
  correct?: boolean; // the correct answer index revealed
  revealed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function AnswerButton({
  label,
  index,
  selected = false,
  correct = false,
  revealed = false,
  disabled = false,
  onClick,
}: AnswerButtonProps) {
  const config = ANSWER_CONFIG[index];

  let bgClass = `${config.bg} ${!disabled ? config.hover : ''}`;
  let opacity = '';
  let ring = '';

  if (revealed) {
    if (correct) {
      bgClass = 'bg-green-500';
      ring = 'ring-4 ring-green-300';
    } else if (selected && !correct) {
      bgClass = 'bg-red-600';
      ring = 'ring-4 ring-red-300';
    } else {
      opacity = 'opacity-50';
    }
  } else if (selected) {
    ring = 'ring-4 ring-white ring-opacity-60';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center gap-3 w-full rounded-2xl px-4 py-4 text-white font-bold text-base md:text-lg
        border-b-4 ${config.border} transition-all duration-150
        ${bgClass} ${opacity} ${ring}
        ${!disabled ? 'active:scale-[0.97] active:border-b-2 active:translate-y-0.5 cursor-pointer' : 'cursor-default'}
        shadow-md
      `}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-black bg-opacity-20 text-lg shrink-0">
        {config.shape}
      </span>
      <span className="flex-1 text-left leading-snug">{label}</span>
      {revealed && correct && (
        <span className="text-2xl shrink-0">✓</span>
      )}
      {revealed && selected && !correct && (
        <span className="text-2xl shrink-0">✗</span>
      )}
    </button>
  );
}
