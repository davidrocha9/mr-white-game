import { Copy, Play, Users, Crown, LogOut } from 'lucide-react';
import type { ClientGameState } from '../types';

interface LobbyProps {
  gameState: ClientGameState;
  playerId: string;
  onStartGame: () => void;
  onLeave: () => void;
}

export function Lobby({ gameState, playerId, onStartGame, onLeave }: LobbyProps) {
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;
  const canStart = gameState.players.length >= 3;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Room Code</h2>
            <button
              onClick={onLeave}
              className="text-gray-400 hover:text-mr-accent transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-mr-darker px-6 py-4 rounded-lg text-3xl font-mono font-bold tracking-widest flex-1 text-center">
              {gameState.roomCode}
            </div>
            <button
              onClick={copyRoomCode}
              className="btn-secondary p-4"
              title="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3 text-center">
            Share this code with your friends
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-mr-accent" />
            Players ({gameState.players.length})
          </h2>
          <div className="space-y-2">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === playerId ? 'bg-mr-secondary' : 'bg-mr-darker'
                }`}
              >
                <span className="font-medium">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-mr-accent ml-2">(You)</span>
                  )}
                </span>
                {player.isHost && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="w-full btn-primary flex items-center justify-center gap-3 text-lg py-4"
          >
            <Play className="w-6 h-6" />
            {canStart ? 'Start Game' : `Need ${3 - gameState.players.length} more player(s)`}
          </button>
        ) : (
          <div className="text-center text-gray-400">
            <p>Waiting for host to start the game...</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Minimum 3 players required</p>
        </div>
      </div>
    </div>
  );
}
