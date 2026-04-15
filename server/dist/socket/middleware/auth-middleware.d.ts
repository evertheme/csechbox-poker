import type { ExtendedError, Socket } from "socket.io";
declare module "socket.io" {
    interface SocketData {
        userId?: string;
        username?: string;
    }
}
export declare const authMiddleware: (socket: Socket, next: (err?: ExtendedError) => void) => void;
//# sourceMappingURL=auth-middleware.d.ts.map