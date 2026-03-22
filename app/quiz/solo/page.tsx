'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuizSet, QuizQuestion } from '@/lib/quiz-types';
import AnswerButton from '@/components/quiz/AnswerButton';
import TimerBar from '@/components/quiz/TimerBar';

type Phase = 'loading' | 'select' | 'question' | 'reveal' | 'finished';

interface Result {
  questionIndex: number;
  correct: boolean;
  points: number;
  answered: boolean;
  timeTaken: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  AT: 'bg-amber-100 text-amber-800',
  NT: 'bg-blue-100 text-blue-800',
  Evangelien: 'bg-green-100 text-green-800',
  Psalmen: 'bg-purple-100 text-purple-800',
  Propheten: 'bg-orange-100 text-orange-800',
  Paulus: 'bg-cyan-100 text-cyan-800',
  Gemischt: 'bg-slate-100 text-slate-700',
};

export default function SoloQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('set');

  const [phase, setPhase] = useState<Phase>('loading');
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<QuizSet | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(0);
  const answeredRef = useRef(false);

  useEffect(() => {
    fetch('/api/quiz/sets')
      .then(r => r.json())
      .then((data: QuizSet[]) => {
        setSets(data);
        if (preselectedId) {
          const found = data.find((s: QuizSet) => s.id === preselectedId);
          if (found) {
            setSelectedSet(found);
            setPhase('question');
            return;
          }
        }
        setPhase('select');
      })
      .catch(() => setPhase('select'));
  }, [preselectedId]);

  const currentQuestion: QuizQuestion | null = selectedSet
    ? selectedSet.questions[questionIndex]
    : null;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    stopTimer();
    setSelected(-1); // -1 = timed out
    const result: Result = {
      questionIndex,
      correct: false,
      points: 0,
      answered: false,
      timeTaken: currentQuestion?.timeLimit ?? 20,
    };
    setResults(prev => [...prev, result]);
    setTimeout(() => setPhase('reveal'), 300);
  }, [questionIndex, currentQuestion, stopTimer]);

  // Start timer when question phase begins
  useEffect(() => {
    if (phase !== 'question' || !currentQuestion) return;
    answeredRef.current = false;
    setSelected(null);
    setTimeLeft(currentQuestion.timeLimit);
    questionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [phase, questionIndex, currentQuestion, stopTimer, handleTimeout]);

  function handleAnswer(idx: number) {
    if (answeredRef.current || phase !== 'question' || !currentQuestion) return;
    answeredRef.current = true;
    stopTimer();

    const timeTaken = (Date.now() - questionStartRef.current) / 1000;
    const correct = idx === currentQuestion.correct;
    const timeLimit = currentQuestion.timeLimit;
    const points = correct
      ? Math.round(1000 * (1 - (timeTaken / timeLimit) * 0.5))
      : 0;

    setSelected(idx);
    setTotalScore(prev => prev + points);
    setResults(prev => [...prev, { questionIndex, correct, points, answered: true, timeTaken }]);
    setTimeout(() => setPhase('reveal'), 400);
  }

  function handleNext() {
    if (!selectedSet) return;
    const nextIndex = questionIndex + 1;
    if (nextIndex >= selectedSet.questions.length) {
      setPhase('finished');
    } else {
      setQuestionIndex(nextIndex);
      setPhase('question');
    }
  }

  function startSet(set: QuizSet) {
    setSelectedSet(set);
    setQuestionIndex(0);
    setResults([]);
    setTotalScore(0);
    setSelected(null);
    setPhase('question');
  }

  function restart() {
    if (!selectedSet) return;
    setQuestionIndex(0);
    setResults([]);
    setTotalScore(0);
    setSelected(null);
    setPhase('question');
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="text-blue-400 animate-pulse text-lg">Lädt…</span>
      </div>
    );
  }

  // ── Select quiz set ───────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="flex flex-col gap-5 page-enter">
        <div className="text-center py-2">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz auswählen</h1>
          <p className="text-blue-500 text-sm mt-1">Wähle ein Quiz und spiele alleine</p>
        </div>
        <div className="flex flex-col gap-3">
          {sets.map(set => (
            <button
              key={set.id}
              onClick={() => startSet(set)}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-4 text-left hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.97]"
            >
              <div className="text-3xl shrink-0">
                {set.category === 'AT' ? '📜' :
                 set.category === 'NT' ? '✝️' :
                 set.category === 'Evangelien' ? '📖' :
                 set.category === 'Psalmen' ? '🎵' :
                 set.category === 'Propheten' ? '🔥' :
                 set.category === 'Paulus' ? '✉️' : '🌍'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-base">{set.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[set.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {set.category}
                  </span>
                </div>
                <p className="text-blue-400 text-xs mt-0.5 truncate">{set.description}</p>
                <p className="text-slate-400 text-xs mt-0.5">{set.questions.length} Fragen</p>
              </div>
              <span className="text-blue-300 text-xl shrink-0">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Question ──────────────────────────────────────────────────────────────
  if ((phase === 'question' || phase === 'reveal') && currentQuestion && selectedSet) {
    const revealed = phase === 'reveal';
    const lastResult = results[results.length - 1];

    return (
      <div className="flex flex-col gap-4 page-enter">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => router.push('/quiz')}
            className="text-blue-400 hover:text-blue-600 transition-colors font-medium"
          >
            ← Beenden
          </button>
          <span className="text-slate-500 font-medium">
            {questionIndex + 1} / {selectedSet.questions.length}
          </span>
          <span className="font-bold text-amber-600">{totalScore.toLocaleString()} Pkt</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-blue-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((questionIndex) / selectedSet.questions.length) * 100}%` }}
          />
        </div>

        {/* Timer */}
        {phase === 'question' && (
          <TimerBar questionStartedAt={questionStartRef.current} timeLimit={currentQuestion.timeLimit} />
        )}

        {/* Question */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 text-center">
          <p className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">
            {currentQuestion.text}
          </p>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.answers.map((answer, idx) => (
            <AnswerButton
              key={idx}
              index={idx as 0 | 1 | 2 | 3}
              label={answer}
              selected={selected === idx}
              revealed={revealed}
              correct={currentQuestion.correct === idx}
              disabled={revealed || selected !== null}
              onClick={() => handleAnswer(idx)}
            />
          ))}
        </div>

        {/* Reveal feedback */}
        {revealed && lastResult && (
          <div className={`rounded-2xl p-4 text-center ${lastResult.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-lg font-bold ${lastResult.correct ? 'text-green-700' : 'text-red-600'}`}>
              {!lastResult.answered ? '⏱ Zeit abgelaufen!' : lastResult.correct ? '✅ Richtig!' : '❌ Falsch!'}
            </p>
            {lastResult.correct && (
              <p className="text-green-600 font-semibold text-sm mt-0.5">+{lastResult.points} Punkte</p>
            )}
            {currentQuestion.explanation && (
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{currentQuestion.explanation}</p>
            )}
            <button
              onClick={handleNext}
              className="mt-4 bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-700 transition-colors active:scale-[0.97] text-base"
            >
              {questionIndex + 1 < selectedSet.questions.length ? 'Weiter →' : 'Ergebnis →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished' && selectedSet) {
    const correctCount = results.filter(r => r.correct).length;
    const total = selectedSet.questions.length;
    const pct = Math.round((correctCount / total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '📖';

    return (
      <div className="flex flex-col gap-5 page-enter">
        {/* Score card */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white text-center shadow-lg">
          <div className="text-5xl mb-3">{emoji}</div>
          <p className="text-blue-200 text-sm mb-1">{selectedSet.title}</p>
          <p className="text-4xl font-extrabold mb-1 tracking-tight">{totalScore.toLocaleString()}</p>
          <p className="text-blue-200 text-sm">Punkte</p>
          <div className="mt-4 bg-white/10 rounded-xl p-3">
            <p className="text-lg font-bold">{correctCount} / {total} richtig ({pct}%)</p>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-3">Deine Antworten</h3>
          <div className="flex flex-col gap-2">
            {results.map((r, i) => {
              const q = selectedSet.questions[i];
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${r.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className="text-lg shrink-0">{r.correct ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium leading-snug ${r.correct ? 'text-green-800' : 'text-red-800'}`}>
                      {q.text}
                    </p>
                    {!r.correct && (
                      <p className="text-green-700 text-xs mt-0.5">
                        Richtig: {q.answers[q.correct]}
                      </p>
                    )}
                  </div>
                  {r.correct && (
                    <span className="text-green-600 font-bold shrink-0">+{r.points}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={restart}
            className="bg-slate-900 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-slate-700 transition-colors active:scale-[0.97] text-base"
          >
            🔄 Nochmal spielen
          </button>
          <button
            onClick={() => setPhase('select')}
            className="bg-white border border-blue-200 text-blue-700 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors active:scale-[0.97] text-base"
          >
            📋 Anderes Quiz
          </button>
          <button
            onClick={() => router.push('/quiz')}
            className="text-blue-400 text-sm font-medium py-2 hover:text-blue-600 transition-colors"
          >
            Zurück zur Quiz-Übersicht
          </button>
        </div>
      </div>
    );
  }

  return null;
}
