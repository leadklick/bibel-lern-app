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
    <div className="flex flex-col gap-6 page-enter">
      {/* Header */}
      <div className="text-center py-2">
        <div className="text-5xl mb-3">🎮</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Live Quiz</h1>
        <p className="text-blue-500 text-sm">Lerne die Bibel im Kahoot-Stil mit Freunden!</p>
      </div>

      {/* Host card */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-3xl mb-3">👑</div>
        <h2 className="text-xl font-bold mb-1">Spiel erstellen</h2>
        <p className="text-blue-200 text-sm mb-4 leading-relaxed">
          Wähle ein Quiz aus, erstelle einen Raum und teile den Code mit deinen Freunden.
        </p>
        <Link
          href="/quiz/host"
          className="block bg-white text-slate-900 font-bold px-6 py-3 rounded-xl text-center text-sm hover:bg-blue-50 transition-colors active:scale-[0.97]"
        >
          Neues Spiel erstellen →
        </Link>
      </div>

      {/* Join card */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <div className="text-3xl mb-3">🙋</div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Spiel beitreten</h2>
        <p className="text-blue-500 text-sm mb-4">
          Hast du einen Raumcode? Gib ihn hier ein!
        </p>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setError('');
            }}
            placeholder="RAUMCODE"
            maxLength={6}
            className="w-full border border-blue-200 rounded-xl px-4 py-3 text-2xl font-bold text-center tracking-widest text-slate-900 uppercase placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={joining || joinCode.length !== 6}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-6 py-3 rounded-xl transition-colors active:scale-[0.97]"
          >
            {joining ? 'Verbinde...' : 'Beitreten →'}
          </button>
        </form>
      </div>

      {/* Admin link */}
      <div className="text-center">
        <Link
          href="/quiz/admin"
          className="text-blue-400 text-sm hover:text-blue-600 transition-colors underline"
        >
          Quiz-Sets verwalten
        </Link>
      </div>
    </div>
  );
}
