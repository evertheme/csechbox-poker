import type { GameState, GameAction, LobbyTable, BettingRound, Card, GameConfig } from "./game";
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
  // Open tables in the lobby
  "table:list": (tables: LobbyTable[]) => void;
  "table:created": (table: LobbyTable) => void;
  "table:updated": (table: LobbyTable) => void;
  "table:deleted": (tableId: string) => void;

  // Game state
  "game:state": (state: GameState) => void;
  "game:player-joined": (player: Player) => void;
  "game:player-left": (playerId: string) => void;
  "game:action": (action: GameAction) => void;
  "game:start": (state: GameState) => void;

  // Seating
  "game:sat-down": (playerId: string, position: number) => void;
  "game:stood-up": (playerId: string) => void;

  // Cards
  "game:deal": (playerId: string, cards: Card[]) => void;
  "game:card-revealed": (playerId: string, cardIndex: number, card: Card) => void;

  // Betting
  "game:round-start": (round: BettingRound) => void;
  "game:your-turn": () => void;
  "game:turn-timeout": (playerId: string) => void;

  // End of hand
  "game:showdown": (result: ShowdownResult) => void;
  "game:hand-complete": (result: HandCompleteResult) => void;

  // Errors & chat
  "game:error": (error: { message: string; code?: string }) => void;
  "chat:message": (message: ChatMessage) => void;
  /** Server emits `chat-message` (see `server` game-handler). */
  "chat-message": (message: ChatMessage) => void;
}

// ─── Client → Server ─────────────────────────────────────────────────────────

/** Row returned by server `list-tables`. */
export interface ListedTableRow {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  config: GameConfig & { name?: string };
}

/** Matches server `GameRoomCreateConfig` (`create-table` handler). */
export type CreateTablePayload = { name: string } & Partial<GameConfig>;

export interface ClientToServerEvents {
  "table:list": () => void;
  /** Server-native create (ack returns `tableId`). */
  "create-table": (
    config: CreateTablePayload,
    callback?: (
      res:
        | { success: true; tableId: string; message: string }
        | { success: false; error: string }
    ) => void
  ) => void;
  /** Server-native lobby fetch (ack callback). */
  "list-tables": (
    callback: (
      res:
        | { success: true; tables: ListedTableRow[] }
        | { success: false; error: string }
    ) => void
  ) => void;
  /** Server-native join (ack callback). */
  "join-table": (
    tableId: string,
    callback: (
      res:
        | { success: true; message: string; table: unknown }
        | { success: false; error: string }
    ) => void
  ) => void;
  "room:create": (
    name: string,
    payload: {
      config: Partial<GameConfig>;
      isPrivate?: boolean;
      password?: string;
    },
    callback: (res: SocketResponse<LobbyTable>) => void
  ) => void;
  "room:join": (tableId: string, callback: (res: SocketResponse<GameState>) => void) => void;
  "room:leave": (tableId: string) => void;
  /** Server-native leave. */
  "leave-table": (tableId: string) => void;

  // Game flow
  "game:start": (tableId: string) => void;
  /** Server-native start hand/table (see `server` game-handler). */
  "start-game": (tableId: string) => void;
  "game:action": (action: GameAction) => void;
  /** Server-native player action. */
  "player-action": (action: { tableId: string; type: string; amount?: number }) => void;
  "game:sit-down": (position: number) => void;
  "game:stand-up": () => void;

  // Chat
  "chat:send": (tableId: string, text: string) => void;
  /** Server-native chat (see `server` game-handler). */
  "send-message": (tableId: string, message: string) => void;
}
