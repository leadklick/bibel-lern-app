import { Verse } from './types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Rating: 1 = complete blackout, 5 = perfect recall
 */
export function applyReview(verse: Verse, rating: number): Verse {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let { interval, repetitions, easeFactor } = verse;

  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  let newInterval: number;
  let newRepetitions: number;
  let nextReview: number;

  if (rating < 3) {
    // "Nicht gewusst" — stays due today (review again in this session)
    newInterval = 0;
    newRepetitions = 0;
    nextReview = now; // immediately due again
  } else if (rating === 3) {
    // "Fast" — review tomorrow
    newInterval = 1;
    newRepetitions = Math.max(1, repetitions);
    nextReview = now + 1 * dayMs;
  } else {
    // "Gewusst" — SM-2 with minimum 4 days
    if (repetitions === 0) {
      newInterval = 4;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newInterval = Math.max(4, newInterval);
    newRepetitions = repetitions + 1;
    nextReview = now + newInterval * dayMs;
  }

  return {
    ...verse,
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReview,
    lastReview: now,
    reviewCount: verse.reviewCount + 1,
    successCount: rating >= 3 ? verse.successCount + 1 : verse.successCount,
  };
}

export function isDueToday(verse: Verse): boolean {
  const endOfToday = getEndOfToday();
  return verse.nextReview <= endOfToday;
}

export function getEndOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function getDaysSinceReview(verse: Verse): number | null {
  if (!verse.lastReview) return null;
  const diff = Date.now() - verse.lastReview;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function isMastered(verse: Verse): boolean {
  return verse.repetitions >= 5 && verse.interval >= 21;
}
