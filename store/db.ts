
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

function safeId(id: string) {

  return id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}


export async function openDbForUserAsync(userSub: string) {
  const name = `inventory-${safeId(userSub)}.db`;
  db = await SQLite.openDatabaseAsync(name);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    -- Se quiser evitar nomes duplicados por usuário, descomente:
    -- CREATE UNIQUE INDEX IF NOT EXISTS uniq_products_name ON products(name COLLATE NOCASE);
  `);

  return db!;
}


export function getDb() {
  if (!db) throw new Error('DB ainda não foi aberto para o usuário atual.');
  return db;
}


export function resetDbRef() {
  db = null;
}
