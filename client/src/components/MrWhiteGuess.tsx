import { useState } from 'react';
import { Target, Send } from 'lucide-react';

interface MrWhiteGuessProps {
  onGuess: (word: string) => void;
  isMrWhite: boolean;
}

export function MrWhiteGuess({ onGuess, isMrWhite }: MrWhiteGuessProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuess(guess.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <Target className="w-16 h-16 text-mr-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Mr. White Eliminated!</h1>
          
          {isMrWhite ? (
            <>
              <p className="text-gray-400 mb-6">
                You've been caught! But you have one last chance...
              </p>
              <p className="text-yellow-400 mb-4 font-bold">
                Guess the civilian's word to win!
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your guess..."
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  className="input-field w-full text-center text-xl"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!guess.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Guess
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-4">
                Mr. White is making their final guess...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="animate-bounce">🎯</div>
                <span className="text-yellow-400">Waiting...</span>
                <div className="animate-bounce delay-100">🎯</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
