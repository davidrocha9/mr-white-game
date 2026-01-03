import { useEffect, useRef, useState, useCallback } from 'react';
import type { ClientMessage, ServerMessage, ClientGameState, Role } from './types';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

export interface GameConnection {
  connected: boolean;
  playerId: string | null;
  roomCode: string | null;
  gameState: ClientGameState | null;
  myRole: Role | null;
  myWord: string | null;
  error: string | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  endTurn: () => void;
  vote: (targetId: string) => void;
  mrWhiteGuess: (word: string) => void;
  restartGame: () => void;
  leaveRoom: () => void;
}

export function useGameConnection(): GameConnection {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [myWord, setMyWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to server');
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setConnected(false);
    };

    ws.onerror = () => {
      setError('Connection error');
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleMessage = (message: ServerMessage) => {
    switch (message.type) {
      case 'room-created':
        setRoomCode(message.roomCode);
        setPlayerId(message.playerId);
        break;

      case 'room-joined':
        setPlayerId(message.playerId);
        break;

      case 'game-state':
        setGameState(message.state);
        setRoomCode(message.state.roomCode);
        break;

      case 'your-role':
        setMyRole(message.role);
        setMyWord(message.word);
        break;

      case 'game-restarted':
        setMyRole(null);
        setMyWord(null);
        break;

      case 'error':
        setError(message.message);
        setTimeout(() => setError(null), 3000);
        break;
    }
  };

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createRoom = useCallback((playerName: string) => {
    send({ type: 'create-room', playerName });
  }, [send]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    send({ type: 'join-room', roomCode, playerName });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: 'start-game' });
  }, [send]);

  const endTurn = useCallback(() => {
    send({ type: 'end-turn' });
  }, [send]);

  const vote = useCallback((targetId: string) => {
    send({ type: 'vote', targetId });
  }, [send]);

  const mrWhiteGuess = useCallback((word: string) => {
    send({ type: 'mrwhite-guess', word });
  }, [send]);

  const restartGame = useCallback(() => {
    send({ type: 'restart-game' });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'leave-room' });
    setRoomCode(null);
    setPlayerId(null);
    setGameState(null);
    setMyRole(null);
    setMyWord(null);
  }, [send]);

  return {
    connected,
    playerId,
    roomCode,
    gameState,
    myRole,
    myWord,
    error,
    createRoom,
    joinRoom,
    startGame,
    endTurn,
    vote,
    mrWhiteGuess,
    restartGame,
    leaveRoom,
  };
}
