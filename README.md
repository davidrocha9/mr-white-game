# Mr. White Online

A lightweight, turn-based web companion for playing Mr. White over Discord voice chat.

The web app acts as an authoritative game master: it enforces turn order, manages roles and words, and handles voting — while all discussion and clues happen over voice (Discord).

---

## Quick overview

- Players join a room using a short code.
- The server assigns private roles: `civilian`, `undercover`, and one `mrwhite`.
- Each round players speak in strict order and press "End Turn" when finished.
- After everyone has spoken, an anonymous voting phase eliminates a player.
- If `mrwhite` is eliminated they receive one private guess. Correct guess → Mr. White wins; otherwise civilians win.

Design goals: desktop-first, minimal UI, no typing during rounds, and authoritative server-side logic.

---

## Features

- Create and join rooms via a room code
- Private role and word assignment
- Strict turn order with only the active player able to end their turn
- Anonymous voting (no self-votes) and automatic tallying
- Mr. White private guess phase when eliminated
- Automatic win detection and role/word reveal at game end
- Host controls: start and restart the game

---

## Game flow (summary)

1. Host creates a room and shares the room code.
2. Players join (recommended 3+ players).
3. Host starts the game: roles and a word pair are assigned server-side.
4. Rounds: players speak in strict order, each clicks "End Turn" when done. Eliminated players are skipped.
5. After all alive players have taken their turn, the game enters Voting.
6. Players vote anonymously (cannot vote for self). The most-voted player is eliminated.
7. If the eliminated player is `mrwhite`, the game shows a private guess input for them.
8. The winner is decided and roles/words are revealed.

---

## Win conditions

- Civilians win: `mrwhite` is eliminated and fails to guess the civilian word (or both `mrwhite` and `undercover` eliminated).
- Mr. White wins: survives to the final rounds (e.g., final 2) or correctly guesses the civilian word after elimination.
- Undercover wins: all civilians eliminated.

---

## Project layout

- `client/` — Vite + React + TypeScript + Tailwind app (UI & WebSocket client)
- `server/` — Bun WebSocket server (authoritative game logic & room management)
- `shared/` — Shared TypeScript types used by both client and server

Key files:
- `client/src/App.tsx` — React app and UI flow
- `client/src/useGameConnection.ts` — WebSocket client hook
- `server/src/index.ts` — Bun server and message routing
- `server/src/Game.ts` — Core game logic and state management

---

## Local development (recommended: Bun)

Install Bun (recommended) and run the dev script from the project root:

```bash
curl -fsSL https://bun.sh/install | bash
cd mr-white-game
bun install
bun run dev
```

This starts both the server and client in development mode:
- Server: `http://localhost:3001` (WebSocket at `/ws`)
- Client: `http://localhost:5173`

If Bun is not available you can run the client with npm/yarn/pnpm:

```bash
cd client
npm install
npm run dev
```

Running the server without Bun requires a TypeScript runner (e.g., `ts-node`) or building the server first; Bun is the supported, simplest option.

---

## Ports & endpoints

- Frontend (Vite dev): `5173`
- Backend WebSocket server: `3001`
- WebSocket path: `/ws`

These values are configurable in `client/vite.config.ts` and `server/src/index.ts`.

---

## Development notes

- Keep authoritative game logic inside `server/src/Game.ts` to avoid client-server state mismatch.
- Word pairs are in `server/src/wordPairs.json` and are chosen randomly per game.
- UI components live in `client/src/components` and use a single WebSocket hook for state updates.

---

If you'd like, I can also add a Dockerfile/devcontainer, CI checks, or e2e tests for the main game flows.

Happy to adjust length or format — tell me if you want a shorter README or more technical details.