'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVerses, deleteVerse } from '@/lib/storage';
import { Verse } from '@/lib/types';
import VerseCard from '@/components/VerseCard';
import { isDueToday } from '@/lib/sm2';

export default function VersePage() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [filter, setFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVerses(getVerses());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-blue-400 animate-pulse">Lädt…</span>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (confirm('Vers wirklich löschen?')) {
      deleteVerse(id);
      setVerses(getVerses());
    }
  };

  const filtered = verses
    .filter((v) => {
      if (filter === 'due') return isDueToday(v);
      if (filter === 'mastered') return v.repetitions >= 5 && v.interval >= 21;
      return true;
    })
    .filter(
      (v) =>
        v.reference.toLowerCase().includes(search.toLowerCase()) ||
        v.text.toLowerCase().includes(search.toLowerCase()) ||
        v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Meine Verse</h1>
        <Link
          href="/verse/add"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
        >
          + Hinzufügen
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white min-h-[48px]"
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            ['all', 'Alle'],
            ['due', 'Fällig'],
            ['mastered', 'Gemeistert'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors min-h-[44px] ${
              filter === value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Verse list */}
      {filtered.length === 0 ? (
        <div className="text-center text-blue-400 py-16">
          <p className="text-5xl mb-4">📖</p>
          <p className="text-base">Keine Verse gefunden.</p>
          {filter === 'all' && search === '' && (
            <Link
              href="/verse/add"
              className="mt-4 inline-block text-blue-600 underline text-sm"
            >
              Ersten Vers hinzufügen
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((verse) => (
            <VerseCard key={verse.id} verse={verse} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
