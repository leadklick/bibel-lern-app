'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVerses, deleteVerse } from '@/lib/storage';
import { Verse } from '@/lib/types';
import VerseCard from '@/components/VerseCard';
import { isDueToday, isMastered } from '@/lib/sm2';
import Toast from '@/components/Toast';

export default function VersePage() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [filter, setFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [search, setSearch] = useState('');
  const [translationFilter, setTranslationFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  useEffect(() => {
    setVerses(getVerses());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-5 page-enter">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-36 rounded-xl" />
          <div className="skeleton h-10 w-32 rounded-full" />
        </div>
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-10 rounded-full" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (confirm('Vers wirklich löschen?')) {
      deleteVerse(id);
      setVerses(getVerses());
      setShowDeleteToast(true);
    }
  };

  // Collect unique translations present in the verse list
  const availableTranslations = Array.from(
    new Set(verses.map((v) => v.translation).filter(Boolean) as string[])
  ).sort();

  const filtered = verses
    .filter((v) => {
      if (filter === 'due') return isDueToday(v);
      if (filter === 'mastered') return isMastered(v);
      return true;
    })
    .filter((v) => {
      if (translationFilter === 'all') return true;
      return (v.translation ?? '') === translationFilter;
    })
    .filter(
      (v) =>
        v.reference.toLowerCase().includes(search.toLowerCase()) ||
        v.text.toLowerCase().includes(search.toLowerCase()) ||
        v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

  // Group by tag when showing all with no search/translation filter
  const shouldGroup =
    filter === 'all' && search === '' && translationFilter === 'all';

  // Build grouped structure
  const groups: { tag: string; verses: Verse[] }[] = [];
  if (shouldGroup && filtered.length > 0) {
    const tagMap = new Map<string, Verse[]>();
    const noTag: Verse[] = [];
    for (const v of filtered) {
      if (v.tags.length === 0) {
        noTag.push(v);
      } else {
        // Use first tag as group key
        const tag = v.tags[0];
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag)!.push(v);
      }
    }
    for (const [tag, vvs] of tagMap) {
      groups.push({ tag, verses: vvs });
    }
    if (noTag.length > 0) {
      groups.push({ tag: 'Weitere Verse', verses: noTag });
    }
    groups.sort((a, b) => a.tag.localeCompare(b.tag, 'de'));
  }

  const dueCount = verses.filter(isDueToday).length;
  const masteredCount = verses.filter(isMastered).length;

  return (
    <div className="flex flex-col gap-5 page-enter">
      {showDeleteToast && (
        <Toast
          message="Vers gelöscht"
          type="info"
          onDone={() => setShowDeleteToast(false)}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Meine Verse</h1>
        <Link
          href="/verse/add"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors min-h-[44px] flex items-center active:scale-95"
        >
          + Hinzufügen
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Suchen nach Bibelstelle, Text oder Tag…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white min-h-[48px]"
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            ['all', 'Alle', verses.length],
            ['due', 'Fällig', dueCount],
            ['mastered', 'Gemeistert', masteredCount],
          ] as const
        ).map(([value, label, count]) => (
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
            <span
              className={`ml-1.5 text-xs font-medium rounded-full px-1.5 py-0.5 ${
                filter === value
                  ? 'bg-blue-500 text-blue-100'
                  : 'bg-blue-100 text-blue-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Translation filter — only shown when multiple translations exist */}
      {availableTranslations.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTranslationFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
              translationFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            Alle Übersetzungen
          </button>
          {availableTranslations.map((t) => (
            <button
              key={t}
              onClick={() => setTranslationFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[36px] ${
                translationFilter === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Verse list */}
      {filtered.length === 0 ? (
        <EmptyState filter={filter} search={search} translationFilter={translationFilter} />
      ) : shouldGroup ? (
        // Grouped view
        <div className="flex flex-col gap-6">
          {groups.map(({ tag, verses: groupVerses }) => (
            <div key={tag} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                  {tag}
                </span>
                <span className="text-xs text-blue-300 font-medium">
                  {groupVerses.length}
                </span>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              <div className="flex flex-col gap-3">
                {groupVerses.map((verse) => (
                  <VerseCard key={verse.id} verse={verse} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
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

function EmptyState({
  filter,
  search,
  translationFilter,
}: {
  filter: 'all' | 'due' | 'mastered';
  search: string;
  translationFilter: string;
}) {
  if (filter === 'all' && search === '' && translationFilter === 'all') {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
          📖
        </div>
        <div>
          <p className="text-blue-800 font-bold text-xl mb-1">Noch keine Verse</p>
          <p className="text-blue-400 text-sm">
            Füge deinen ersten Bibelvers hinzu und starte deine Lernreise.
          </p>
        </div>
        <Link
          href="/verse/add"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors min-h-[48px] flex items-center active:scale-95"
        >
          Ersten Vers hinzufügen →
        </Link>
      </div>
    );
  }

  if (filter === 'due') {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl">
          ✅
        </div>
        <p className="text-green-700 font-bold text-xl">Alles erledigt!</p>
        <p className="text-green-600 text-sm">Keine fälligen Verse für heute.</p>
      </div>
    );
  }

  if (filter === 'mastered') {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl">
          🏆
        </div>
        <p className="text-blue-800 font-bold text-xl">Noch nichts gemeistert</p>
        <p className="text-blue-400 text-sm">
          Lerne regelmäßig und du wirst bald Verse meistern!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-blue-400 py-16">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-base">Keine Verse gefunden.</p>
    </div>
  );
}
