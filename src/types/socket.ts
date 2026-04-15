import type { GameState, GameAction, GameRoom, BettingRound, Card, GameConfig } from "./game";
import type { Player } from "./player";

/** Generic ack callback shape used for client→server calls that expect a response */
export interface SocketResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  playerId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface ShowdownResult {
  winnerId: string;
  winnerIds: string[];
  handName: string;
  potAmount: number;
  cards: Card[];
}

export interface HandCompleteResult {
  winners: ShowdownResult[];
  players: Pick<Player, "id" | "username" | "chips">[];
}

// ─── Server → Client ─────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  // Room lifecycle
  "room:list":    (rooms: GameRoom[]) => void;
  "room:created": (room: GameRoom) => void;
  "room:updated": (room: GameRoom) => void;
  "room:deleted": (roomId: string) => void;

  // Game state
  "game:state":        (state: GameState) => void;
  "game:player-joined":(player: Player) => void;
  "game:player-left":  (playerId: string) => void;
  "game:action":       (action: GameAction) => void;
  "game:start":        (state: GameState) => void;

  // Seating
  "game:sat-down":  (playerId: string, position: number) => void;
  "game:stood-up":  (playerId: string) => void;

  // Cards
  "game:deal":          (playerId: string, cards: Card[]) => void;
  "game:card-revealed": (playerId: string, cardIndex: number, card: Card) => void;

  // Betting
  "game:round-start":   (round: BettingRound) => void;
  "game:your-turn":     () => void;
  "game:turn-timeout":  (playerId: string) => void;

  // End of hand
  "game:showdown":      (result: ShowdownResult) => void;
  "game:hand-complete": (result: HandCompleteResult) => void;

  // Errors & chat
  "game:error":    (error: { message: string; code?: string }) => void;
  "chat:message":  (message: ChatMessage) => void;
}

// ─── Client → Server ─────────────────────────────────────────────────────────

export interface ClientToServerEvents {
  // Room management
  "room:list": () => void;
  "room:create": (
    name: string,
    payload: {
      config: Partial<GameConfig>;
      isPrivate?: boolean;
      password?: string;
    },
    callback: (res: SocketResponse<GameRoom>) => void
  ) => void;
  "room:join":  (roomId: string, callback: (res: SocketResponse<GameState>) => void) => void;
  "room:leave": (roomId: string) => void;

  // Game flow
  "game:start":    (roomId: string) => void;
  "game:action":   (action: GameAction) => void;
  "game:sit-down": (position: number) => void;
  "game:stand-up": () => void;

  // Chat
  "chat:send": (roomId: string, text: string) => void;
}
