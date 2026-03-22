'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { RoomPublicView } from '@/lib/quiz-types';
import AnswerButton from '@/components/quiz/AnswerButton';
import TimerBar from '@/components/quiz/TimerBar';
import PlayerList from '@/components/quiz/PlayerList';
import Leaderboard from '@/components/quiz/Leaderboard';
import { saveQuizResult } from '@/lib/quiz-storage';

export default function PlayerPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [room, setRoom] = useState<RoomPublicView | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [roomError, setRoomError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [resultSaved, setResultSaved] = useState(false);

  // Restore playerId from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-player-${code}`);
    if (stored) {
      setPlayerId(stored);
    }
  }, [code]);

  const fetchRoom = useCallback(async () => {
    try {
      const query = playerId ? `?playerId=${playerId}` : '';
      const res = await fetch(`/api/quiz/rooms/${code}${query}`);
      if (!res.ok) {
        setRoomError('Raum nicht gefunden.');
        return;
      }
      const data = await res.json();
      setRoom(data.room);
    } catch {
      // ignore during poll
    }
  }, [code, playerId]);

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 1500);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setLastPoints(null);
  }, [room?.currentQuestionIndex]);

  // Save result when game finishes
  useEffect(() => {
    if (room?.state === 'finished' && playerId && !resultSaved) {
      const me = room.players.find((p) => p.id === playerId);
      if (me) {
        const rank = room.players.findIndex((p) => p.id === playerId) + 1;
        saveQuizResult({
          id: `result-${Date.now()}`,
          roomCode: code,
          quizSetTitle: room.code,
          date: Date.now(),
          score: me.score,
          rank,
          totalPlayers: room.playerCount,
        });
        setResultSaved(true);
      }
    }
  }, [room?.state, playerId, room, code, resultSaved]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`/api/quiz/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error ?? 'Fehler beim Beitreten.');
        return;
      }
      setPlayerId(data.playerId);
      setRoom(data.room);
      sessionStorage.setItem(`quiz-player-${code}`, data.playerId);
    } catch {
      setJoinError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setJoining(false);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!playerId || submitting || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/rooms/${code}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, answerIndex }),
      });
      const data = await res.json();
      if (res.ok) {
        setLastPoints(data.points);
        setRoom(data.room);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not joined yet ─────────────────────────────────────────────────────────
  if (!playerId) {
    return (
      <div className="flex flex-col gap-6 page-enter">
        <div className="text-center py-2">
          <div className="text-4xl mb-2">🎮</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Quiz beitreten</h1>
          <div className="bg-slate-900 text-white rounded-xl px-4 py-2 inline-block font-mono font-bold text-2xl tracking-widest mt-1">
            {code}
          </div>
        </div>

        {roomError && (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-3 px-4">{roomError}</p>
        )}

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-blue-800 mb-1 block">Dein Spitzname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="Max Mustermann"
                maxLength={20}
                autoFocus
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-blue-300 mt-1">{nickname.length}/20 Zeichen</p>
            </div>
            {joinError && <p className="text-red-500 text-sm text-center">{joinError}</p>}
            <button
              type="submit"
              disabled={joining || !nickname.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-6 py-3 rounded-xl transition-colors active:scale-[0.97]"
            >
              {joining ? 'Verbinde...' : 'Beitreten →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="skeleton h-12 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  const me = room.players.find((p) => p.id === playerId);
  const myAnswer = room.answers[playerId];
  const q = room.currentQuestion;

  // ── LOBBY ─────────────────────────────────────────────────────────────────
  if (room.state === 'lobby') {
    return (
      <div className="flex flex-col gap-6 page-enter">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">⏳</p>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Warte auf den Host...</h1>
          <p className="text-blue-500 text-sm mb-4">Das Spiel beginnt gleich!</p>
          <div className="bg-slate-100 rounded-xl px-6 py-3 inline-block font-mono font-extrabold text-3xl tracking-widest text-slate-900 mb-2">
            {code}
          </div>
          {me && (
            <p className="text-green-600 font-semibold text-sm mt-2">Du: {me.nickname}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <h3 className="font-bold text-blue-800 mb-3 text-sm">Spieler im Raum ({room.playerCount})</h3>
          <PlayerList players={room.players} highlightId={playerId ?? undefined} />
        </div>
      </div>
    );
  }

  // ── QUESTION ─────────────────────────────────────────────────────────────
  if (room.state === 'question' && q) {
    const hasAnswered = !!myAnswer || selectedAnswer !== null;
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
          <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
            <span>Frage {room.currentQuestionIndex + 1} / {room.totalQuestions}</span>
            {me && <span className="font-bold text-slate-700">{me.score.toLocaleString()} Punkte</span>}
          </div>
          <TimerBar
            questionStartedAt={room.questionStartedAt}
            timeLimit={room.timeLimit}
          />
          <p className="mt-4 text-lg font-bold text-slate-900 leading-snug">{q.text}</p>
        </div>

        {hasAnswered ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-blue-800 text-lg">Antwort eingereicht!</p>
            <p className="text-blue-500 text-sm mt-1">Warte auf die anderen Spieler...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {q.answers.map((ans, i) => (
              <AnswerButton
                key={i}
                label={ans}
                index={i as 0 | 1 | 2 | 3}
                selected={selectedAnswer === i}
                disabled={hasAnswered || submitting}
                onClick={() => handleAnswer(i)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── REVEAL ───────────────────────────────────────────────────────────────
  if (room.state === 'reveal' && q) {
    const wasCorrect = myAnswer?.correct ?? false;
    const pointsEarned = myAnswer?.points ?? lastPoints ?? 0;
    const selectedIdx = myAnswer?.answerIndex ?? selectedAnswer;

    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className={`rounded-2xl p-6 text-center ${wasCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-4xl mb-2">{wasCorrect ? '🎉' : '😔'}</p>
          <p className={`font-bold text-xl ${wasCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {wasCorrect ? 'Richtig!' : 'Falsch!'}
          </p>
          {wasCorrect && (
            <p className="text-green-600 font-bold text-2xl mt-1">+{pointsEarned} Punkte</p>
          )}
          {me && me.streak >= 2 && wasCorrect && (
            <p className="text-orange-500 font-bold text-sm mt-1">🔥 {me.streak}er Streak!</p>
          )}
          {me && (
            <p className="text-slate-600 text-sm mt-2">Gesamt: {me.score.toLocaleString()} Punkte</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
          <p className="text-sm text-blue-400 mb-2 font-medium">Frage {room.currentQuestionIndex + 1}</p>
          <p className="font-bold text-slate-900 mb-4 leading-snug">{q.text}</p>
          <div className="flex flex-col gap-2">
            {q.answers.map((ans, i) => (
              <div key={i} className="pointer-events-none">
                <AnswerButton
                  label={ans}
                  index={i as 0 | 1 | 2 | 3}
                  selected={selectedIdx === i}
                  correct={i === room.currentQuestionCorrect}
                  revealed
                  disabled
                />
              </div>
            ))}
          </div>
          {q.explanation && (
            <p className="text-blue-600 text-sm mt-3 bg-blue-50 rounded-xl p-3 leading-relaxed">
              💡 {q.explanation}
            </p>
          )}
        </div>

        <p className="text-center text-blue-400 text-sm">Warte auf den Host...</p>
      </div>
    );
  }

  // ── LEADERBOARD ─────────────────────────────────────────────────────────
  if (room.state === 'leaderboard') {
    const myRank = room.players.findIndex((p) => p.id === playerId) + 1;
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-xl text-center mb-1">🏆 Bestenliste</h2>
          {me && (
            <p className="text-center text-blue-500 text-sm mb-4">
              Du bist auf Platz {myRank} mit {me.score.toLocaleString()} Punkten
            </p>
          )}
          <Leaderboard players={room.players} highlightId={playerId ?? undefined} />
        </div>
        <p className="text-center text-blue-400 text-sm">Warte auf die nächste Frage...</p>
      </div>
    );
  }

  // ── FINISHED ─────────────────────────────────────────────────────────────
  if (room.state === 'finished') {
    const myRank = room.players.findIndex((p) => p.id === playerId) + 1;
    const medal = myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎖️';

    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="bg-gradient-to-br from-slate-900 to-amber-700 rounded-2xl p-6 text-white text-center">
          <p className="text-5xl mb-2">{medal}</p>
          <h2 className="text-2xl font-bold mb-1">Spiel beendet!</h2>
          {me && (
            <>
              <p className="text-amber-200 text-sm">Platz {myRank} von {room.playerCount}</p>
              <p className="text-3xl font-extrabold mt-2">{me.score.toLocaleString()} Punkte</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-xl text-center mb-4">Endergebnis</h2>
          <Leaderboard players={room.players} highlightId={playerId ?? undefined} />
        </div>
        <a
          href="/quiz"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl text-lg text-center transition-colors active:scale-[0.97] block"
        >
          Zurück zum Menü →
        </a>
      </div>
    );
  }

  return null;
}
