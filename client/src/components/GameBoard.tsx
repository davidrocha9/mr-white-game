import { MessageCircle, Users, Vote, Target } from 'lucide-react';
import type { ClientGameState, Role } from '../types';
import { RoleCard } from './RoleCard';
import { PlayerList } from './PlayerList';

interface GameBoardProps {
  gameState: ClientGameState;
  playerId: string;
  myRole: Role;
  myWord: string | null;
  onEndTurn: () => void;
  onVote: (targetId: string) => void;
}

export function GameBoard({
  gameState,
  playerId,
  myRole,
  myWord,
  onEndTurn,
  onVote,
}: GameBoardProps) {
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const activePlayer = alivePlayers[gameState.currentPlayerIndex];
  const isMyTurn = activePlayer?.id === playerId;
  const hasVoted = myPlayer?.hasVoted ?? false;

  const getPhaseTitle = () => {
    switch (gameState.phase) {
      case 'playing':
        return `Round ${gameState.round} - Speaking`;
      case 'voting':
        return `Round ${gameState.round} - Voting`;
      case 'mrwhite-guess':
        return 'Mr. White Guessing';
      default:
        return 'Game';
    }
  };

  const getPhaseIcon = () => {
    switch (gameState.phase) {
      case 'playing':
        return <MessageCircle className="w-6 h-6" />;
      case 'voting':
        return <Vote className="w-6 h-6" />;
      case 'mrwhite-guess':
        return <Target className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-mr-accent">{getPhaseIcon()}</div>
            <div>
              <h1 className="text-xl font-bold">{getPhaseTitle()}</h1>
              <p className="text-gray-400 text-sm">Room: {gameState.roomCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Players Alive</p>
            <p className="text-2xl font-bold">{alivePlayers.length}/{gameState.players.length}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Role & Action */}
        <div className="space-y-6">
          <RoleCard role={myRole} word={myWord} />

          {/* Current Turn Info */}
          {gameState.phase === 'playing' && (
            <div className="card">
              {isMyTurn ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-mr-accent text-lg font-bold animate-pulse">
                      🎤 It's your turn!
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Describe your word in Discord, then click the button below
                    </p>
                  </div>
                  <button
                    onClick={onEndTurn}
                    className="w-full btn-primary text-lg py-4"
                  >
                    End My Turn
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Currently speaking:</p>
                  <p className="text-xl font-bold mt-2">{activePlayer?.name}</p>
                  <p className="text-gray-500 text-sm mt-2">Wait for your turn...</p>
                </div>
              )}
            </div>
          )}

          {/* Voting Info */}
          {gameState.phase === 'voting' && (
            <div className="card">
              <div className="text-center">
                {hasVoted ? (
                  <>
                    <p className="text-green-400 font-bold">Vote submitted!</p>
                    <p className="text-gray-400 text-sm mt-2">Waiting for others...</p>
                  </>
                ) : (
                  <>
                    <p className="text-yellow-400 font-bold">Time to vote!</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Select a player to eliminate
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Players */}
        <div>
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-mr-accent" />
              Players
            </h2>
            <PlayerList
              players={gameState.players}
              currentPlayerId={playerId}
              activePlayerIndex={gameState.currentPlayerIndex}
              phase={gameState.phase as 'playing' | 'voting' | 'mrwhite-guess' | 'ended'}
              onVote={gameState.phase === 'voting' ? onVote : undefined}
              myId={playerId}
              hasVoted={hasVoted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
