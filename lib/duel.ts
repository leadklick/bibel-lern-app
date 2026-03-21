export function calculatePoints(timeRemaining: number, errors: number): number {
  // Max 1000 points. Time bonus + accuracy bonus.
  const timeBonus = Math.round(timeRemaining * 10); // 10pts per second remaining
  const accuracyBonus = Math.max(0, 500 - errors * 50);
  return Math.min(1000, timeBonus + accuracyBonus);
}
