import type { Socket } from "socket.io";
import type { SocketUser } from "../../types/index.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("auth-middleware");

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

export function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const token = socket.handshake.auth["token"] as string | undefined;

  if (!token) {
    next(new Error("Authentication required"));
    return;
  }

  // TODO: verify JWT against Supabase JWT secret
  // For now, decode without verification for development
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString()
    ) as SocketUser;
    socket.user = payload;
    next();
  } catch (err) {
    log.warn("invalid token", { err });
    next(new Error("Invalid token"));
  }
}
