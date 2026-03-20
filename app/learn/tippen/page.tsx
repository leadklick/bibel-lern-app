'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDueVerses, getVerses, updateVerse, recordStudySession } from '@/lib/storage';
import { applyReview } from '@/lib/sm2';
import { Verse } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';

type Phase = 'typing' | 'result' | 'rate' | 'done';

interface WordResult {
  expected: string;
  given: string;
  correct: boolean;
}

function compareWords(expected: string, given: string): WordResult[] {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[.,;:!?»«„""'']+/g, '');

  const expWords = expected.trim().split(/\s+/);
  const givWords = given.trim().split(/\s+/);

  const maxLen = Math.max(expWords.length, givWords.length);
  const results: WordResult[] = [];

  for (let i = 0; i < maxLen; i++) {
    const e = expWords[i] ?? '';
    const g = givWords[i] ?? '';
    results.push({
      expected: e,
      given: g,
      correct: normalize(e) === normalize(g),
    });
  }

  return results;
}

export default function TippenPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [input, setInput] = useState('');
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const due = getDueVerses();
    const all = getVerses();
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
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📖</p>
        <p className="text-blue-800 font-semibold text-xl mb-2">Keine Verse vorhanden</p>
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
        <p className="text-blue-800 font-semibold text-xl mb-2">Alle Verse getippt!</p>
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

  const handleCheck = () => {
    const results = compareWords(verse.text, input);
    setWordResults(results);
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
      setInput('');
      setWordResults([]);
      setPhase('typing');
    }
  };

  const correctCount = wordResults.filter((w) => w.correct).length;
  const totalWords = wordResults.length;
  const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
  const autoRating = Math.max(1, Math.round(accuracy / 20));

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

      {/* Verse reference */}
      <div className="text-center">
        <span className="font-bold text-blue-900 text-xl md:text-2xl">{verse.reference}</span>
        <p className="text-blue-400 text-sm mt-1">Tippe den vollständigen Vers aus dem Gedächtnis</p>
      </div>

      {/* Typing area */}
      {phase === 'typing' && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-4">
          <textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tippe hier den Vers…"
            rows={6}
            className="w-full resize-none border border-blue-200 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[140px]"
          />
        </div>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="text-sm text-blue-500 font-medium text-center">
            Genauigkeit: {accuracy}% ({correctCount}/{totalWords} Wörter)
          </div>

          <div className="flex flex-wrap gap-1.5 leading-loose">
            {wordResults.map((w, i) => (
              <span
                key={i}
                className={`rounded px-1.5 py-0.5 text-sm md:text-base ${
                  w.correct
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800 line-through'
                }`}
                title={w.correct ? '' : `Erwartet: ${w.expected}`}
              >
                {w.given || w.expected}
              </span>
            ))}
          </div>

          {/* Show correct verse below */}
          <div className="border-t border-blue-100 pt-4">
            <p className="text-xs text-blue-400 mb-2 font-medium uppercase tracking-wider">
              Korrekter Vers
            </p>
            <p className="text-gray-700 text-base leading-relaxed">{verse.text}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {phase === 'typing' && (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-base min-h-[56px]"
        >
          Überprüfen
        </button>
      )}

      {phase === 'result' && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-blue-700 font-medium text-sm">
            Wie gut hast du den Vers gewusst?
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
