import { pool } from "@/app/_lib/db";
import type { QueryResultRow } from "@neondatabase/serverless";
import { DB_SCHEMA } from "@/app/_lib/db-schema";

/**
 * Logger simple para queries (solo en desarrollo)
 */
function logQuery(sql: string, params?: unknown[], error?: unknown): void {
  if (process.env.NODE_ENV === "development") {
    if (error) {
      console.error("❌ Query failed:", { sql, params, error });
    } else {
      console.log("✅ Query executed:", { sql, params });
    }
  }
}

/**
 * Valida que la query use nombres de tabla cualificados
 * Solo en desarrollo para detectar problemas temprano
 */
function validateQualifiedTableNames(sql: string): void {
  if (process.env.NODE_ENV !== "development") return;

  // Pattern básico: detecta FROM/JOIN/INTO seguido de una palabra sin esquema
  const unqualifiedPattern =
    /\b(FROM|JOIN|INTO|UPDATE)\s+([a-z_][a-z0-9_]*)\b/gi;
  const matches = sql.matchAll(unqualifiedPattern);

  for (const match of matches) {
    const tableName = match[2];

    // Ignorar subconsultas, CTEs, y funciones
    if (tableName === "unnest" || tableName === "generate_series") continue;

    // Verificar que no tenga el esquema
    if (!sql.includes(`${DB_SCHEMA}.${tableName}`)) {
      console.warn(
        `⚠️  Possible unqualified table name: "${tableName}" in query. Consider using ${DB_SCHEMA}.${tableName}`
      );
    }
  }
}

/**
 * Ejecuta una consulta simple usando pool.query() directamente.
 * En modo HTTP (poolQueryViaFetch = true), esto es más eficiente que pool.connect()
 * ya que realiza una petición HTTP rápida que se cierra inmediatamente.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    validateQualifiedTableNames(sql);
    const result = await pool.query<T>(sql, params);
    logQuery(sql, params);
    return result.rows;
  } catch (error) {
    logQuery(sql, params, error);
    throw error;
  }
}

/**
 * Ejecuta una consulta y devuelve la primera fila o null.
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  try {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
  } catch (error) {
    // El error ya fue logueado en query()
    throw error;
  }
}

/**
 * Ejecuta una consulta de inserción/update/delete.
 */
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<number> {
  try {
    validateQualifiedTableNames(sql);
    const result = await pool.query(sql, params);
    logQuery(sql, params);
    return result.rowCount ?? 0;
  } catch (error) {
    logQuery(sql, params, error);
    throw error;
  }
}
