export const authMiddleware = (socket, next) => {
    const { userId, username } = socket.handshake.auth;
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
//# sourceMappingURL=auth-middleware.js.map