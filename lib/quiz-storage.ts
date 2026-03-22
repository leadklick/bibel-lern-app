'use client';

import { QuizSet } from './quiz-types';

const QUIZ_SETS_KEY = 'bibel_quiz_sets';
const QUIZ_RESULTS_KEY = 'bibel_quiz_results';

export interface QuizResult {
  id: string;
  roomCode: string;
  quizSetTitle: string;
  date: number;
  score: number;
  rank: number;
  totalPlayers: number;
}

// ── Quiz Sets (client-side cache, not authoritative) ───────────────────────────

export function getLocalQuizSets(): QuizSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUIZ_SETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuizSet[];
  } catch {
    return [];
  }
}

export function saveLocalQuizSet(set: QuizSet): void {
  if (typeof window === 'undefined') return;
  try {
    const sets = getLocalQuizSets();
    const idx = sets.findIndex((s) => s.id === set.id);
    if (idx >= 0) {
      sets[idx] = set;
    } else {
      sets.push(set);
    }
    localStorage.setItem(QUIZ_SETS_KEY, JSON.stringify(sets));
  } catch {
    // ignore
  }
}

export function deleteLocalQuizSet(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sets = getLocalQuizSets().filter((s) => s.id !== id);
    localStorage.setItem(QUIZ_SETS_KEY, JSON.stringify(sets));
  } catch {
    // ignore
  }
}

// ── Quiz Results ───────────────────────────────────────────────────────────────

export function getQuizResults(): QuizResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUIZ_RESULTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuizResult[];
  } catch {
    return [];
  }
}

export function saveQuizResult(result: QuizResult): void {
  if (typeof window === 'undefined') return;
  try {
    const results = getQuizResults();
    localStorage.setItem(
      QUIZ_RESULTS_KEY,
      JSON.stringify([...results, result])
    );
  } catch {
    // ignore
  }
}
