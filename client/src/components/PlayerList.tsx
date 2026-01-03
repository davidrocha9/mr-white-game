import { Check, Mic, Skull, Clock } from 'lucide-react';
import type { ClientPlayer } from '../types';

interface PlayerListProps {
  players: ClientPlayer[];
  currentPlayerId: string;
  activePlayerIndex: number;
  phase: 'playing' | 'voting' | 'mrwhite-guess' | 'ended';
  onVote?: (playerId: string) => void;
  myId: string;
  hasVoted: boolean;
}

export function PlayerList({
  players,
  currentPlayerId,
  activePlayerIndex,
  phase,
  onVote,
  myId,
  hasVoted,
}: PlayerListProps) {
  const alivePlayers = players.filter(p => p.isAlive);
  const activePlayer = alivePlayers[activePlayerIndex];

  return (
    <div className="space-y-2">
      {players.map((player, index) => {
        const isActive = phase === 'playing' && activePlayer?.id === player.id;
        const isMe = player.id === myId;
        const canVote = phase === 'voting' && !hasVoted && player.isAlive && !isMe;

        return (
          <div
            key={player.id}
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
              !player.isAlive
                ? 'bg-gray-900/50 opacity-50'
                : isActive
                ? 'bg-mr-accent/20 border-2 border-mr-accent'
                : 'bg-mr-dark'
            }`}
          >
            <div className="flex items-center gap-3">
              {!player.isAlive && <Skull className="w-5 h-5 text-gray-500" />}
              {player.isAlive && isActive && (
                <Mic className="w-5 h-5 text-mr-accent animate-pulse" />
              )}
              {player.isAlive && !isActive && phase === 'playing' && player.hasPlayedThisRound && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {player.isAlive && !isActive && phase === 'playing' && !player.hasPlayedThisRound && (
                <Clock className="w-5 h-5 text-gray-500" />
              )}
              {phase === 'voting' && player.isAlive && (
                player.hasVoted ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )
              )}
              
              <span className={`font-medium ${!player.isAlive ? 'line-through' : ''}`}>
                {player.name}
                {isMe && <span className="text-mr-accent ml-2">(You)</span>}
              </span>
            </div>

            {canVote && onVote && (
              <button
                onClick={() => onVote(player.id)}
                className="btn-primary py-2 px-4 text-sm"
              >
                Vote
              </button>
            )}

            {phase === 'voting' && player.hasVoted && (
              <span className="text-green-400 text-sm">Voted</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
