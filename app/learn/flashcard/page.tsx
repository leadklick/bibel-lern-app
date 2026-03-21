'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNextVerses, getVerses, updateVerse, recordStudySession, markSessionSeen } from "@/lib/storage";;
import { applyReview } from '@/lib/sm2';
import { Verse } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';
import Confetti from '@/components/Confetti';

type Phase = 'front' | 'back' | 'done';

interface SessionResult {
  total: number;
  known: number;
  almost: number;
  unknown: number;
}

export default function FlashcardPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('front');
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult>({
    total: 0,
    known: 0,
    almost: 0,
    unknown: 0,
  });

  useEffect(() => {
    
    
    setQueue(getNextVerses().length > 0 ? getNextVerses() : getVerses());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-5 page-enter">
        <div className="skeleton h-10 rounded-xl" />
        <div className="skeleton h-3 rounded-full" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-14 rounded-xl" />
      </div>
    );
  }

  if (queue.length === 0) {
    return <EmptyState onBack={() => router.push('/learn')} />;
  }

  if (phase === 'done') {
    return (
      <SummaryScreen
        result={sessionResult}
        onBack={() => router.push('/learn')}
        onAgain={() => {
          
          
          setQueue(getNextVerses().length > 0 ? getNextVerses() : getVerses());
          setIndex(0);
          setPhase('front');
          setFlipped(false);
          setSessionResult({ total: 0, known: 0, almost: 0, unknown: 0 });
        }}
      />
    );
  }

  const verse = queue[index];
  const progress = (index / queue.length) * 100;

  const handleFlip = () => {
    setFlipped(true);
    setTimeout(() => setPhase('back'), 280);
  };

  const handleRate = (rating: number) => {
    const updated = applyReview(verse, rating);
    updateVerse(updated);
    recordStudySession();
    markSessionSeen(verse.id);

    const ratingLabel = rating >= 5 ? 'known' : rating >= 3 ? 'almost' : 'unknown';
    setSessionResult((prev) => ({
      total: prev.total + 1,
      known: prev.known + (ratingLabel === 'known' ? 1 : 0),
      almost: prev.almost + (ratingLabel === 'almost' ? 1 : 0),
      unknown: prev.unknown + (ratingLabel === 'unknown' ? 1 : 0),
    }));

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setFlipped(false);
      setTimeout(() => setPhase('front'), 10);
    }
  };

  const handleSkip = () => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setFlipped(false);
      setTimeout(() => setPhase('front'), 10);
    }
  };

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/learn')}
          className="text-blue-500 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center"
        >
          ← Zurück
        </button>
        <div className="flex items-center gap-3">
          {phase === 'front' && (
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors min-h-[44px] flex items-center px-2"
            >
              Überspringen →
            </button>
          )}
          <span className="text-blue-500 text-sm font-medium">
            {index + 1} / {queue.length}
          </span>
        </div>
      </div>

      <ProgressBar value={progress} showPercent />

      {/* Flip Card */}
      <div className="flip-card-scene" style={{ minHeight: '300px' }}>
        <div className={`flip-card ${flipped ? 'flipped' : ''}`} style={{ minHeight: '300px' }}>
          {/* Front face */}
          <div className="flip-card-face bg-white rounded-2xl border border-blue-100 shadow-md p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-xs text-blue-400 uppercase tracking-widest font-medium">
              Bibelstelle
            </p>
            <p className="text-2xl md:text-3xl font-bold text-blue-900 leading-snug">
              {verse.reference}
            </p>
            {verse.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {verse.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 text-blue-500 px-3 py-1 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-blue-300 text-sm mt-2">Tippe auf &ldquo;Aufdecken&rdquo;</p>
          </div>

          {/* Back face */}
          <div className="flip-card-face flip-card-back bg-white rounded-2xl border border-blue-200 shadow-md p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-xs text-blue-400 uppercase tracking-widest font-medium">
              Vers
            </p>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg max-w-xl">
              {verse.text}
            </p>
            <p className="text-xs text-blue-400 font-medium">{verse.reference}</p>
            {verse.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {verse.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 text-blue-500 px-3 py-1 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {phase === 'front' && (
        <button
          onClick={handleFlip}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[56px] active:scale-[0.98]"
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
    { value: 1, emoji: '❌', label: 'Nicht gewusst', color: 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300' },
    { value: 3, emoji: '😐', label: 'Fast', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300' },
    { value: 5, emoji: '✅', label: 'Gewusst', color: 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ value, emoji, label, color }) => (
        <button
          key={value}
          onClick={() => onRate(value)}
          className={`${color} rounded-xl py-4 font-semibold transition-colors flex flex-col items-center gap-2 min-h-[80px] active:scale-95`}
        >
          <span className="text-3xl">{emoji}</span>
          <span className="text-sm leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center py-20 page-enter">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
        📖
      </div>
      <p className="text-blue-800 font-bold text-xl mb-2">Keine Verse vorhanden</p>
      <p className="text-blue-500 text-sm mb-6">Füge zuerst Verse hinzu, um zu lernen.</p>
      <button
        onClick={onBack}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors min-h-[48px]"
      >
        Zurück zum Menü
      </button>
    </div>
  );
}

function SummaryScreen({
  result,
  onBack,
  onAgain,
}: {
  result: SessionResult;
  onBack: () => void;
  onAgain: () => void;
}) {
  const allKnown = result.unknown === 0 && result.almost === 0;
  const mostlyKnown = result.known / result.total >= 0.7;

  const motivational = allKnown
    ? 'Perfekt! Alle Verse gewusst – du bist auf einem guten Weg!'
    : mostlyKnown
    ? 'Sehr gut! Du kennst die meisten Verse bereits ausgezeichnet.'
    : 'Gut geübt! Regelmäßiges Wiederholen bringt dich ans Ziel.';

  return (
    <div className="flex flex-col gap-6 page-enter text-center">
      {allKnown && <Confetti />}

      <div>
        <p className="text-5xl mb-3">{allKnown ? '🏆' : mostlyKnown ? '🎉' : '💪'}</p>
        <h2 className="text-2xl font-bold text-blue-900 mb-1">Session abgeschlossen!</h2>
        <p className="text-blue-500 text-sm">{motivational}</p>
      </div>

      {/* Results breakdown */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 text-left">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-4 text-center">
          Ergebnis
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-700">{result.known}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">Gewusst ✅</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-yellow-700">{result.almost}</p>
            <p className="text-xs text-yellow-600 font-medium mt-0.5">Fast 😐</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-red-700">{result.unknown}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">Nicht gewusst ❌</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-50 text-center">
          <p className="text-blue-500 text-sm">
            <strong className="text-blue-800">{result.total}</strong> Verse insgesamt wiederholt
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onAgain}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[52px] active:scale-[0.98]"
        >
          Nochmal üben
        </button>
        <button
          onClick={onBack}
          className="w-full bg-white border border-blue-200 text-blue-700 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors text-base min-h-[52px] active:scale-[0.98]"
        >
          Zurück zum Menü
        </button>
      </div>
    </div>
  );
}
