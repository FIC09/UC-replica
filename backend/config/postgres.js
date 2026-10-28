/**
 * PostgreSQL Connector Stub (Pure MongoDB Atlas Mode)
 * External PostgreSQL and PGlite are deactivated per user specification.
 * All data operations are handled exclusively by MongoDB Atlas.
 */

export async function connectPostgres() {
  return null;
}

export async function query(sql, params = []) {
  return { rows: [], rowCount: 0 };
}

export async function transaction(callback) {
  const dummyClient = {
    query: async () => ({ rows: [], rowCount: 0 })
  };
  return await callback(dummyClient);
}

export default {
  connectPostgres,
  query,
  transaction
};
