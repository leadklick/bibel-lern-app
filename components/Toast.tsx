'use client';

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDone?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'success',
  onDone,
  duration = 2400,
}: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), duration - 400);
    const doneTimer = setTimeout(() => onDone?.(), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold whitespace-nowrap ${colors[type]} ${
        exiting ? 'toast-exit' : 'toast-enter'
      }`}
    >
      {message}
    </div>
  );
}
