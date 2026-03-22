'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quiz/sets')
      .then(r => r.json())
      .then((data: QuizSet[]) => setSets(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5 page-enter">
      <div className="text-center py-2">
        <div className="text-4xl mb-2">🎮</div>
        <h1 className="text-2xl font-bold text-slate-900">BibelQuiz</h1>
        <p className="text-blue-500 text-sm mt-1">Wähle ein Quiz und teste dein Wissen!</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
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

      <div className="text-center">
        <Link href="/quiz/admin" className="text-blue-300 text-xs hover:text-blue-500 transition-colors">
          Quiz-Sets verwalten ›
        </Link>
      </div>
    </div>
  );
}
