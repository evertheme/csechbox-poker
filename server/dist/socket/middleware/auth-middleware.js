import { createRemoteJWKSet, jwtVerify } from "jose";
/** Cached JWKS verifier for asymmetric signing keys (see Supabase JWT Signing Keys). */
let jwksGetter = null;
function getJwks() {
    const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
    if (!base)
        return null;
    jwksGetter ??= createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`));
    return jwksGetter;
}
/**
 * Verifies a Supabase access token:
 * 1. Legacy HS256 with SUPABASE_JWT_SECRET (if set)
 * 2. Asymmetric keys via JWKS at SUPABASE_URL (required for newer "JWT Signing Keys" projects)
 */
async function verifySupabaseAccessToken(token) {
    const secret = process.env.SUPABASE_JWT_SECRET?.trim();
    if (secret) {
        try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
            if (typeof payload.sub === "string")
                return payload.sub;
        }
        catch {
            // Not HS256 with legacy secret — try JWKS (e.g. ES256 / new signing keys)
        }
    }
    const jwks = getJwks();
    if (jwks) {
        try {
            const { payload } = await jwtVerify(token, jwks);
            return typeof payload.sub === "string" ? payload.sub : null;
        }
        catch {
            return null;
        }
    }
    return null;
}
function canVerifyAccessTokens() {
    return (Boolean(process.env.SUPABASE_JWT_SECRET?.trim()) ||
        Boolean(process.env.SUPABASE_URL?.trim()));
}
export const authMiddleware = async (socket, next) => {
    const { userId, username, accessToken } = socket.handshake.auth;
    if (canVerifyAccessTokens()) {
        if (accessToken) {
            const sub = await verifySupabaseAccessToken(accessToken);
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
    // No verifier configured (typical local dev): ignore accessToken and trust userId only.
    if (userId) {
        socket.data.userId = userId;
        if (username !== undefined) {
            socket.data.username = username;
        }
    }
    next();
};
//# sourceMappingURL=auth-middleware.js.map