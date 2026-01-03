import { useState } from 'react';
import { Users, Plus, LogIn } from 'lucide-react';

interface HomeScreenProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  connected: boolean;
}

export function HomeScreen({ onCreateRoom, onJoinRoom, connected }: HomeScreenProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateRoom(name.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim(), name.trim());
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin w-8 h-8 border-4 border-mr-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-white">Mr.</span>
            <span className="text-mr-accent"> White</span>
          </h1>
          <p className="text-gray-400">Online Party Game</p>
        </div>

        {mode === 'select' && (
          <div className="card space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full btn-primary flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="card space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-mr-accent" />
              Create Room
            </h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-primary flex-1"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="card space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-mr-accent" />
              Join Room
            </h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              maxLength={20}
              autoFocus
            />
            <input
              type="text"
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input-field w-full uppercase"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !roomCode.trim()}
                className="btn-primary flex-1"
              >
                Join
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Play with friends over Discord voice chat
        </p>
      </div>
    </div>
  );
}
