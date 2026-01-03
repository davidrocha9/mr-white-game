import type { GameState, Player, Role, WordPair, ClientGameState, ClientPlayer } from '../../shared/types';
import wordPairs from './wordPairs.json';

export class Game {
  state: GameState;
  private playerConnections: Map<string, any> = new Map();

  constructor(roomCode: string) {
    this.state = {
      roomCode,
      phase: 'lobby',
      players: [],
      currentPlayerIndex: 0,
      round: 1,
    };
  }

  addPlayer(id: string, name: string, ws: any): Player {
    const isHost = this.state.players.length === 0;
    const player: Player = {
      id,
      name,
      isHost,
      isAlive: true,
      hasPlayedThisRound: false,
    };
    this.state.players.push(player);
    this.playerConnections.set(id, ws);
    return player;
  }

  removePlayer(id: string): boolean {
    const index = this.state.players.findIndex(p => p.id === id);
    if (index === -1) return false;

    const wasHost = this.state.players[index].isHost;
    this.state.players.splice(index, 1);
    this.playerConnections.delete(id);

    // Assign new host if needed
    if (wasHost && this.state.players.length > 0) {
      this.state.players[0].isHost = true;
    }

    return true;
  }

  getPlayerConnection(id: string): any {
    return this.playerConnections.get(id);
  }

  getAllConnections(): any[] {
    return Array.from(this.playerConnections.values());
  }

  isEmpty(): boolean {
    return this.state.players.length === 0;
  }

  canStart(): boolean {
    return this.state.players.length >= 3 && this.state.phase === 'lobby';
  }

  startGame(): boolean {
    if (!this.canStart()) return false;

    // Pick random word pair
    const wordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)] as WordPair;
    this.state.wordPair = wordPair;

    // Assign roles
    this.assignRoles();

    // Shuffle player order for the game
    this.shufflePlayers();

    // Reset game state
    this.state.phase = 'playing';
    this.state.round = 1;
    this.state.currentPlayerIndex = 0;
    this.state.winner = undefined;
    this.state.mrWhiteGuess = undefined;
    this.state.eliminatedThisRound = undefined;

    // Reset player states
    this.state.players.forEach(p => {
      p.isAlive = true;
      p.hasPlayedThisRound = false;
      p.votedFor = undefined;
    });

    return true;
  }

  private shufflePlayers(): void {
    for (let i = this.state.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.players[i], this.state.players[j]] = [this.state.players[j], this.state.players[i]];
    }
  }

  private assignRoles(): void {
    const players = [...this.state.players];
    const shuffled = players.sort(() => Math.random() - 0.5);

    // Assign Mr. White (always 1)
    shuffled[0].role = 'mrwhite';
    shuffled[0].word = undefined;

    // Assign Undercover (1 for now, could be configurable)
    if (shuffled.length > 1) {
      shuffled[1].role = 'undercover';
      shuffled[1].word = this.state.wordPair!.undercover;
    }

    // Rest are civilians
    for (let i = 2; i < shuffled.length; i++) {
      shuffled[i].role = 'civilian';
      shuffled[i].word = this.state.wordPair!.civilian;
    }
  }

  getCurrentPlayer(): Player | undefined {
    const alivePlayers = this.state.players.filter(p => p.isAlive);
    if (this.state.currentPlayerIndex >= alivePlayers.length) return undefined;
    
    // Find the actual player at this index among alive players
    let aliveIndex = 0;
    for (const player of this.state.players) {
      if (player.isAlive) {
        if (aliveIndex === this.state.currentPlayerIndex) {
          return player;
        }
        aliveIndex++;
      }
    }
    return undefined;
  }

  endTurn(playerId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return false;
    }

    currentPlayer.hasPlayedThisRound = true;

    // Move to next alive player
    const alivePlayers = this.state.players.filter(p => p.isAlive);
    const allPlayed = alivePlayers.every(p => p.hasPlayedThisRound);

    if (allPlayed) {
      // Start voting phase
      this.state.phase = 'voting';
      this.state.players.forEach(p => p.votedFor = undefined);
    } else {
      // Find next player who hasn't played
      this.state.currentPlayerIndex++;
      while (this.state.currentPlayerIndex < alivePlayers.length) {
        const nextPlayer = alivePlayers[this.state.currentPlayerIndex];
        if (!nextPlayer.hasPlayedThisRound) break;
        this.state.currentPlayerIndex++;
      }
    }

    return true;
  }

  vote(voterId: string, targetId: string): boolean {
    if (this.state.phase !== 'voting') return false;

    const voter = this.state.players.find(p => p.id === voterId);
    const target = this.state.players.find(p => p.id === targetId);

    if (!voter || !target) return false;
    if (!voter.isAlive || !target.isAlive) return false;
    if (voterId === targetId) return false;
    if (voter.votedFor) return false; // Already voted

    voter.votedFor = targetId;

    // Check if all alive players have voted
    const alivePlayers = this.state.players.filter(p => p.isAlive);
    const allVoted = alivePlayers.every(p => p.votedFor);

    if (allVoted) {
      this.tallyVotes();
    }

    return true;
  }

  private tallyVotes(): void {
    const votes: Map<string, number> = new Map();
    const alivePlayers = this.state.players.filter(p => p.isAlive);

    alivePlayers.forEach(p => {
      if (p.votedFor) {
        votes.set(p.votedFor, (votes.get(p.votedFor) || 0) + 1);
      }
    });

    // Find player with most votes
    let maxVotes = 0;
    let eliminated: string | undefined;

    votes.forEach((count, playerId) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminated = playerId;
      }
    });

    if (eliminated) {
      const eliminatedPlayer = this.state.players.find(p => p.id === eliminated);
      if (eliminatedPlayer) {
        eliminatedPlayer.isAlive = false;
        this.state.eliminatedThisRound = eliminated;

        // Check if Mr. White was eliminated
        if (eliminatedPlayer.role === 'mrwhite') {
          this.state.phase = 'mrwhite-guess';
          return;
        }

        // Check win conditions
        this.checkWinConditions();
      }
    }
  }

  mrWhiteGuess(playerId: string, guess: string): boolean {
    if (this.state.phase !== 'mrwhite-guess') return false;

    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.role !== 'mrwhite') return false;

    this.state.mrWhiteGuess = guess;

    // Check if guess is correct (case insensitive)
    if (guess.toLowerCase().trim() === this.state.wordPair!.civilian.toLowerCase().trim()) {
      this.state.winner = 'mrwhite';
    } else {
      this.state.winner = 'civilians';
    }

    this.state.phase = 'ended';
    return true;
  }

  private checkWinConditions(): void {
    const alivePlayers = this.state.players.filter(p => p.isAlive);
    const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian');
    const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover');
    const aliveMrWhite = alivePlayers.filter(p => p.role === 'mrwhite');

    // Mr. White wins if reaches final 2
    if (aliveMrWhite.length > 0 && alivePlayers.length <= 2) {
      this.state.winner = 'mrwhite';
      this.state.phase = 'ended';
      return;
    }

    // Undercover wins if all civilians are eliminated
    if (aliveCivilians.length === 0 && aliveUndercover.length > 0) {
      this.state.winner = 'undercover';
      this.state.phase = 'ended';
      return;
    }

    // Civilians win if both Mr. White and Undercover are eliminated
    if (aliveMrWhite.length === 0 && aliveUndercover.length === 0) {
      this.state.winner = 'civilians';
      this.state.phase = 'ended';
      return;
    }

    // Continue to next round
    this.startNewRound();
  }

  private startNewRound(): void {
    this.state.round++;
    this.state.phase = 'playing';
    this.state.currentPlayerIndex = 0;
    this.state.eliminatedThisRound = undefined;

    this.state.players.forEach(p => {
      p.hasPlayedThisRound = false;
      p.votedFor = undefined;
    });

    // Skip to first alive player
    while (this.state.currentPlayerIndex < this.state.players.length) {
      if (this.state.players[this.state.currentPlayerIndex].isAlive) break;
      this.state.currentPlayerIndex++;
    }
  }

  restart(): void {
    this.state.phase = 'lobby';
    this.state.round = 1;
    this.state.currentPlayerIndex = 0;
    this.state.winner = undefined;
    this.state.mrWhiteGuess = undefined;
    this.state.eliminatedThisRound = undefined;
    this.state.wordPair = undefined;

    this.state.players.forEach(p => {
      p.isAlive = true;
      p.role = undefined;
      p.word = undefined;
      p.hasPlayedThisRound = false;
      p.votedFor = undefined;
    });
  }

  getClientState(): ClientGameState {
    const clientPlayers: ClientPlayer[] = this.state.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isAlive: p.isAlive,
      hasPlayedThisRound: p.hasPlayedThisRound,
      hasVoted: !!p.votedFor,
    }));

    const clientState: ClientGameState = {
      roomCode: this.state.roomCode,
      phase: this.state.phase,
      players: clientPlayers,
      currentPlayerIndex: this.state.currentPlayerIndex,
      round: this.state.round,
      eliminatedThisRound: this.state.eliminatedThisRound,
      winner: this.state.winner,
      mrWhiteGuess: this.state.mrWhiteGuess,
    };

    // Reveal roles at game end
    if (this.state.phase === 'ended') {
      clientState.revealedRoles = {};
      this.state.players.forEach(p => {
        clientState.revealedRoles![p.id] = {
          role: p.role!,
          word: p.word || null,
        };
      });
    }

    return clientState;
  }

  getPlayerRole(playerId: string): { role: Role; word: string | null } | null {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player || !player.role) return null;
    return {
      role: player.role,
      word: player.word || null,
    };
  }
}
