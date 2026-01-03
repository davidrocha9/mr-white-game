import { useGameConnection } from './useGameConnection';
import { HomeScreen } from './components/HomeScreen';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { MrWhiteGuess } from './components/MrWhiteGuess';
import { GameResults } from './components/GameResults';
import { AlertCircle } from 'lucide-react';

function App() {
  const game = useGameConnection();

  // Error toast
  const ErrorToast = () => {
    if (!game.error) return null;
    return (
      <div className="fixed top-4 right-4 bg-red-900 border border-red-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg z-50 animate-pulse">
        <AlertCircle className="w-5 h-5" />
        {game.error}
      </div>
    );
  };

  // Not in a room yet
  if (!game.roomCode || !game.playerId || !game.gameState) {
    return (
      <>
        <ErrorToast />
        <HomeScreen
          onCreateRoom={game.createRoom}
          onJoinRoom={game.joinRoom}
          connected={game.connected}
        />
      </>
    );
  }

  // Lobby phase
  if (game.gameState.phase === 'lobby') {
    return (
      <>
        <ErrorToast />
        <Lobby
          gameState={game.gameState}
          playerId={game.playerId}
          onStartGame={game.startGame}
          onLeave={game.leaveRoom}
        />
      </>
    );
  }

  // Mr. White guessing phase
  if (game.gameState.phase === 'mrwhite-guess') {
    return (
      <>
        <ErrorToast />
        <MrWhiteGuess
          onGuess={game.mrWhiteGuess}
          isMrWhite={game.myRole === 'mrwhite'}
        />
      </>
    );
  }

  // Game ended
  if (game.gameState.phase === 'ended') {
    return (
      <>
        <ErrorToast />
        <GameResults
          gameState={game.gameState}
          playerId={game.playerId}
          onRestart={game.restartGame}
        />
      </>
    );
  }

  // Playing or voting phase
  if (game.myRole) {
    return (
      <>
        <ErrorToast />
        <GameBoard
          gameState={game.gameState}
          playerId={game.playerId}
          myRole={game.myRole}
          myWord={game.myWord}
          onEndTurn={game.endTurn}
          onVote={game.vote}
        />
      </>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <div className="animate-spin w-8 h-8 border-4 border-mr-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading game...</p>
      </div>
    </div>
  );
}

export default App;
