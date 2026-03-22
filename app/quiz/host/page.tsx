'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuizSet } from '@/lib/quiz-types';

export default function HostSetupPage() {
  const router = useRouter();
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/quiz/sets')
      .then((r) => r.json())
      .then((d) => {
        setSets(d.sets ?? []);
        if (d.sets?.length > 0) setSelected(d.sets[0].id);
      })
      .catch(() => setError('Fehler beim Laden der Quiz-Sets.'))
      .finally(() => setLoading(false));
  }, []);

  const createRoom = useCallback(async () => {
    if (!selected) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizSetId: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Erstellen des Raums.');
        return;
      }
      // Store hostId in sessionStorage for the host panel
      sessionStorage.setItem(`quiz-host-${data.code}`, data.hostId);
      router.push(`/quiz/host/${data.code}`);
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setCreating(false);
    }
  }, [selected, router]);

  const categoryColors: Record<string, string> = {
    AT: 'bg-amber-100 text-amber-800',
    NT: 'bg-blue-100 text-blue-800',
    Evangelien: 'bg-green-100 text-green-800',
    Psalmen: 'bg-purple-100 text-purple-800',
    Paulus: 'bg-indigo-100 text-indigo-800',
    Propheten: 'bg-orange-100 text-orange-800',
    Gemischt: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="flex flex-col gap-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Spiel erstellen</h1>
        <p className="text-blue-500 text-sm">Wähle ein Quiz-Set für dein Spiel</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map((set) => (
            <button
              key={set.id}
              onClick={() => setSelected(set.id)}
              className={`text-left bg-white rounded-2xl border-2 p-4 transition-all active:scale-[0.97] ${
                selected === set.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-blue-100 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColors[set.category] ?? 'bg-slate-100 text-slate-700'}`}>
                      {set.category}
                    </span>
                    <span className="text-xs text-blue-400">{set.questions.length} Fragen</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{set.title}</p>
                  {set.description && (
                    <p className="text-blue-400 text-xs mt-0.5 leading-snug line-clamp-2">{set.description}</p>
                  )}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                  selected === set.id ? 'border-blue-500 bg-blue-500' : 'border-blue-200'
                }`}>
                  {selected === set.id && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-3 px-4">{error}</p>
      )}

      <button
        onClick={createRoom}
        disabled={!selected || creating || loading}
        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold px-6 py-4 rounded-2xl transition-colors active:scale-[0.97] text-lg"
      >
        {creating ? 'Erstelle Raum...' : 'Raum erstellen →'}
      </button>
    </div>
  );
}
