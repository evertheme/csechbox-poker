import type { GameState, GameRoom, PlayerAction } from "./game";
import type { Player } from "./player";

export interface ServerToClientEvents {
  "room:list": (rooms: GameRoom[]) => void;
  "room:created": (room: GameRoom) => void;
  "room:updated": (room: GameRoom) => void;
  "room:deleted": (roomId: string) => void;
  "game:state": (state: GameState) => void;
  "game:player-joined": (player: Player) => void;
  "game:player-left": (playerId: string) => void;
  "game:action": (playerId: string, action: PlayerAction, amount?: number) => void;
  "game:error": (message: string) => void;
  "chat:message": (from: string, text: string, timestamp: string) => void;
}

export interface ClientToServerEvents {
  "room:create": (name: string, options: Partial<GameRoom>) => void;
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "game:action": (action: PlayerAction, amount?: number) => void;
  "chat:send": (roomId: string, text: string) => void;
}
