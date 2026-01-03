import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../types';

interface RoleCardProps {
  role: Role;
  word: string | null;
}

export function RoleCard({ role, word }: RoleCardProps) {
  const [revealed, setRevealed] = useState(false);

  const getRoleInfo = () => {
    switch (role) {
      case 'civilian':
        return {
          title: 'Civilian',
          color: 'text-green-400',
          bgColor: 'bg-green-900/30 border-green-700',
          description: 'Describe your word without being too obvious.',
        };
      case 'undercover':
        return {
          title: 'Undercover',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/30 border-yellow-700',
          description: 'You have a similar word. Blend in with the civilians.',
        };
      case 'mrwhite':
        return {
          title: 'Mr. White',
          color: 'text-red-400',
          bgColor: 'bg-red-900/30 border-red-700',
          description: 'You have no word. Figure it out from others!',
        };
    }
  };

  const info = getRoleInfo();

  return (
    <div className={`card border-2 ${info.bgColor} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${info.color}`}>{info.title}</h3>
        <button
          onClick={() => setRevealed(!revealed)}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          {revealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {revealed ? (
        <>
          <div className="text-center py-6">
            {word ? (
              <p className="text-3xl font-bold text-white">{word}</p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <HelpCircle className="w-8 h-8" />
                <span className="text-xl">No word assigned</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm text-center">{info.description}</p>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">Click the eye to reveal your role</p>
        </div>
      )}
    </div>
  );
}
