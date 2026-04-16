import { registerGameHandlers } from "./game-handler.js";
import { registerTableHandlers } from "./table-handler.js";
export function registerHandlers(io) {
    io.on("connection", (socket) => {
        registerTableHandlers(io, socket);
        registerGameHandlers(io, socket);
    });
}
//# sourceMappingURL=index.js.map