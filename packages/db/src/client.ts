import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index';

export function createDb(connectionString?: string) {
  const url = connectionString || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof createDb>;

let _db: DbClient | null = null;

export function getDb(): DbClient {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Proxied db instance for direct imports
export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    const instance = getDb();
    return (instance as any)[prop];
  },
});
