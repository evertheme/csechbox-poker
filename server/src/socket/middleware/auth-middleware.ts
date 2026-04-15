import type { ExtendedError, Socket } from "socket.io";

declare module "socket.io" {
  interface SocketData {
    userId?: string;
    username?: string;
  }
}

export const authMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const { userId, username } = socket.handshake.auth as {
    userId?: string;
    username?: string;
  };

  // For now, allow connections without strict auth
  // In production, verify JWT token here
  if (userId) {
    socket.data.userId = userId;
    if (username !== undefined) {
      socket.data.username = username;
    }
  }

  next();
};
