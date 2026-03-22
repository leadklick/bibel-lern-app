'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { RoomPublicView } from '@/lib/quiz-types';
import AnswerButton from '@/components/quiz/AnswerButton';
import TimerBar from '@/components/quiz/TimerBar';
import PlayerList from '@/components/quiz/PlayerList';
import Leaderboard from '@/components/quiz/Leaderboard';

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

export default function HostControlPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<RoomPublicView | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  // Get hostId from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem(`quiz-host-${code}`);
    if (!id) {
      // Maybe they navigated directly — redirect to host setup
      router.replace('/quiz/host');
      return;
    }
    setHostId(id);
  }, [code, router]);

  const fetchRoom = useCallback(async () => {
    if (!hostId) return;
    try {
      const res = await fetch(`/api/quiz/rooms/${code}`);
      if (!res.ok) {
        setError('Raum nicht gefunden.');
        return;
      }
      const data = await res.json();
      setRoom(data.room);
    } catch {
      // ignore network errors during poll
    }
  }, [code, hostId]);

  useEffect(() => {
    if (!hostId) return;
    fetchRoom();
    const interval = setInterval(fetchRoom, 1000);
    return () => clearInterval(interval);
  }, [hostId, fetchRoom]);

  const doAction = useCallback(async (action: string) => {
    if (!hostId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quiz/rooms/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoom(data.room);
      } else {
        setError(data.error ?? 'Fehler beim Ausführen der Aktion.');
      }
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setActionLoading(false);
    }
  }, [code, hostId]);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  };

  if (!hostId || !room) {
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="skeleton h-12 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const answeredCount = Object.keys(room.answers).length;
  const playerCount = room.playerCount;
  const q = room.currentQuestion;

  return (
    <div className="flex flex-col gap-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Host-Panel</h1>
          <p className="text-blue-400 text-xs">{room.players.length} Spieler verbunden</p>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-mono font-bold text-xl tracking-widest hover:bg-slate-700 transition-colors active:scale-[0.97]"
        >
          {code}
          <span className="text-xs font-sans font-normal">{copyDone ? '✓ Kopiert' : '📋'}</span>
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl py-2 px-4 text-center">{error}</p>
      )}

      {/* ── LOBBY ── */}
      {room.state === 'lobby' && (
        <>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 text-center">
            <p className="text-4xl mb-2">⏳</p>
            <p className="text-slate-900 font-bold text-xl mb-1">Warte auf Spieler...</p>
            <p className="text-blue-500 text-sm mb-4">Teile den Code, damit Spieler beitreten können.</p>
            <div className="bg-slate-900 text-white rounded-2xl px-8 py-4 inline-block font-mono font-extrabold text-4xl tracking-widest mb-4">
              {code}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <h3 className="font-bold text-blue-800 mb-3">Verbundene Spieler ({playerCount})</h3>
            <PlayerList players={room.players} />
          </div>
          <button
            onClick={() => doAction('start')}
            disabled={actionLoading || playerCount === 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-200 text-white font-bold px-6 py-4 rounded-2xl text-lg transition-colors active:scale-[0.97]"
          >
            {actionLoading ? 'Starte...' : `Spiel starten (${playerCount} Spieler) →`}
          </button>
        </>
      )}

      {/* ── QUESTION ── */}
      {room.state === 'question' && q && (
        <>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <div className="flex items-center justify-between text-xs text-blue-400 mb-3">
              <span>Frage {room.currentQuestionIndex + 1} / {room.totalQuestions}</span>
              <span className="font-bold">{answeredCount} / {playerCount} geantwortet</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-1.5 mb-4">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: playerCount > 0 ? `${(answeredCount / playerCount) * 100}%` : '0%' }}
              />
            </div>
            <TimerBar
              questionStartedAt={room.questionStartedAt}
              timeLimit={room.timeLimit}
            />
            <p className="mt-4 text-lg font-bold text-slate-900 leading-snug">{q.text}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {q.answers.map((ans, i) => (
              <div key={i} className="pointer-events-none">
                <AnswerButton
                  label={ans}
                  index={i as 0 | 1 | 2 | 3}
                  disabled
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => doAction('revealAnswer')}
            disabled={actionLoading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-bold px-6 py-4 rounded-2xl text-lg transition-colors active:scale-[0.97]"
          >
            {actionLoading ? 'Lädt...' : 'Antwort zeigen →'}
          </button>
        </>
      )}

      {/* ── REVEAL ── */}
      {room.state === 'reveal' && q && (
        <>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
              <span>Frage {room.currentQuestionIndex + 1} / {room.totalQuestions}</span>
              <span className="font-bold text-green-600">
                {Object.values(room.answers).filter((a) => a.correct).length} richtig
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-snug mb-4">{q.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.answers.map((ans, i) => (
                <div key={i} className="pointer-events-none">
                  <AnswerButton
                    label={ans}
                    index={i as 0 | 1 | 2 | 3}
                    correct={i === room.currentQuestionCorrect}
                    revealed
                    disabled
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
            <h3 className="font-bold text-blue-800 text-sm mb-2">Spieler</h3>
            <PlayerList players={room.players} showScores />
          </div>
          <button
            onClick={() => doAction('showLeaderboard')}
            disabled={actionLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-6 py-4 rounded-2xl text-lg transition-colors active:scale-[0.97]"
          >
            {actionLoading ? 'Lädt...' : 'Bestenliste anzeigen →'}
          </button>
        </>
      )}

      {/* ── LEADERBOARD ── */}
      {room.state === 'leaderboard' && (
        <>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 text-xl text-center mb-4">🏆 Bestenliste</h2>
            <Leaderboard players={room.players} />
          </div>
          <button
            onClick={() => doAction('nextQuestion')}
            disabled={actionLoading}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold px-6 py-4 rounded-2xl text-lg transition-colors active:scale-[0.97]"
          >
            {actionLoading ? 'Lädt...' : (
              room.currentQuestionIndex + 1 < room.totalQuestions
                ? `Nächste Frage (${room.currentQuestionIndex + 2}/${room.totalQuestions}) →`
                : 'Spiel beenden →'
            )}
          </button>
        </>
      )}

      {/* ── FINISHED ── */}
      {room.state === 'finished' && (
        <>
          <div className="bg-gradient-to-br from-slate-900 to-amber-700 rounded-2xl p-6 text-white text-center">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Spiel beendet!</h2>
            <p className="text-amber-200 text-sm">Glückwunsch an alle Teilnehmer!</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 text-xl text-center mb-4">🏆 Endergebnis</h2>
            <Leaderboard players={room.players} />
          </div>
          <button
            onClick={() => router.push('/quiz/host')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl text-lg transition-colors active:scale-[0.97]"
          >
            Neues Spiel erstellen →
          </button>
        </>
      )}

      {/* Side panel: answer breakdown on question state */}
      {(room.state === 'question' || room.state === 'reveal') && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mt-2">
          <h3 className="font-bold text-blue-800 text-sm mb-3">Antwortverteilung</h3>
          <div className="flex gap-2">
            {ANSWER_LABELS.map((label, i) => {
              const count = Object.values(room.answers).filter((a) => a.answerIndex === i).length;
              const pct = playerCount > 0 ? (count / playerCount) * 100 : 0;
              const bgColors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="h-16 w-full bg-slate-100 rounded-lg relative flex items-end overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 right-0 ${bgColors[i]} transition-all`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="relative z-10 w-full text-center text-xs font-bold pb-1">{count}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
