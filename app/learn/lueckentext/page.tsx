'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDueVerses, getVerses, updateVerse, recordStudySession } from '@/lib/storage';
import { applyReview } from '@/lib/sm2';
import { Verse } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';

type Phase = 'exercise' | 'result' | 'rate' | 'done';

/** Match result for a single blank */
type MatchResult = 'correct' | 'almost' | 'wrong' | null;

interface BlankWord {
  word: string;
  isBlank: boolean;
  userInput: string;
  correct: MatchResult;
}

/** Levenshtein distance between two strings */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy-match a user answer against the expected word.
 * Returns 'correct' | 'almost' | 'wrong'.
 *  - 'correct'  — exact match (after normalization)
 *  - 'almost'   — Levenshtein distance ≤ 2 for words ≥5 chars, or ≤1 for shorter words
 *  - 'wrong'    — everything else
 */
function fuzzyMatch(expected: string, given: string): MatchResult {
  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,;:!?»«„""'']+/g, '');

  const exp = normalize(expected);
  const giv = normalize(given);

  if (exp === giv) return 'correct';

  const dist = levenshtein(exp, giv);
  const threshold = exp.length >= 5 ? 2 : 1;

  if (dist <= threshold) return 'almost';
  return 'wrong';
}

function buildBlanks(text: string): BlankWord[] {
  const words = text.split(/\s+/);
  // Blank every 4th word and every word longer than 4 chars probabilistically
  return words.map((word, i) => {
    const clean = word.replace(/[.,;:!?»«„"]+$/g, '');
    const shouldBlank = clean.length > 3 && (i % 4 === 3 || i % 7 === 5);
    return { word, isBlank: shouldBlank, userInput: '', correct: null };
  });
}

export default function LueckentextPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('exercise');
  const [blanks, setBlanks] = useState<BlankWord[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const due = getDueVerses();
    const all = getVerses();
    const q = due.length > 0 ? due : all;
    setQueue(q);
    if (q.length > 0) setBlanks(buildBlanks(q[0].text));
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
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📖</p>
        <p className="text-blue-800 font-semibold">Keine Verse vorhanden</p>
        <button
          onClick={() => router.push('/learn')}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          Zurück
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🎉</p>
        <p className="text-blue-800 font-semibold text-xl mb-2">Alle Verse geschafft!</p>
        <p className="text-blue-500 text-sm mb-6">Gut gemacht! Deine Fortschritte wurden gespeichert.</p>
        <button
          onClick={() => router.push('/learn')}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base min-h-[56px]"
        >
          Zurück zum Menü
        </button>
      </div>
    );
  }

  const verse = queue[index];
  const progress = (index / queue.length) * 100;

  const handleSkip = () => {
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setBlanks(buildBlanks(queue[nextIndex].text));
      setPhase('exercise');
    }
  };

  const handleCheck = () => {
    const checked = blanks.map((b) => {
      if (!b.isBlank) return b;
      const result = fuzzyMatch(b.word, b.userInput);
      return { ...b, correct: result };
    });
    setBlanks(checked);
    setPhase('result');
  };

  const handleRate = (rating: number) => {
    const updated = applyReview(verse, rating);
    updateVerse(updated);
    recordStudySession();

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setBlanks(buildBlanks(queue[nextIndex].text));
      setPhase('exercise');
    }
  };

  const correctCount = blanks.filter(
    (b) => b.isBlank && (b.correct === 'correct' || b.correct === 'almost')
  ).length;
  const totalBlanks = blanks.filter((b) => b.isBlank).length;
  // Snap to valid rating values (1, 3, 5)
  const rawRating = totalBlanks === 0 ? 5 : Math.max(1, Math.round((correctCount / totalBlanks) * 5));
  const autoRating = rawRating <= 1 ? 1 : rawRating <= 3 ? 3 : 5;

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
        <div className="flex items-center gap-3">
          {phase === 'exercise' && (
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

      <ProgressBar value={progress} />

      {/* Verse reference */}
      <div className="text-center">
        <span className="font-bold text-blue-900 text-xl md:text-2xl">{verse.reference}</span>
      </div>

      {/* Blanks */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 md:p-6">
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-4 font-medium">
          Ergänze die fehlenden Wörter
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-6 items-baseline leading-loose">
          {blanks.map((b, i) => {
            if (!b.isBlank) {
              return (
                <span key={i} className="text-gray-700 text-base">
                  {b.word}
                </span>
              );
            }

            let borderColor = 'border-blue-300';
            let bgColor = '';
            if (phase === 'result') {
              if (b.correct === 'correct') {
                borderColor = 'border-green-400';
                bgColor = 'bg-green-50';
              } else if (b.correct === 'almost') {
                borderColor = 'border-yellow-400';
                bgColor = 'bg-yellow-50';
              } else {
                borderColor = 'border-red-400';
                bgColor = 'bg-red-50';
              }
            }

            return (
              <span key={i} className="relative inline-flex flex-col items-center">
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  value={b.userInput}
                  disabled={phase === 'result'}
                  onChange={(e) => {
                    const updated = [...blanks];
                    updated[i] = { ...updated[i], userInput: e.target.value };
                    setBlanks(updated);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Focus next blank
                      const nextBlankIdx = blanks.findIndex((b2, j) => j > i && b2.isBlank);
                      if (nextBlankIdx >= 0) inputRefs.current[nextBlankIdx]?.focus();
                    }
                  }}
                  style={{ width: `${Math.max(b.word.length * 11, 64)}px` }}
                  className={`border-b-2 ${borderColor} ${bgColor} text-center text-base focus:outline-none transition-colors py-1 min-h-[36px]`}
                />
                {phase === 'result' && b.correct !== 'correct' && (
                  <span
                    className={`text-xs whitespace-nowrap mt-1 ${
                      b.correct === 'almost' ? 'text-yellow-600' : 'text-red-500'
                    }`}
                  >
                    {b.correct === 'almost' ? '≈ ' : '→ '}{b.word}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Result summary */}
      {phase === 'result' && (
        <div className={`rounded-xl p-4 text-center font-medium ${
          correctCount === totalBlanks
            ? 'bg-green-50 text-green-700 border border-green-200'
            : correctCount > 0
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-orange-50 text-orange-700 border border-orange-200'
        }`}>
          {correctCount} / {totalBlanks} richtig
          {correctCount === totalBlanks ? ' – Ausgezeichnet! 🎉' : ''}
          {(() => {
            const almostCount = blanks.filter(
              (b) => b.isBlank && b.correct === 'almost'
            ).length;
            return almostCount > 0
              ? ` (davon ${almostCount} fast richtig)`
              : '';
          })()}
        </div>
      )}

      {/* Legend when in result */}
      {phase === 'result' && (
        <div className="flex gap-4 text-xs justify-center text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-200 inline-block" />
            Richtig
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-200 inline-block" />
            Fast richtig (Tippfehler)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-200 inline-block" />
            Falsch
          </span>
        </div>
      )}

      {/* Action buttons */}
      {phase === 'exercise' && (
        <button
          onClick={handleCheck}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[56px]"
        >
          Überprüfen
        </button>
      )}

      {phase === 'result' && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-blue-700 font-medium text-sm">
            Wie schwer war dieser Vers?
          </p>
          <RatingButtons onRate={handleRate} suggested={autoRating} />
        </div>
      )}
    </div>
  );
}

function RatingButtons({
  onRate,
  suggested,
}: {
  onRate: (r: number) => void;
  suggested?: number;
}) {
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
          className={`${color} rounded-xl py-4 font-semibold transition-colors flex flex-col items-center gap-2 min-h-[80px] ${
            suggested === value ? 'ring-2 ring-offset-1 ring-blue-400' : ''
          }`}
        >
          <span className="text-3xl">{emoji}</span>
          <span className="text-sm leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}
