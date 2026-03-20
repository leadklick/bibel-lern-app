import { Verse } from './types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Rating: 1 = complete blackout, 5 = perfect recall
 */
export function applyReview(verse: Verse, rating: number): Verse {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let { interval, repetitions, easeFactor } = verse;

  // Update ease factor (min 1.3)
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  let newInterval: number;
  let newRepetitions: number;

  if (rating < 3) {
    // Failed review — reset
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Successful review
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  }

  const nextReview = now + newInterval * dayMs;

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
