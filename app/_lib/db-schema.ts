/**
 * Configuración centralizada del esquema de la base de datos
 *
 * IMPORTANTE: Todas las queries deben usar nombres cualificados (schema.table)
 * porque `poolQueryViaFetch = true` ignora el search_path de la conexión.
 *
 * Ver: docs/DEPLOYMENT_LESSONS.md
 */

/**
 * Esquema principal de la aplicación en Neon
 */
export const DB_SCHEMA = "the_simpson" as const;

/**
 * Helper para construir nombres de tabla cualificados
 */
export const table = (name: string) => `${DB_SCHEMA}.${name}` as const;

/**
 * Nombres de tabla cualificados para uso en queries
 */
export const TABLES = {
  // Core data (synced)
  characters: table("characters"),
  episodes: table("episodes"),
  locations: table("locations"),

  // User data
  users: table("users"),
  userEpisodeProgress: table("user_episode_progress"),
  characterFavorites: table("character_favorites"),
  characterFollows: table("character_follows"),
  characterComments: table("character_comments"),

  // Features
  triviaFacts: table("trivia_facts"),
  diaryEntries: table("diary_entries"),
  quoteCollections: table("quote_collections"),
  collectionQuotes: table("collection_quotes"),

  // Better Auth tables
  sessions: table("session"),
  accounts: table("account"),
  verifications: table("verification"),
} as const;

/**
 * Valida que el esquema esté configurado correctamente
 * Se ejecuta en tiempo de desarrollo para detectar problemas temprano
 */
export function validateSchemaConfig(): void {
  if (!DB_SCHEMA) {
    throw new Error("DB_SCHEMA no está definido");
  }

  // Validación básica: el esquema no debe tener espacios ni caracteres raros
  if (!/^[a-z_][a-z0-9_]*$/.test(DB_SCHEMA)) {
    throw new Error(
      `DB_SCHEMA inválido: "${DB_SCHEMA}". Debe ser un identificador SQL válido.`
    );
  }
}

// Validar en tiempo de carga del módulo (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  validateSchemaConfig();
}
