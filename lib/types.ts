export interface Verse {
  id: string;
  reference: string;
  text: string;
  tags: string[];
  translation?: string;
  createdAt: number;
  // SM-2 fields
  interval: number;      // days until next review
  repetitions: number;   // number of successful reviews
  easeFactor: number;    // difficulty multiplier (≥1.3)
  nextReview: number;    // timestamp of next review date
  lastReview: number | null;
  // Stats
  reviewCount: number;
  successCount: number;
}

export interface ReviewResult {
  verseId: string;
  rating: number; // 1-5
  timestamp: number;
}

export interface AppStats {
  streak: number;
  lastStudyDate: string | null;
  totalReviews: number;
}

export type LearnMode = 'flashcard' | 'lueckentext' | 'tippen';

export interface DuelResult {
  id: string;
  verseId: string;
  score: number;
  timeUsed: number; // seconds
  errors: number;
  date: number;
}
