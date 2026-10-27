import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pgDataDir = path.resolve(__dirname, '../data/pgdata');

let pgClient = null;
let isNativePg = false;

/**
 * Initializes PostgreSQL database connection.
 * Uses native PostgreSQL pool if PG_URI or DATABASE_URL is configured,
 * otherwise runs embedded PGlite writing to persistent disk storage at backend/data/pgdata.
 */
export async function connectPostgres() {
  if (pgClient) return pgClient;

  const pgUri = process.env.PG_URI || process.env.DATABASE_URL;

  if (pgUri) {
    console.log(`🔌 Connecting to external PostgreSQL server: ${pgUri.split('@')[1] || 'configured'}`);
    const pool = new pg.Pool({ connectionString: pgUri, max: 10 });
    // Test connection
    const client = await pool.connect();
    client.release();
    pgClient = pool;
    isNativePg = true;
    console.log('✅ External PostgreSQL Connected successfully.');
  } else {
    // Ensure storage directory exists
    if (!fs.existsSync(pgDataDir)) {
      fs.mkdirSync(pgDataDir, { recursive: true });
    }
    // Clean up stale postmaster.pid lock file if present from prior sudden termination
    const pidFile = path.join(pgDataDir, 'postmaster.pid');
    if (fs.existsSync(pidFile)) {
      try {
        fs.unlinkSync(pidFile);
      } catch {}
    }
    console.log(`📂 Initializing embedded PostgreSQL (PGlite) with persistence at: ${pgDataDir}`);
    pgClient = new PGlite(pgDataDir);
    isNativePg = false;
    console.log('✅ Embedded PostgreSQL (PGlite) Ready.');
  }

  return pgClient;
}

/**
 * Execute parameterized query against PostgreSQL
 */
export async function query(sql, params = []) {
  if (!pgClient) {
    await connectPostgres();
  }

  try {
    if (isNativePg) {
      const res = await pgClient.query(sql, params);
      return res;
    } else {
      const res = await pgClient.query(sql, params);
      return res;
    }
  } catch (err) {
    console.error(`❌ PostgreSQL Query Error: ${err.message}\nSQL: ${sql}`);
    throw err;
  }
}

/**
 * Run callback within a transactional block with rollback on error
 */
export async function transaction(callback) {
  if (!pgClient) await connectPostgres();

  if (isNativePg) {
    const client = await pgClient.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    try {
      await pgClient.query('BEGIN');
      const result = await callback({
        query: (sql, params) => pgClient.query(sql, params)
      });
      await pgClient.query('COMMIT');
      return result;
    } catch (e) {
      await pgClient.query('ROLLBACK');
      throw e;
    }
  }
}

export function getPostgresClient() {
  return pgClient;
}
