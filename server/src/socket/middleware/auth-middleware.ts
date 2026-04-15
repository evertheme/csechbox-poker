import type { Socket } from "socket.io";

interface AuthPayload {
  userId: string;
  username: string;
}

declare module "socket.io" {
  interface Socket {
    user?: AuthPayload;
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
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString()) as AuthPayload;
    socket.user = payload;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
