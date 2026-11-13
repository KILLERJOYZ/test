declare module "expo-sqlite" {
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, ...params: unknown[]): Promise<unknown>;
    getFirstAsync<T = unknown>(sql: string, ...params: unknown[]): Promise<T | null>;
    getAllAsync<T = unknown>(sql: string, ...params: unknown[]): Promise<T[]>;
    withExclusiveTransactionAsync(task: (tx: SQLiteDatabase) => Promise<void>): Promise<void>;
  }
  export function openDatabaseAsync(databaseName: string): Promise<SQLiteDatabase>;
}
