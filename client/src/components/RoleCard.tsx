import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../types';

interface RoleCardProps {
  role: Role;
  word: string | null;
}

export function RoleCard({ role, word }: RoleCardProps) {

  return (
    <div className={`card border-2 relative overflow-hidden`}>
      <div className="text-center py-6">
        {word ? (
          <p className="text-3xl font-bold text-white">{word}</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <HelpCircle className="w-8 h-8" />
            <span className="text-xl">You're Mister White!</span>
          </div>
        )}
      </div>
    </div>
  );
}
