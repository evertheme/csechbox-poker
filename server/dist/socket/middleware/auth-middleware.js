import { createLogger } from "../../utils/logger.js";
const log = createLogger("auth-middleware");
export function authMiddleware(socket, next) {
    const token = socket.handshake.auth["token"];
    if (!token) {
        next(new Error("Authentication required"));
        return;
    }
    // TODO: verify JWT against Supabase JWT secret
    // For now, decode without verification for development
    try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString());
        socket.user = payload;
        next();
    }
    catch (err) {
        log.warn("invalid token", { err });
        next(new Error("Invalid token"));
    }
}
