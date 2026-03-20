'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDueVerses, getVerses, updateVerse, recordStudySession } from '@/lib/storage';
import { applyReview } from '@/lib/sm2';
import { Verse } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';
import Confetti from '@/components/Confetti';

type Phase = 'exercise' | 'result' | 'done';

type MatchResult = 'correct' | 'almost' | 'wrong' | null;

interface BlankWord {
  word: string;
  isBlank: boolean;
  userInput: string;
  correct: MatchResult;
}

interface SessionResult {
  total: number;
  known: number;
  almost: number;
  unknown: number;
}

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
  const [sessionResult, setSessionResult] = useState<SessionResult>({
    total: 0,
    known: 0,
    almost: 0,
    unknown: 0,
  });
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
      <div className="flex flex-col gap-5 page-enter">
        <div className="skeleton h-10 rounded-xl" />
        <div className="skeleton h-3 rounded-full" />
        <div className="skeleton h-8 w-48 mx-auto rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-14 rounded-xl" />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-20 page-enter">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
          📖
        </div>
        <p className="text-blue-800 font-bold text-xl mb-2">Keine Verse vorhanden</p>
        <p className="text-blue-400 text-sm mb-6">Füge zuerst Verse hinzu.</p>
        <button
          onClick={() => router.push('/learn')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          Zurück zum Menü
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const allKnown = sessionResult.unknown === 0 && sessionResult.almost === 0;
    const mostlyKnown = sessionResult.known / sessionResult.total >= 0.7;
    const motivational = allKnown
      ? 'Perfekt! Alle Lücken richtig ausgefüllt!'
      : mostlyKnown
      ? 'Sehr gut! Du kennst die meisten Verse schon sehr gut.'
      : 'Gut geübt! Mit jeder Wiederholung wird es leichter.';

    return (
      <div className="flex flex-col gap-6 page-enter text-center">
        {allKnown && <Confetti />}
        <div>
          <p className="text-5xl mb-3">{allKnown ? '🏆' : mostlyKnown ? '🎉' : '💪'}</p>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">Alle Verse geschafft!</h2>
          <p className="text-blue-500 text-sm">{motivational}</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 text-left">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-4 text-center">
            Ergebnis
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-700">{sessionResult.known}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Gewusst ✅</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-yellow-700">{sessionResult.almost}</p>
              <p className="text-xs text-yellow-600 font-medium mt-0.5">Fast 😐</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-700">{sessionResult.unknown}</p>
              <p className="text-xs text-red-600 font-medium mt-0.5">Nicht gewusst ❌</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-50 text-center">
            <p className="text-blue-500 text-sm">
              <strong className="text-blue-800">{sessionResult.total}</strong> Verse insgesamt wiederholt
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              const due = getDueVerses();
              const all = getVerses();
              const q = due.length > 0 ? due : all;
              setQueue(q);
              setIndex(0);
              if (q.length > 0) setBlanks(buildBlanks(q[0].text));
              setPhase('exercise');
              setSessionResult({ total: 0, known: 0, almost: 0, unknown: 0 });
            }}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[52px] active:scale-[0.98]"
          >
            Nochmal üben
          </button>
          <button
            onClick={() => router.push('/learn')}
            className="w-full bg-white border border-blue-200 text-blue-700 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors text-base min-h-[52px] active:scale-[0.98]"
          >
            Zurück zum Menü
          </button>
        </div>
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
      setBlanks(buildBlanks(queue[nextIndex].text));
      setPhase('exercise');
    }
  };

  const correctCount = blanks.filter(
    (b) => b.isBlank && (b.correct === 'correct' || b.correct === 'almost')
  ).length;
  const totalBlanks = blanks.filter((b) => b.isBlank).length;
  const rawRating = totalBlanks === 0 ? 5 : Math.max(1, Math.round((correctCount / totalBlanks) * 5));
  const autoRating = rawRating <= 1 ? 1 : rawRating <= 3 ? 3 : 5;

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

      <ProgressBar value={progress} showPercent />

      {/* Verse reference + tags */}
      <div className="text-center flex flex-col items-center gap-2">
        <span className="font-bold text-blue-900 text-xl md:text-2xl">{verse.reference}</span>
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
            Fast richtig
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
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[56px] active:scale-[0.98]"
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
          className={`${color} rounded-xl py-4 font-semibold transition-colors flex flex-col items-center gap-2 min-h-[80px] active:scale-95 ${
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
