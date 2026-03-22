'use client';

import { Player } from '@/lib/quiz-types';

interface PlayerListProps {
  players: Player[];
  highlightId?: string;
  showScores?: boolean;
}

export default function PlayerList({ players, highlightId, showScores = false }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-6 text-blue-400 text-sm">
        Noch keine Spieler beigetreten...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            player.id === highlightId
              ? 'bg-amber-100 border border-amber-300 text-amber-900'
              : 'bg-blue-50 border border-blue-100 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{player.lastAnswerCorrect === true ? '✅' : player.lastAnswerCorrect === false ? '❌' : '👤'}</span>
            <span className="truncate">{player.nickname}</span>
            {player.streak >= 2 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                🔥{player.streak}
              </span>
            )}
          </div>
          {showScores && (
            <span className="font-bold shrink-0 ml-2">{player.score.toLocaleString()}</span>
          )}
        </div>
      ))}
    </div>
  );
}
