/** In-memory registry of active tables (socket handlers). */
export const tables = new Map();
export function generateTableId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
//# sourceMappingURL=table-registry.js.map