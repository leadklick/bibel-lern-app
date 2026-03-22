'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizLandingPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Bitte gib einen 6-stelligen Raumcode ein.');
      return;
    }
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`/api/quiz/rooms/${code}`);
      if (!res.ok) {
        setError('Raum nicht gefunden. Überprüfe den Code und versuche es erneut.');
        return;
      }
      router.push(`/quiz/${code}`);
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Header */}
      <div className="text-center py-2">
        <div className="text-5xl mb-3">🎮</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">BibelQuiz</h1>
        <p className="text-blue-500 text-sm">Teste dein Bibelwissen!</p>
      </div>

      {/* Solo card — most prominent */}
      <div className="bg-gradient-to-br from-slate-900 to-amber-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-3xl mb-3">🎯</div>
        <h2 className="text-xl font-bold mb-1">Alleine spielen</h2>
        <p className="text-amber-200 text-sm mb-4 leading-relaxed">
          10 Quiz-Sets bereit — von AT bis NT. Wähle eines und leg sofort los!
        </p>
        <Link
          href="/quiz/solo"
          className="block bg-white text-slate-900 font-bold px-6 py-3 rounded-xl text-center text-sm hover:bg-amber-50 transition-colors active:scale-[0.97]"
        >
          Quiz starten →
        </Link>
      </div>

      {/* Multiplayer section */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
        <p className="text-xs text-blue-400 uppercase font-semibold tracking-widest mb-4">Mit Freunden spielen</p>

        {/* Host */}
        <Link
          href="/quiz/host"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.97] border border-slate-100 mb-3"
        >
          <span className="text-2xl">👑</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Spiel erstellen</p>
            <p className="text-blue-400 text-xs">Raum öffnen & Code teilen</p>
          </div>
          <span className="ml-auto text-blue-300 text-lg">›</span>
        </Link>

        {/* Join */}
        <form onSubmit={handleJoin} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                setError('');
              }}
              placeholder="RAUMCODE"
              maxLength={6}
              className="flex-1 border border-blue-200 rounded-xl px-4 py-2.5 text-lg font-bold text-center tracking-widest text-slate-900 uppercase placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={joining || joinCode.length !== 6}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-5 py-2.5 rounded-xl transition-colors active:scale-[0.97] shrink-0"
            >
              {joining ? '...' : '🙋 Join'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </form>
      </div>

      {/* Admin link */}
      <div className="text-center">
        <Link
          href="/quiz/admin"
          className="text-blue-400 text-xs hover:text-blue-600 transition-colors"
        >
          Quiz-Sets verwalten ›
        </Link>
      </div>
    </div>
  );
}
