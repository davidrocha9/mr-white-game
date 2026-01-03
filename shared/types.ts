// Game Roles
export type Role = 'civilian' | 'undercover' | 'mrwhite';

// Game Phases
export type GamePhase = 'lobby' | 'playing' | 'voting' | 'mrwhite-guess' | 'ended';

// Player State
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  role?: Role;
  word?: string;
  hasPlayedThisRound: boolean;
  votedFor?: string;
}

// Word Pair
export interface WordPair {
  civilian: string;
  undercover: string;
}

// Game State
export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  eliminatedThisRound?: string;
  winner?: 'civilians' | 'undercover' | 'mrwhite';
  mrWhiteGuess?: string;
  wordPair?: WordPair;
}

// Client -> Server Messages
export type ClientMessage =
  | { type: 'create-room'; playerName: string }
  | { type: 'join-room'; roomCode: string; playerName: string }
  | { type: 'start-game' }
  | { type: 'end-turn' }
  | { type: 'vote'; targetId: string }
  | { type: 'mrwhite-guess'; word: string }
  | { type: 'restart-game' }
  | { type: 'leave-room' };

// Server -> Client Messages
export type ServerMessage =
  | { type: 'room-created'; roomCode: string; playerId: string }
  | { type: 'room-joined'; playerId: string }
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'game-state'; state: ClientGameState }
  | { type: 'your-role'; role: Role; word: string | null }
  | { type: 'turn-changed'; currentPlayerIndex: number }
  | { type: 'voting-started' }
  | { type: 'player-voted'; playerId: string }
  | { type: 'player-eliminated'; playerId: string; role: Role }
  | { type: 'mrwhite-guessing' }
  | { type: 'game-ended'; winner: 'civilians' | 'undercover' | 'mrwhite'; mrWhiteGuess?: string }
  | { type: 'game-restarted' }
  | { type: 'error'; message: string };

// Game state sent to clients (without sensitive info)
export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  players: ClientPlayer[];
  currentPlayerIndex: number;
  round: number;
  eliminatedThisRound?: string;
  winner?: 'civilians' | 'undercover' | 'mrwhite';
  mrWhiteGuess?: string;
  revealedRoles?: { [playerId: string]: { role: Role; word: string | null } };
}

// Player info sent to clients
export interface ClientPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  hasPlayedThisRound: boolean;
  hasVoted: boolean;
}
