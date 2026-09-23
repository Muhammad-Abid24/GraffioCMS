import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../../.env.local") });

const { Pool } = pg;

/**
 * Create a Drizzle database client connected to PostgreSQL.
 * Requires DATABASE_URL environment variable.
 */
export function createDb(connectionString?: string) {
  const pool = new Pool({
    connectionString: connectionString ?? process.env.DATABASE_URL,
  });

  return drizzle(pool, { schema });
}

/** Singleton database instance for app usage */
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Please configure your database connection.");
    }
    _db = createDb(process.env.DATABASE_URL);
  }
  return _db;
}

export type Database = ReturnType<typeof createDb>;
