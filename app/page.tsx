'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVerses, getStats } from '@/lib/storage';
import { isMastered, isDueToday } from '@/lib/sm2';
import { Verse, AppStats } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';

export default function Dashboard() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [stats, setStats] = useState<AppStats>({
    streak: 0,
    lastStudyDate: null,
    totalReviews: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVerses(getVerses());
    setStats(getStats());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-blue-400 text-lg animate-pulse">Lädt…</span>
      </div>
    );
  }

  const dueCount = verses.filter(isDueToday).length;
  const masteredCount = verses.filter(isMastered).length;
  const masteredPct =
    verses.length > 0 ? (masteredCount / verses.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Hero */}
      <div className="text-center py-2 md:py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">
          Guten Tag! ✝
        </h1>
        <p className="text-blue-500 text-sm md:text-base">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Fällig heute"
          value={dueCount}
          highlight={dueCount > 0}
        />
        <StatCard label="Verse gesamt" value={verses.length} />
        <StatCard label="Gemeistert" value={masteredCount} />
        <StatCard label="Lern-Streak" value={`${stats.streak} 🔥`} />
      </div>

      {/* Mastery Progress */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-blue-800 text-base">Lernfortschritt</span>
          <span className="text-sm text-blue-500">
            {masteredCount} / {verses.length} gemeistert
          </span>
        </div>
        <ProgressBar value={masteredPct} />
      </div>

      {/* CTA: Due Today */}
      {dueCount > 0 ? (
        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center shadow-md">
          <p className="text-xl font-semibold mb-1">
            {dueCount} Vers{dueCount !== 1 ? 'e' : ''} warten auf dich!
          </p>
          <p className="text-blue-200 text-sm mb-5">
            Halte deinen Streak aufrecht und lerne jetzt.
          </p>
          <Link
            href="/learn"
            className="block bg-white text-blue-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-base w-full text-center md:inline-block md:w-auto"
          >
            Jetzt lernen →
          </Link>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-green-700 font-semibold text-xl mb-1">
            Alles erledigt für heute! 🎉
          </p>
          <p className="text-green-600 text-sm">
            Komm morgen wieder für deine nächsten Wiederholungen.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3">
        <QuickLink href="/verse/add" label="Vers hinzufügen" icon="➕" />
        <QuickLink href="/verse" label="Alle Verse" icon="📖" />
        <QuickLink href="/learn" label="Lernmodus wählen" icon="🧠" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 text-center border shadow-sm ${
        highlight
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-blue-100 text-blue-900'
      }`}
    >
      <div className="text-3xl md:text-4xl font-bold">{value}</div>
      <div
        className={`text-xs md:text-sm mt-1 ${highlight ? 'text-blue-200' : 'text-blue-500'}`}
      >
        {label}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow transition-all min-h-[60px]"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-blue-800 text-base">{label}</span>
    </Link>
  );
}
