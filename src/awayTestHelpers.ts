import { AWAY_DB_NAME } from "./away";

// Test helper: drops everything the away channel stored (token, lines, marks).
export function deleteAwayDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(AWAY_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Away database is still open"));
  });
}
