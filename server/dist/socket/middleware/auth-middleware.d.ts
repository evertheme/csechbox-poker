import type { Socket } from "socket.io";
import type { SocketUser } from "../../types/index.js";
declare module "socket.io" {
    interface Socket {
        user?: SocketUser;
    }
}
export declare function authMiddleware(socket: Socket, next: (err?: Error) => void): void;
//# sourceMappingURL=auth-middleware.d.ts.map