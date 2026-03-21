import { Verse, AppStats, DuelResult } from './types';
import { PRELOADED_VERSES } from './verses-data';

const VERSES_KEY = 'bibel_verses';
const STATS_KEY = 'bibel_stats';

// ── Verses ────────────────────────────────────────────────────────────────────

export function getVerses(): Verse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VERSES_KEY);
    if (!raw) {
      // First run — seed with preloaded verses
      setVerses(PRELOADED_VERSES);
      return PRELOADED_VERSES;
    }
    return JSON.parse(raw) as Verse[];
  } catch {
    return [];
  }
}

export function setVerses(verses: Verse[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VERSES_KEY, JSON.stringify(verses));
  } catch (e) {
    // localStorage quota exceeded — silently ignore to avoid crashing the UI
    console.warn('localStorage quota exceeded when saving verses', e);
  }
}

export function addVerse(verse: Verse): void {
  const verses = getVerses();
  setVerses([...verses, verse]);
}

export function updateVerse(updated: Verse): void {
  const verses = getVerses();
  setVerses(verses.map((v) => (v.id === updated.id ? updated : v)));
}

export function deleteVerse(id: string): void {
  const verses = getVerses();
  setVerses(verses.filter((v) => v.id !== id));
}

export function getDueVerses(): Verse[] {
  const verses = getVerses();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return verses.filter((v) => v.nextReview <= endOfToday.getTime());
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getShuffledDueVerses(): Verse[] {
  return shuffle(getDueVerses());
}

// ── Session Tracking ──────────────────────────────────────────────────────────
const SESSION_KEY = 'bibel_session';
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

interface SessionData {
  seenIds: string[];
  startTime: number;
}

export function getSessionSeen(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const data: SessionData = JSON.parse(raw);
    if (Date.now() - data.startTime > SESSION_TTL) {
      localStorage.removeItem(SESSION_KEY);
      return [];
    }
    return data.seenIds;
  } catch {
    return [];
  }
}

export function markSessionSeen(verseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    let existing: SessionData | null = null;
    if (raw) {
      try {
        const parsed: SessionData = JSON.parse(raw);
        // Only reuse if the session hasn't expired
        if (Date.now() - parsed.startTime <= SESSION_TTL) {
          existing = parsed;
        }
      } catch {
        // ignore parse errors
      }
    }

    const seen = existing ? existing.seenIds : [];
    if (seen.includes(verseId)) return;

    const data: SessionData = {
      seenIds: [...seen, verseId],
      // Preserve original startTime so TTL is relative to session start, not last action
      startTime: existing ? existing.startTime : Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function getNextVerses(): Verse[] {
  const due = getDueVerses();
  const seen = getSessionSeen();
  // Unseen verses first (shuffled), then seen ones (shuffled) as fallback
  const unseen = shuffle(due.filter((v) => !seen.includes(v.id)));
  const seenVerses = shuffle(due.filter((v) => seen.includes(v.id)));
  return [...unseen, ...seenVerses];
}

// ── Default Translation ───────────────────────────────────────────────────────

const DEFAULT_TRANSLATION_KEY = 'bibel_default_translation';

export function getDefaultTranslation(): string {
  if (typeof window === 'undefined') return 'NGU';
  try {
    return localStorage.getItem(DEFAULT_TRANSLATION_KEY) ?? 'NGU';
  } catch {
    return 'NGU';
  }
}

export function setDefaultTranslation(t: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEFAULT_TRANSLATION_KEY, t);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats(): AppStats {
  if (typeof window === 'undefined') {
    return { streak: 0, lastStudyDate: null, totalReviews: 0 };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { streak: 0, lastStudyDate: null, totalReviews: 0 };
    return JSON.parse(raw) as AppStats;
  } catch {
    return { streak: 0, lastStudyDate: null, totalReviews: 0 };
  }
}

// ── Duel Results ──────────────────────────────────────────────────────────────

const DUEL_RESULTS_KEY = 'bibel_duel_results';

export function getDuelResults(): DuelResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DUEL_RESULTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DuelResult[];
  } catch {
    return [];
  }
}

export function saveDuelResult(result: DuelResult): void {
  if (typeof window === 'undefined') return;
  const results = getDuelResults();
  localStorage.setItem(DUEL_RESULTS_KEY, JSON.stringify([...results, result]));
}

export function getBestScore(verseId: string): DuelResult | null {
  const results = getDuelResults().filter((r) => r.verseId === verseId);
  if (results.length === 0) return null;
  return results.reduce((best, r) => (r.score > best.score ? r : best), results[0]);
}

export function recordStudySession(): void {
  if (typeof window === 'undefined') return;
  const stats = getStats();
  const today = new Date().toISOString().slice(0, 10);

  if (stats.lastStudyDate === today) {
    // Already recorded today
    stats.totalReviews += 1;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (stats.lastStudyDate === yesterday) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }
    stats.lastStudyDate = today;
    stats.totalReviews += 1;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
