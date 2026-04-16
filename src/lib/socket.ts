import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

export type PokerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

class SocketClient {
  private static instance: SocketClient;
  private socket: PokerSocket | null = null;

  private constructor() {}

  static getInstance(): SocketClient {
    SocketClient.instance ??= new SocketClient();
    return SocketClient.instance;
  }

  connect(options?: { userId: string; accessToken?: string }): PokerSocket {
    if (this.socket?.connected) return this.socket;

    const { userId, accessToken } = options ?? {};
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Prefer WebSocket, fall back to polling
      transports: ["websocket", "polling"],
      upgrade: true,
      // Socket.IO 4.8+ features
      ackTimeout: 10_000,
      retries: 3,
      auth: { userId, accessToken },
    });

    this.setupListeners();

    if (userId) this.socket.connect();

    return this.socket;
  }

  private setupListeners(): void {
    if (!this.socket) return;
    const s = this.socket;

    s.on("connect", () => {
      console.log("[socket] connected:", s.id);
    });

    s.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    s.on("connect_error", (error) => {
      console.error("[socket] connection error:", error.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Returns the typed socket, or null if not yet connected. */
  getSocket(): PokerSocket | null {
    return this.socket;
  }

  /** Returns the typed socket, creating it if needed (does not connect). */
  getOrCreate(options?: { userId: string; accessToken?: string }): PokerSocket {
    return this.socket ?? this.connect(options);
  }
}

export const socketClient = SocketClient.getInstance();

/** Convenience — returns the singleton socket, creating it if needed. */
export function getSocket(): PokerSocket {
  return socketClient.getOrCreate();
}

/** Convenience — disconnects and clears the singleton socket. */
export function disconnectSocket(): void {
  socketClient.disconnect();
}
