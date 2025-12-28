import { pool } from "@/app/_lib/db";
import type { QueryResultRow } from "@neondatabase/serverless";

/**
 * Ejecuta una consulta simple usando pool.query() directamente.
 * En modo HTTP (poolQueryViaFetch = true), esto es más eficiente que pool.connect()
 * ya que realiza una petición HTTP rápida que se cierra inmediatamente.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
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
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
}
