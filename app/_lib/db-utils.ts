import { pool } from "@/app/_lib/db";
import type { PoolClient, QueryResultRow } from "@neondatabase/serverless";

/**
 * Ejecuta una función con una conexión del pool, liberándola automáticamente.
 * Elimina la repetición del patrón try/finally en server actions.
 */
export async function withConnection<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Ejecuta una consulta simple sin necesidad de manejar la conexión.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  return withConnection(async (client) => {
    const result = await client.query<T>(sql, params);
    return result.rows;
  });
}

/**
 * Ejecuta una consulta y devuelve la primera fila o null.
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Ejecuta una consulta de inserción/update/delete.
 */
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<number> {
  return withConnection(async (client) => {
    const result = await client.query(sql, params);
    return result.rowCount ?? 0;
  });
}
