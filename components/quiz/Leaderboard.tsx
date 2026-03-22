'use client';

import { Player } from '@/lib/quiz-types';

interface LeaderboardProps {
  players: Player[];
  highlightId?: string;
}

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM_BG = [
  'bg-gradient-to-b from-yellow-50 to-amber-50 border-yellow-300',
  'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-300',
  'bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200',
];

export default function Leaderboard({ players, highlightId }: LeaderboardProps) {
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="flex flex-col gap-4">
      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2">
          {/* 2nd place */}
          {top3[1] && (
            <div className={`flex-1 flex flex-col items-center rounded-2xl border p-3 ${PODIUM_BG[1]} ${top3[1].id === highlightId ? 'ring-2 ring-blue-400' : ''}`}>
              <span className="text-2xl">🥈</span>
              <span className="font-bold text-sm text-center truncate max-w-full mt-1">{top3[1].nickname}</span>
              <span className="text-xs text-slate-600 font-semibold mt-0.5">{top3[1].score.toLocaleString()}</span>
            </div>
          )}
          {/* 1st place */}
          {top3[0] && (
            <div className={`flex-1 flex flex-col items-center rounded-2xl border p-3 pb-4 ${PODIUM_BG[0]} scale-105 origin-bottom ${top3[0].id === highlightId ? 'ring-2 ring-yellow-400' : ''}`}>
              <span className="text-3xl">🥇</span>
              <span className="font-bold text-sm text-center truncate max-w-full mt-1">{top3[0].nickname}</span>
              <span className="text-xs text-amber-700 font-bold mt-0.5">{top3[0].score.toLocaleString()}</span>
            </div>
          )}
          {/* 3rd place */}
          {top3[2] && (
            <div className={`flex-1 flex flex-col items-center rounded-2xl border p-3 ${PODIUM_BG[2]} ${top3[2].id === highlightId ? 'ring-2 ring-orange-400' : ''}`}>
              <span className="text-2xl">🥉</span>
              <span className="font-bold text-sm text-center truncate max-w-full mt-1">{top3[2].nickname}</span>
              <span className="text-xs text-orange-700 font-semibold mt-0.5">{top3[2].score.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {rest.map((player, i) => {
            const rank = i + 4;
            const isHighlighted = player.id === highlightId;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                  isHighlighted
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-blue-100 text-slate-700'
                }`}
              >
                <span className="w-6 text-center font-bold text-slate-400">{rank}</span>
                <span className="flex-1 truncate">{player.nickname}</span>
                {player.streak >= 2 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
                    🔥{player.streak}
                  </span>
                )}
                <span className="font-bold">{player.score.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-6 text-blue-400 text-sm">Keine Spieler</div>
      )}

      {/* Highlight own rank if not visible */}
      {highlightId && !top3.find((p) => p.id === highlightId) && !rest.find((p) => p.id === highlightId) && (
        <div className="text-center text-sm text-blue-400">Du bist nicht in der Liste</div>
      )}
    </div>
  );
}
