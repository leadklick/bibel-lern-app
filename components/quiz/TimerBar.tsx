'use client';

import { useEffect, useState } from 'react';

interface TimerBarProps {
  questionStartedAt: number | null;
  timeLimit: number; // seconds
  onExpire?: () => void;
}

export default function TimerBar({ questionStartedAt, timeLimit, onExpire }: TimerBarProps) {
  const [fraction, setFraction] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!questionStartedAt) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - questionStartedAt) / 1000;
      const remaining = Math.max(0, timeLimit - elapsed);
      const frac = remaining / timeLimit;

      setFraction(frac);
      setSecondsLeft(Math.ceil(remaining));

      if (remaining <= 0 && !expired) {
        setExpired(true);
        onExpire?.();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [questionStartedAt, timeLimit, onExpire, expired]);

  // Reset when question changes
  useEffect(() => {
    setFraction(1);
    setSecondsLeft(timeLimit);
    setExpired(false);
  }, [questionStartedAt, timeLimit]);

  const isUrgent = secondsLeft <= 5;
  const barColor = fraction > 0.5 ? 'bg-green-500' : fraction > 0.25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className={`text-2xl font-extrabold w-10 text-center tabular-nums transition-colors ${
          isUrgent ? 'text-red-500 timer-urgent' : 'text-slate-700'
        }`}
      >
        {secondsLeft}
      </div>
      <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${barColor}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
