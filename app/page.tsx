'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVerses, getStats } from '@/lib/storage';
import { isMastered, isDueToday } from '@/lib/sm2';
import { Verse, AppStats } from '@/lib/types';
import ProgressBar from '@/components/ProgressBar';

const MOTIVATIONAL_QUOTES = [
  { text: 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Weg.', ref: 'Ps 119,105' },
  { text: 'Ich vermag alles durch den, der mich stärkt.', ref: 'Phil 4,13' },
  { text: 'Fürchte dich nicht, denn ich bin mit dir.', ref: 'Jes 41,10' },
  { text: 'Der HERR ist mein Hirte, mir wird nichts mangeln.', ref: 'Ps 23,1' },
  { text: 'Vertrau auf den HERRN von ganzem Herzen.', ref: 'Spr 3,5' },
  { text: 'Freut euch in dem HERRN allezeit! Abermals sage ich: Freut euch!', ref: 'Phil 4,4' },
  { text: 'Wirft deine Sorgen auf den HERRN; er wird für dich sorgen.', ref: 'Ps 55,23' },
];

function getDailyQuote() {
  // Use day of week (0=Sunday … 6=Saturday) so the quote rotates predictably each day
  const day = new Date().getDay();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}

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
      <div className="flex flex-col gap-6 md:gap-8 page-enter">
        {/* Skeleton */}
        <div className="text-center py-2 md:py-4">
          <div className="skeleton h-9 w-48 mx-auto mb-2" />
          <div className="skeleton h-4 w-40 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const dueCount = verses.filter(isDueToday).length;
  const masteredCount = verses.filter(isMastered).length;
  const masteredPct =
    verses.length > 0 ? (masteredCount / verses.length) * 100 : 0;
  const quote = getDailyQuote();
  const isFirstTimeUser = verses.length === 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8 page-enter">
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

      {/* Daily motivational quote */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-1 text-center">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-medium mb-2">
          ✦ Tagesvers ✦
        </p>
        <p className="text-blue-900 font-serif text-lg md:text-xl leading-relaxed italic font-medium">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-blue-400 text-sm mt-2">{quote.ref}</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-red-400 transition-colors active:scale-110">
            <span className="text-base">🤍</span> Favorit
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ text: `"${quote.text}" – ${quote.ref}` });
              } else {
                navigator.clipboard.writeText(`"${quote.text}" – ${quote.ref}`);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-600 transition-colors active:scale-110"
          >
            <span className="text-base">↗️</span> Teilen
          </button>
        </div>
      </div>

      {/* First-time welcome */}
      {isFirstTimeUser && (
        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center shadow-md">
          <p className="text-2xl mb-2">👋</p>
          <p className="font-bold text-xl mb-1">Herzlich willkommen!</p>
          <p className="text-blue-200 text-sm mb-4 leading-relaxed">
            Füge deinen ersten Bibelvers hinzu und starte deine tägliche Lernsession.
          </p>
          <Link
            href="/verse/add"
            className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-base"
          >
            Ersten Vers hinzufügen →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Fällig heute"
          value={dueCount === 0 ? '✓' : dueCount}
          icon={dueCount === 0 ? '✅' : '📅'}
          highlight={dueCount > 0}
          subtext={dueCount === 0 ? 'Alles erledigt!' : undefined}
          pulse={dueCount > 0}
        />
        <StatCard label="Verse gesamt" value={verses.length} icon="📖" />
        <StatCard label="Gemeistert" value={masteredCount} icon="🏆" />
        <StatCard
          label="Lern-Streak"
          value={stats.streak}
          icon="🔥"
          flameIcon
          streak={stats.streak > 0}
        />
      </div>

      {/* Mastery Progress */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-blue-800 text-base">Lernfortschritt</span>
          <span className="text-sm text-blue-500">
            {masteredCount} / {verses.length} gemeistert
          </span>
        </div>
        <ProgressBar value={masteredPct} showPercent />
      </div>

      {/* CTA: Due Today */}
      {!isFirstTimeUser && (
        dueCount > 0 ? (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xl font-bold mb-1">
              {dueCount} Vers{dueCount !== 1 ? 'e' : ''} warten auf dich!
            </p>
            <p className="text-blue-100 text-sm mb-5">
              Du schaffst das — jede Wiederholung bringt dich weiter.
            </p>
            <Link
              href="/learn"
              className="block bg-white text-blue-700 font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 active:scale-95 transition-all text-base w-full text-center md:inline-block md:w-auto shadow-sm"
            >
              Jetzt lernen ✨
            </Link>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-green-700 font-bold text-xl mb-1">
              Alles erledigt für heute!
            </p>
            <p className="text-green-600 text-sm">
              Großartig! Komm morgen wieder für deine nächsten Wiederholungen.
            </p>
          </div>
        )
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3">
        <QuickLink href="/verse/add" label="Vers hinzufügen" icon="➕" desc="Neue Bibelstelle" />
        <QuickLink href="/verse" label="Alle Verse" icon="📖" desc="Verwalten & suchen" />
        <QuickLink href="/learn" label="Lernmodus" icon="🧠" desc="Karteikarten & mehr" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
  subtext,
  flameIcon = false,
  pulse = false,
  streak = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  highlight?: boolean;
  subtext?: string;
  flameIcon?: boolean;
  pulse?: boolean;
  streak?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 text-center border shadow-sm flex flex-col items-center gap-1 transition-all ${
        highlight
          ? 'bg-blue-600 border-blue-600 text-white'
          : streak
          ? 'bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200 text-orange-900'
          : 'bg-white border-blue-100 text-blue-900'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className={`text-2xl md:text-3xl font-bold leading-tight ${pulse ? 'animate-pulse' : ''} ${streak ? 'text-orange-500' : ''}`}>{value}</div>
      {subtext ? (
        <div className={`text-xs font-semibold ${highlight ? 'text-blue-100' : 'text-green-600'}`}>
          {subtext}
        </div>
      ) : (
        <div className={`text-xs md:text-sm ${highlight ? 'text-blue-200' : streak ? 'text-orange-400' : 'text-blue-500'}`}>
          {label}
        </div>
      )}
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
  desc,
}: {
  href: string;
  label: string;
  icon: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all min-h-[68px] active:scale-[0.97] active:opacity-75"
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-blue-800 text-sm leading-tight">{label}</span>
        <span className="text-blue-400 text-xs leading-tight mt-0.5 truncate">{desc}</span>
      </div>
    </Link>
  );
}
