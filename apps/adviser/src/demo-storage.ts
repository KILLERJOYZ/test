import * as SQLite from "expo-sqlite";
let database: Promise<SQLite.SQLiteDatabase> | undefined;
async function db() {
  if (!database)
    database = SQLite.openDatabaseAsync("lua-demo2.db").then(async (d) => {
      await d.execAsync(
        "PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);",
      );
      return d;
    });
  return database;
}
export const storageKind = "SQLite (Android)";
export const storage = {
  async getItem(key: string) {
    return (
      (
        await (
          await db()
        ).getFirstAsync<{ value: string }>(
          "SELECT value FROM records WHERE key = ?",
          key,
        )
      )?.value ?? null
    );
  },
  async setItem(key: string, value: string) {
    const d = await db();
    await d.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync(
        "INSERT INTO records(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        key,
        value,
      );
    });
  },
  async removeItem(key: string) {
    await (await db()).runAsync("DELETE FROM records WHERE key = ?", key);
  },
};
