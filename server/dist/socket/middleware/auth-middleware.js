import { jwtVerify } from "jose";
async function verifySupabaseAccessToken(token, secret) {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        return typeof payload.sub === "string" ? payload.sub : null;
    }
    catch {
        return null;
    }
}
export const authMiddleware = async (socket, next) => {
    const { userId, username, accessToken } = socket.handshake.auth;
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (jwtSecret) {
        if (accessToken) {
            const sub = await verifySupabaseAccessToken(accessToken, jwtSecret);
            if (!sub) {
                return next(new Error("Unauthorized: invalid token"));
            }
            socket.data.userId = sub;
            if (username !== undefined) {
                socket.data.username = username;
            }
            return next();
        }
        if (userId) {
            return next(new Error("Unauthorized: missing access token"));
        }
        return next();
    }
    // No JWT secret (typical local dev): ignore accessToken and trust userId only.
    if (userId) {
        socket.data.userId = userId;
        if (username !== undefined) {
            socket.data.username = username;
        }
    }
    next();
};
//# sourceMappingURL=auth-middleware.js.map