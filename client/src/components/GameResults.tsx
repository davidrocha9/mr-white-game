import { Trophy, Users, Skull, Eye, RotateCcw, Crown } from 'lucide-react';
import type { ClientGameState, Role } from '../types';

interface GameResultsProps {
  gameState: ClientGameState;
  playerId: string;
  onRestart: () => void;
}

export function GameResults({ gameState, playerId, onRestart }: GameResultsProps) {
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = myPlayer?.isHost ?? false;

  const getWinnerInfo = () => {
    switch (gameState.winner) {
      case 'civilians':
        return {
          title: 'Civilians Win!',
          color: 'text-green-400',
          icon: <Users className="w-16 h-16" />,
          description: 'The civilians successfully identified the impostors!',
        };
      case 'undercover':
        return {
          title: 'Undercover Wins!',
          color: 'text-yellow-400',
          icon: <Skull className="w-16 h-16" />,
          description: 'The undercover agent eliminated all civilians!',
        };
      case 'mrwhite':
        return {
          title: 'Mr. White Wins!',
          color: 'text-red-400',
          icon: <Eye className="w-16 h-16" />,
          description: gameState.mrWhiteGuess 
            ? `Mr. White correctly guessed: "${gameState.mrWhiteGuess}"`
            : 'Mr. White survived until the end!',
        };
      default:
        return {
          title: 'Game Over',
          color: 'text-white',
          icon: <Trophy className="w-16 h-16" />,
          description: '',
        };
    }
  };

  const getRoleDisplay = (role: Role) => {
    switch (role) {
      case 'civilian':
        return { label: 'Civilian', color: 'text-green-400' };
      case 'undercover':
        return { label: 'Undercover', color: 'text-yellow-400' };
      case 'mrwhite':
        return { label: 'Mr. White', color: 'text-red-400' };
    }
  };

  const winner = getWinnerInfo();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Winner Announcement */}
        <div className="card text-center">
          <div className={`${winner.color} mb-4 flex justify-center`}>
            {winner.icon}
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${winner.color}`}>
            {winner.title}
          </h1>
          <p className="text-gray-400">{winner.description}</p>
        </div>

        {/* Role Reveal */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-mr-accent" />
            Role Reveal
          </h2>
          <div className="space-y-3">
            {gameState.players.map((player) => {
              const roleInfo = gameState.revealedRoles?.[player.id];
              const roleDisplay = roleInfo ? getRoleDisplay(roleInfo.role) : null;
              const isMe = player.id === playerId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isMe ? 'bg-mr-secondary' : 'bg-mr-darker'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {!player.isAlive && <Skull className="w-5 h-5 text-gray-500" />}
                    <span className={!player.isAlive ? 'line-through text-gray-500' : ''}>
                      {player.name}
                      {isMe && <span className="text-mr-accent ml-2">(You)</span>}
                    </span>
                  </div>
                  <div className="text-right">
                    {roleDisplay && (
                      <>
                        <span className={`font-bold ${roleDisplay.color}`}>
                          {roleDisplay.label}
                        </span>
                        {roleInfo?.word && (
                          <p className="text-sm text-gray-400">{roleInfo.word}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart Button */}
        {isHost ? (
          <button
            onClick={onRestart}
            className="w-full btn-primary flex items-center justify-center gap-3 text-lg py-4"
          >
            <RotateCcw className="w-6 h-6" />
            Play Again
          </button>
        ) : (
          <div className="text-center text-gray-400">
            <p>Waiting for host to start a new game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
