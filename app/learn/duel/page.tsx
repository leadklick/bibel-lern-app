'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getVerses, getBestScore, saveDuelResult } from '@/lib/storage';
import { calculatePoints } from '@/lib/duel';
import { Verse, DuelResult } from '@/lib/types';
import { generateSmartGaps } from '@/lib/smart-gaps';

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'select' | 'countdown' | 'playing' | 'result';

interface BlankWord {
  word: string;
  isBlank: boolean;
  userInput: string;
  status: 'idle' | 'correct' | 'wrong';
}

const DUEL_DURATION = 60; // seconds

// ── Helpers ────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,;:!?»«„""'']+/g, '');
}

function buildBlanks(text: string): BlankWord[] {
  return generateSmartGaps(text, 'normal').map((b) => ({
    ...b,
    status: 'idle' as const,
  }));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function DuelPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [bestScore, setBestScore] = useState<DuelResult | null>(null);

  // Countdown state
  const [countdownVal, setCountdownVal] = useState(3);
  const [countdownKey, setCountdownKey] = useState(0);

  // Playing state
  const [blanks, setBlanks] = useState<BlankWord[]>([]);
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION);
  const [errors, setErrors] = useState(0);
  const [score, setScore] = useState(0);
  const [completedBlanks, setCompletedBlanks] = useState(0);

  // Result state
  const [finalResult, setFinalResult] = useState<DuelResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timeLeftRef = useRef(DUEL_DURATION);
  const errorsRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    setVerses(getVerses());
    setMounted(true);
  }, []);

  // ── Countdown logic ──────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'countdown') return;

    let val = 3;
    setCountdownVal(val);
    setCountdownKey((k) => k + 1);

    const tick = setInterval(() => {
      val -= 1;
      if (val <= 0) {
        clearInterval(tick);
        setPhase('playing');
      } else {
        setCountdownVal(val);
        setCountdownKey((k) => k + 1);
      }
    }, 900);

    return () => clearInterval(tick);
  }, [phase]);

  // ── Timer logic ──────────────────────────────────────────────────────────

  const endGame = useCallback(
    (currentBlanks: BlankWord[], timeRemaining: number, currentErrors: number) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const totalBlanks = currentBlanks.filter((b) => b.isBlank).length;
      const filledCorrectly = currentBlanks.filter(
        (b) => b.isBlank && b.status === 'correct'
      ).length;
      const completionBonus = filledCorrectly === totalBlanks ? 200 : 0;
      const pts = calculatePoints(timeRemaining, currentErrors) + completionBonus;

      const result: DuelResult = {
        id: Date.now().toString(),
        verseId: selectedVerse!.id,
        score: pts,
        timeUsed: DUEL_DURATION - timeRemaining,
        errors: currentErrors,
        date: Date.now(),
      };

      saveDuelResult(result);
      setFinalResult(result);
      setPhase('result');
    },
    [selectedVerse]
  );

  useEffect(() => {
    if (phase !== 'playing') return;

    timeLeftRef.current = DUEL_DURATION;
    errorsRef.current = errors;
    scoreRef.current = score;
    setTimeLeft(DUEL_DURATION);

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        // Time's up — capture current blanks state via setBlanks callback
        setBlanks((current) => {
          endGame(current, 0, errorsRef.current);
          return current;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Start duel ───────────────────────────────────────────────────────────

  const startDuel = (verse: Verse) => {
    const best = getBestScore(verse.id);
    setSelectedVerse(verse);
    setBestScore(best);
    setBlanks(buildBlanks(verse.text));
    setTimeLeft(DUEL_DURATION);
    setErrors(0);
    setScore(0);
    setCompletedBlanks(0);
    errorsRef.current = 0;
    scoreRef.current = 0;
    setPhase('countdown');
  };

  // ── Input handling ───────────────────────────────────────────────────────

  const handleInput = useCallback(
    (idx: number, value: string) => {
      setBlanks((prev) => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], userInput: value };
        return updated;
      });
    },
    []
  );

  const handleBlur = useCallback(
    (idx: number) => {
      setBlanks((prev) => {
        const b = prev[idx];
        if (!b.isBlank || b.status === 'correct') return prev;
        if (!b.userInput.trim()) return prev;

        const isCorrect = normalize(b.word) === normalize(b.userInput);

        if (isCorrect) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], status: 'correct' };

          const newCompleted = updated.filter(
            (bw) => bw.isBlank && bw.status === 'correct'
          ).length;
          const totalBlanks = updated.filter((bw) => bw.isBlank).length;

          setCompletedBlanks(newCompleted);

          if (newCompleted >= totalBlanks) {
            // All blanks filled correctly
            setTimeout(() => {
              endGame(updated, timeLeftRef.current, errorsRef.current);
            }, 300);
          }

          return updated;
        } else {
          // Wrong — shake and increment errors
          errorsRef.current += 1;
          setErrors((e) => e + 1);

          const updated = [...prev];
          updated[idx] = { ...updated[idx], status: 'wrong', userInput: '' };
          return updated;
        }
      });
    },
    [endGame]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (e.key === 'Enter') {
        handleBlur(idx);
        // Move to next blank
        const nextIdx = blanks.findIndex((b, j) => j > idx && b.isBlank && b.status !== 'correct');
        if (nextIdx >= 0) {
          setTimeout(() => inputRefs.current[nextIdx]?.focus(), 50);
        }
      }
    },
    [blanks, handleBlur]
  );

  // ── Ghost progress ───────────────────────────────────────────────────────

  const ghostProgress =
    bestScore && phase === 'playing'
      ? Math.min(
          100,
          ((DUEL_DURATION - timeLeft) / Math.max(1, bestScore.timeUsed)) * 100
        )
      : 0;

  const myProgress =
    phase === 'playing'
      ? Math.min(
          100,
          (completedBlanks /
            Math.max(1, blanks.filter((b) => b.isBlank).length)) *
            100
        )
      : 0;

  // ── Early returns ────────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-10 rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="text-center py-20 page-enter">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
          📖
        </div>
        <p className="text-blue-800 font-bold text-xl mb-2">Keine Verse vorhanden</p>
        <p className="text-blue-500 text-sm mb-6">Füge zuerst Verse hinzu, um ein Duell zu starten.</p>
        <button
          onClick={() => router.push('/learn')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          Zurück zum Menü
        </button>
      </div>
    );
  }

  // ── Select phase ─────────────────────────────────────────────────────────

  if (phase === 'select') {
    return <SelectPhase verses={verses} onStart={startDuel} onBack={() => router.push('/learn')} />;
  }

  // ── Countdown phase ──────────────────────────────────────────────────────

  if (phase === 'countdown') {
    return (
      <div className="fixed inset-0 bg-blue-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div
            key={countdownKey}
            className="countdown-pop text-9xl font-black text-white mb-4 select-none"
          >
            {countdownVal}
          </div>
          <p className="text-blue-300 text-xl font-medium">Bereit machen…</p>
        </div>
      </div>
    );
  }

  // ── Result phase ─────────────────────────────────────────────────────────

  if (phase === 'result' && finalResult) {
    const prevBest = bestScore;
    const isNewRecord = !prevBest || finalResult.score > prevBest.score;
    const diff = prevBest ? finalResult.score - prevBest.score : null;

    return (
      <div className="flex flex-col gap-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/learn')}
            className="text-blue-500 text-sm font-medium min-h-[44px] flex items-center"
          >
            ← Zurück
          </button>
        </div>

        {/* Trophy / emoji */}
        <div className="text-center">
          <p className="text-6xl mb-3">{isNewRecord ? '🏆' : '⚔️'}</p>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">
            {isNewRecord ? 'Neuer Rekord!' : 'Duell beendet!'}
          </h2>
          {isNewRecord && diff !== null && diff > 0 && (
            <p className="text-green-600 font-semibold text-base">
              +{diff} Punkte besser als dein Rekord
            </p>
          )}
          {!isNewRecord && diff !== null && (
            <p className="text-blue-500 text-sm">
              {Math.abs(diff)} Punkte unter deinem Rekord
            </p>
          )}
          {!prevBest && (
            <p className="text-blue-400 text-sm">Dein erster Eintrag – weiter so!</p>
          )}
        </div>

        {/* Score card */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-4 text-center">
            Ergebnis
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-700">{finalResult.score}</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">Punkte</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-indigo-700">{finalResult.timeUsed}s</p>
              <p className="text-xs text-indigo-500 font-medium mt-0.5">Zeit</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-700">{finalResult.errors}</p>
              <p className="text-xs text-red-500 font-medium mt-0.5">Fehler</p>
            </div>
          </div>

          {prevBest && (
            <div className="mt-4 pt-4 border-t border-blue-50">
              <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-2 text-center">
                Bestzeit
              </p>
              <div className="flex justify-center gap-6 text-sm text-blue-600">
                <span>👻 {prevBest.score} Pkt.</span>
                <span>{prevBest.timeUsed}s</span>
                <span>{prevBest.errors} Fehler</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => selectedVerse && startDuel(selectedVerse)}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors text-base min-h-[52px] active:scale-[0.98]"
          >
            Nochmal
          </button>
          <button
            onClick={() => setPhase('select')}
            className="w-full bg-white border border-blue-200 text-blue-700 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors text-base min-h-[52px] active:scale-[0.98]"
          >
            Anderer Vers
          </button>
        </div>
      </div>
    );
  }

  // ── Playing phase ─────────────────────────────────────────────────────────

  const totalBlanks = blanks.filter((b) => b.isBlank).length;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="flex flex-col gap-4 page-enter">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('select');
          }}
          className="text-blue-500 text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Aufgeben
        </button>
        <span className="text-blue-600 font-semibold text-sm">
          {selectedVerse?.reference}
        </span>
      </div>

      {/* Ghost runner bars */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-blue-700 w-20 flex-shrink-0">👤 Du</span>
          <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${myProgress}%` }}
            />
          </div>
          <span className="text-xs text-blue-600 w-10 text-right flex-shrink-0">
            {Math.round(myProgress)}%
          </span>
        </div>
        {bestScore && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-400 w-20 flex-shrink-0">👻 Bestzeit</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-dashed border-gray-300">
              <div
                className="h-full bg-gray-400 rounded-full opacity-60 transition-all duration-1000"
                style={{ width: `${ghostProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">
              {Math.round(ghostProgress)}%
            </span>
          </div>
        )}
        {!bestScore && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-300 w-20 flex-shrink-0">👻 Bestzeit</span>
            <div className="flex-1 h-3 bg-gray-50 rounded-full border border-dashed border-gray-200" />
            <span className="text-xs text-gray-300 w-10 text-right flex-shrink-0">–</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center">
        <span
          className={`text-5xl font-black tabular-nums ${isUrgent ? 'timer-urgent' : 'text-blue-800'}`}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      {/* Verse with blanks */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
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

            const isCorrect = b.status === 'correct';
            const isWrong = b.status === 'wrong';

            return (
              <span key={i} className="relative inline-flex flex-col items-center">
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  value={b.userInput}
                  disabled={isCorrect}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onBlur={() => handleBlur(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{ width: `${Math.max(b.word.length * 11, 64)}px` }}
                  className={`border-b-2 text-center text-base focus:outline-none transition-colors py-1 min-h-[36px]
                    ${isCorrect ? 'border-green-400 bg-green-50 correct-flash' : ''}
                    ${isWrong ? 'border-red-400 shake' : ''}
                    ${!isCorrect && !isWrong ? 'border-blue-300' : ''}
                  `}
                />
              </span>
            );
          })}
        </div>
      </div>

      {/* Score row */}
      <div className="flex justify-between items-center bg-white rounded-xl border border-blue-100 shadow-sm px-5 py-3">
        <span className="text-blue-800 font-semibold text-sm">
          Punkte: <strong className="text-blue-600 text-base">{score}</strong>
        </span>
        <span className="text-sm text-gray-500">
          Blanks: {completedBlanks} / {totalBlanks}
        </span>
        <span className="text-red-600 font-semibold text-sm">
          Fehler: <strong>{errors}</strong>
        </span>
      </div>
    </div>
  );
}

// ── Select Phase Component ─────────────────────────────────────────────────

function SelectPhase({
  verses,
  onStart,
  onBack,
}: {
  verses: Verse[];
  onStart: (verse: Verse) => void;
  onBack: () => void;
}) {
  const bestScores: Record<string, DuelResult | null> = {};
  for (const v of verses) {
    bestScores[v.id] = getBestScore(v.id);
  }

  return (
    <div className="flex flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-blue-500 text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Zurück
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Lern-Duell</h1>
        <p className="text-blue-500 text-sm">Wähle einen Vers für dein 60-Sekunden-Quiz</p>
      </div>

      <div className="flex flex-col gap-3">
        {verses.map((verse) => {
          const best = bestScores[verse.id];
          return (
            <div
              key={verse.id}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-900 text-base truncate">
                  {verse.reference}
                </p>
                {verse.tags.length > 0 && (
                  <p className="text-xs text-blue-400 mt-0.5 truncate">
                    {verse.tags.join(', ')}
                  </p>
                )}
                {best && (
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                    🏆 {best.score} Pkt. · {best.errors} Fehler · {best.timeUsed}s
                  </p>
                )}
                {!best && (
                  <p className="text-xs text-gray-400 mt-1">Noch kein Eintrag</p>
                )}
              </div>
              <button
                onClick={() => onStart(verse)}
                className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0 min-h-[44px] active:scale-95"
              >
                Duell starten
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
