'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDueVerses, getVerses, updateVerse, recordStudySession } from '@/lib/storage';
import { applyReview } from '@/lib/sm2';
import { Verse } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';

type Phase = 'front' | 'back' | 'rate' | 'done';

export default function FlashcardPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('front');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const due = getDueVerses();
    const all = getVerses();
    // If nothing due, use all verses so user can still practice
    setQueue(due.length > 0 ? due : all);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-blue-400 animate-pulse">Lädt…</span>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <EmptyState onBack={() => router.push('/learn')} />
    );
  }

  if (phase === 'done') {
    return <DoneState onBack={() => router.push('/learn')} />;
  }

  const verse = queue[index];
  const progress = (index / queue.length) * 100;

  const handleFlip = () => setPhase('back');

  const handleRate = (rating: number) => {
    const updated = applyReview(verse, rating);
    updateVerse(updated);
    recordStudySession();

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setPhase('front');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/learn')}
          className="text-blue-500 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center"
        >
          ← Zurück
        </button>
        <span className="text-blue-500 text-sm font-medium">
          {index + 1} / {queue.length}
        </span>
      </div>

      <ProgressBar value={progress} />

      {/* Card */}
      <div className="min-h-[300px] md:min-h-[320px] bg-white rounded-2xl border border-blue-100 shadow-md p-6 md:p-8 flex flex-col items-center justify-center text-center gap-5">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-medium">
          {phase === 'front' ? 'Bibelstelle' : 'Vers'}
        </p>

        <p className="text-2xl md:text-3xl font-bold text-blue-900 leading-snug">{verse.reference}</p>

        {phase !== 'front' && (
          <p className="text-gray-700 leading-relaxed text-base md:text-lg max-w-xl">
            {verse.text}
          </p>
        )}

        {verse.tags.length > 0 && phase !== 'front' && (
          <div className="flex gap-2 flex-wrap justify-center">
            {verse.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {phase === 'front' && (
        <button
          onClick={handleFlip}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[56px]"
        >
          Aufdecken
        </button>
      )}

      {phase === 'back' && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-blue-700 font-medium text-sm">
            Wie gut hast du den Vers gewusst?
          </p>
          <RatingButtons onRate={handleRate} />
        </div>
      )}
    </div>
  );
}

function RatingButtons({ onRate }: { onRate: (r: number) => void }) {
  const options = [
    { value: 1, label: 'Gar nicht', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { value: 2, label: 'Kaum', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { value: 3, label: 'Mit Mühe', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 4, label: 'Gut', color: 'bg-lime-100 text-lime-700 hover:bg-lime-200' },
    { value: 5, label: 'Perfekt', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => onRate(value)}
          className={`${color} rounded-xl py-3 md:py-4 text-xs font-semibold transition-colors flex flex-col items-center gap-1 min-h-[64px]`}
        >
          <span className="text-lg md:text-xl font-bold">{value}</span>
          <span className="leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">📖</p>
      <p className="text-blue-800 font-semibold text-xl mb-2">Keine Verse vorhanden</p>
      <p className="text-blue-500 text-sm mb-6">Füge zuerst Verse hinzu.</p>
      <button
        onClick={onBack}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors min-h-[48px]"
      >
        Zurück
      </button>
    </div>
  );
}

function DoneState({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🎉</p>
      <p className="text-blue-800 font-semibold text-xl mb-2">Session abgeschlossen!</p>
      <p className="text-blue-500 text-sm mb-6">
        Gut gemacht! Deine Fortschritte wurden gespeichert.
      </p>
      <button
        onClick={onBack}
        className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base min-h-[56px]"
      >
        Zurück zum Menü
      </button>
    </div>
  );
}
