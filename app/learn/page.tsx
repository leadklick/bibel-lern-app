'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDueVerses, getVerses } from '@/lib/storage';

export default function LearnPage() {
  const [dueCount, setDueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDueCount(getDueVerses().length);
    setTotalCount(getVerses().length);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-blue-400 animate-pulse">Lädt…</span>
      </div>
    );
  }

  const modes = [
    {
      href: '/learn/flashcard',
      icon: '🃏',
      title: 'Karteikarten',
      description:
        'Bibelstelle sehen, Vers aufdecken. Perfekt zum Einprägen.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      href: '/learn/lueckentext',
      icon: '✏️',
      title: 'Lückentext',
      description:
        'Fehlende Wörter ergänzen. Schärft das genaue Erinnern.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      href: '/learn/tippen',
      icon: '⌨️',
      title: 'Tippen',
      description:
        'Den gesamten Vers aus dem Gedächtnis tippen. Maximale Herausforderung.',
      color: 'from-violet-500 to-violet-600',
    },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-1">Lernmodus wählen</h1>
        <p className="text-blue-500 text-sm md:text-base">
          {dueCount > 0
            ? `${dueCount} von ${totalCount} Versen sind heute fällig.`
            : 'Heute keine fälligen Verse – du kannst trotzdem üben!'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className={`bg-gradient-to-r ${mode.color} text-white rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity shadow-md min-h-[80px]`}
          >
            <span className="text-4xl md:text-5xl flex-shrink-0">{mode.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-xl">{mode.title}</div>
              <div className="text-sm text-white/80 mt-0.5 leading-snug">{mode.description}</div>
            </div>
            <span className="text-white/70 text-2xl flex-shrink-0">→</span>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-4 text-sm md:text-base text-blue-600">
        <strong>Tipp:</strong> Nach jeder Runde bewertest du, wie gut du den Vers
        kanntest (1–5). Die App berechnet dann automatisch den nächsten
        Wiederholungstermin (SM-2-Algorithmus).
      </div>
    </div>
  );
}
