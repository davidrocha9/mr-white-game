import { nanoid } from 'nanoid';
import { Game } from './Game';
import type { ClientMessage, ServerMessage } from '../../shared/types';

const PORT = 3001;

// Store all active games
const games: Map<string, Game> = new Map();

// Map WebSocket to player info
const wsToPlayer: Map<any, { roomCode: string; playerId: string }> = new Map();

function generateRoomCode(): string {
  return nanoid(6).toUpperCase();
}

function broadcast(game: Game, message: ServerMessage, exclude?: string): void {
  const data = JSON.stringify(message);
  game.state.players.forEach(player => {
    if (exclude && player.id === exclude) return;
    const ws = game.getPlayerConnection(player.id);
    if (ws && ws.readyState === 1) {
      ws.send(data);
    }
  });
}

function send(ws: any, message: ServerMessage): void {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

function handleMessage(ws: any, message: ClientMessage): void {
  switch (message.type) {
    case 'create-room': {
      const roomCode = generateRoomCode();
      const playerId = nanoid();
      const game = new Game(roomCode);
      const player = game.addPlayer(playerId, message.playerName, ws);
      
      games.set(roomCode, game);
      wsToPlayer.set(ws, { roomCode, playerId });

      send(ws, { type: 'room-created', roomCode, playerId });
      send(ws, { type: 'game-state', state: game.getClientState() });
      
      console.log(`Room ${roomCode} created by ${message.playerName}`);
      break;
    }

    case 'join-room': {
      const game = games.get(message.roomCode.toUpperCase());
      if (!game) {
        send(ws, { type: 'error', message: 'Room not found' });
        return;
      }

      if (game.state.phase !== 'lobby') {
        send(ws, { type: 'error', message: 'Game already in progress' });
        return;
      }

      const playerId = nanoid();
      const player = game.addPlayer(playerId, message.playerName, ws);
      wsToPlayer.set(ws, { roomCode: message.roomCode.toUpperCase(), playerId });

      send(ws, { type: 'room-joined', playerId });
      broadcast(game, { type: 'player-joined', player: { ...player, role: undefined, word: undefined } });
      broadcast(game, { type: 'game-state', state: game.getClientState() });

      console.log(`${message.playerName} joined room ${message.roomCode}`);
      break;
    }

    case 'start-game': {
      const playerInfo = wsToPlayer.get(ws);
      if (!playerInfo) return;

      const game = games.get(playerInfo.roomCode);
      if (!game) return;

      const player = game.state.players.find(p => p.id === playerInfo.playerId);
      if (!player?.isHost) {
        send(ws, { type: 'error', message: 'Only the host can start the game' });
        return;
      }

      if (!game.canStart()) {
        send(ws, { type: 'error', message: 'Need at least 3 players to start' });
        return;
      }

      game.startGame();

      // Send role info to each player
      game.state.players.forEach(p => {
        const playerWs = game.getPlayerConnection(p.id);
        if (playerWs) {
          const roleInfo = game.getPlayerRole(p.id);
          if (roleInfo) {
            send(playerWs, { type: 'your-role', role: roleInfo.role, word: roleInfo.word });
          }
        }
      });

      broadcast(game, { type: 'game-state', state: game.getClientState() });
      console.log(`Game started in room ${playerInfo.roomCode}`);
      break;
    }

    case 'end-turn': {
      const playerInfo = wsToPlayer.get(ws);
      if (!playerInfo) return;

      const game = games.get(playerInfo.roomCode);
      if (!game) return;

      if (game.state.phase !== 'playing') {
        send(ws, { type: 'error', message: 'Not in playing phase' });
        return;
      }

      if (!game.endTurn(playerInfo.playerId)) {
        send(ws, { type: 'error', message: 'Not your turn' });
        return;
      }

      broadcast(game, { type: 'game-state', state: game.getClientState() });

      if (game.state.phase === 'voting') {
        broadcast(game, { type: 'voting-started' });
      }
      break;
    }

    case 'vote': {
      const playerInfo = wsToPlayer.get(ws);
      if (!playerInfo) return;

      const game = games.get(playerInfo.roomCode);
      if (!game) return;

      if (!game.vote(playerInfo.playerId, message.targetId)) {
        send(ws, { type: 'error', message: 'Invalid vote' });
        return;
      }

      broadcast(game, { type: 'player-voted', playerId: playerInfo.playerId });
      broadcast(game, { type: 'game-state', state: game.getClientState() });

      // Check for elimination
      if (game.state.eliminatedThisRound) {
        const eliminated = game.state.players.find(p => p.id === game.state.eliminatedThisRound);
        if (eliminated) {
          broadcast(game, { 
            type: 'player-eliminated', 
            playerId: eliminated.id, 
            role: eliminated.role! 
          });

          if (game.state.phase === 'mrwhite-guess') {
            broadcast(game, { type: 'mrwhite-guessing' });
          } else if (game.state.phase === 'ended') {
            broadcast(game, { 
              type: 'game-ended', 
              winner: game.state.winner!,
              mrWhiteGuess: game.state.mrWhiteGuess 
            });
          }
        }
      }
      break;
    }

    case 'mrwhite-guess': {
      const playerInfo = wsToPlayer.get(ws);
      if (!playerInfo) return;

      const game = games.get(playerInfo.roomCode);
      if (!game) return;

      if (!game.mrWhiteGuess(playerInfo.playerId, message.word)) {
        send(ws, { type: 'error', message: 'Cannot guess' });
        return;
      }

      broadcast(game, { type: 'game-state', state: game.getClientState() });
      broadcast(game, { 
        type: 'game-ended', 
        winner: game.state.winner!,
        mrWhiteGuess: game.state.mrWhiteGuess 
      });
      break;
    }

    case 'restart-game': {
      const playerInfo = wsToPlayer.get(ws);
      if (!playerInfo) return;

      const game = games.get(playerInfo.roomCode);
      if (!game) return;

      const player = game.state.players.find(p => p.id === playerInfo.playerId);
      if (!player?.isHost) {
        send(ws, { type: 'error', message: 'Only the host can restart the game' });
        return;
      }

      game.restart();
      broadcast(game, { type: 'game-restarted' });
      broadcast(game, { type: 'game-state', state: game.getClientState() });
      console.log(`Game restarted in room ${playerInfo.roomCode}`);
      break;
    }

    case 'leave-room': {
      handleDisconnect(ws);
      break;
    }
  }
}

function handleDisconnect(ws: any): void {
  const playerInfo = wsToPlayer.get(ws);
  if (!playerInfo) return;

  const game = games.get(playerInfo.roomCode);
  if (!game) {
    wsToPlayer.delete(ws);
    return;
  }

  const player = game.state.players.find(p => p.id === playerInfo.playerId);
  const playerName = player?.name || 'Unknown';

  game.removePlayer(playerInfo.playerId);
  wsToPlayer.delete(ws);

  if (game.isEmpty()) {
    games.delete(playerInfo.roomCode);
    console.log(`Room ${playerInfo.roomCode} deleted (empty)`);
  } else {
    broadcast(game, { type: 'player-left', playerId: playerInfo.playerId });
    broadcast(game, { type: 'game-state', state: game.getClientState() });
  }

  console.log(`${playerName} left room ${playerInfo.roomCode}`);
}

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    
    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 });
      }
      return undefined;
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    return new Response('Mr. White Game Server', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  },
  websocket: {
    open(ws) {
      console.log('Client connected');
    },
    message(ws, message) {
      try {
        const data = JSON.parse(message.toString()) as ClientMessage;
        handleMessage(ws, data);
      } catch (error) {
        console.error('Invalid message:', error);
        send(ws, { type: 'error', message: 'Invalid message format' });
      }
    },
    close(ws) {
      console.log('Client disconnected');
      handleDisconnect(ws);
    },
  },
});

console.log(`🎮 Mr. White Game Server running on http://localhost:${PORT}`);
