import { Verse } from '@/lib/types';
import { isMastered } from '@/lib/sm2';

interface Props {
  verse: Verse;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function VerseCard({ verse, onDelete, compact = false }: Props) {
  const mastered = isMastered(verse);
  const successRate =
    verse.reviewCount > 0
      ? Math.round((verse.successCount / verse.reviewCount) * 100)
      : null;

  const nextReviewDate = new Date(verse.nextReview).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 md:p-5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="font-semibold text-blue-800 text-base">{verse.reference}</span>
          {mastered && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Gemeistert
            </span>
          )}
          {verse.translation && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium border border-indigo-100">
              {verse.translation}
            </span>
          )}
          {verse.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(verse.id)}
            className="text-red-400 hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 text-lg"
            aria-label="Vers löschen"
          >
            ✕
          </button>
        )}
      </div>

      {!compact && (
        <p className="text-gray-700 text-sm md:text-base leading-relaxed">{verse.text}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
        <span>Wiederholt: {verse.reviewCount}×</span>
        {successRate !== null && <span>Erfolgsrate: {successRate}%</span>}
        <span>Nächste Wdh.: {nextReviewDate}</span>
      </div>
    </div>
  );
}
