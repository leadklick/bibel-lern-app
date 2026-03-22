'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizSet } from '@/lib/quiz-types';

const CATEGORY_COLORS: Record<string, string> = {
  AT: 'bg-amber-100 text-amber-800',
  NT: 'bg-blue-100 text-blue-800',
  Evangelien: 'bg-green-100 text-green-800',
  Psalmen: 'bg-purple-100 text-purple-800',
  Propheten: 'bg-orange-100 text-orange-800',
  Paulus: 'bg-cyan-100 text-cyan-800',
  Gemischt: 'bg-slate-100 text-slate-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  AT: '📜',
  NT: '✝️',
  Evangelien: '📖',
  Psalmen: '🎵',
  Propheten: '🔥',
  Paulus: '✉️',
  Gemischt: '🌍',
};

export default function QuizLandingPage() {
  const router = useRouter();
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/quiz/sets')
      .then(r => r.json())
      .then((data: QuizSet[]) => setSets(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) return;
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`/api/quiz/rooms/${code}`);
      if (!res.ok) { setError('Raum nicht gefunden.'); return; }
      router.push(`/quiz/${code}`);
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Header */}
      <div className="text-center py-2">
        <div className="text-4xl mb-2">🎮</div>
        <h1 className="text-2xl font-bold text-slate-900">BibelQuiz</h1>
        <p className="text-blue-500 text-sm mt-1">Wähle ein Quiz und spiele sofort!</p>
      </div>

      {/* Quiz sets list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0,1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map(set => (
            <Link
              key={set.id}
              href={`/quiz/solo?set=${set.id}`}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-4 hover:border-amber-300 hover:shadow-md transition-all active:scale-[0.97]"
            >
              <div className="text-3xl shrink-0">
                {CATEGORY_ICONS[set.category] ?? '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-sm">{set.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[set.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {set.category}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{set.questions.length} Fragen</p>
              </div>
              <span className="text-amber-400 text-xl font-bold shrink-0">▶</span>
            </Link>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-blue-100" />
        <span className="text-xs text-blue-300 font-medium">Mit Freunden spielen</span>
        <div className="flex-1 h-px bg-blue-100" />
      </div>

      {/* Multiplayer */}
      <div className="flex flex-col gap-3">
        <Link
          href="/quiz/host"
          className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.97]"
        >
          <span className="text-2xl">👑</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Spiel erstellen</p>
            <p className="text-blue-400 text-xs">Raum öffnen & Code teilen</p>
          </div>
          <span className="ml-auto text-blue-300 text-lg">›</span>
        </Link>

        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }}
            placeholder="RAUMCODE"
            maxLength={6}
            className="flex-1 border border-blue-200 rounded-xl px-4 py-2.5 text-base font-bold text-center tracking-widest uppercase placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={joining || joinCode.length !== 6}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-4 py-2.5 rounded-xl transition-colors active:scale-[0.97] shrink-0 text-sm"
          >
            {joining ? '...' : '🙋 Join'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>

      <div className="text-center">
        <Link href="/quiz/admin" className="text-blue-300 text-xs hover:text-blue-500 transition-colors">
          Quiz-Sets verwalten ›
        </Link>
      </div>
    </div>
  );
}
