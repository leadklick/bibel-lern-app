import { Verse, AppStats } from './types';
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
  localStorage.setItem(VERSES_KEY, JSON.stringify(verses));
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
