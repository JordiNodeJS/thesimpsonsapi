#!/usr/bin/env node

/**
 * Script de verificación rápida de la conexión a Neon
 * Verifica:
 * 1. Conexión a la base de datos
 * 2. Acceso al esquema the_simpson
 * 3. Tablas disponibles en el esquema
 * 4. Primeros registros de cada tabla
 */

import { Pool } from "@neondatabase/serverless";

const projectId =
  process.env.NEXT_PUBLIC_NEON_PROJECT || "billowing-grass-71670123";
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL no está configurada");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function runCheck() {
  console.log("\n🔍 VERIFICACIÓN DE CONEXIÓN A NEON\n");
  console.log(`📦 Proyecto: ${projectId}`);
  console.log(`🗄️  URL: ${dbUrl?.split("@")[1]?.split(":")[0] || "N/A"}`);

  try {
    // 1. Verificar conexión básica
    console.log("\n1️⃣  Verificando conexión a la base de datos...");
    const connTest = await pool.query("SELECT NOW()");
    console.log("✅ Conexión exitosa a PostgreSQL");
    console.log(`   Servidor en: ${connTest.rows[0].now}`);

    // 2. Listar esquemas disponibles
    console.log("\n2️⃣  Esquemas disponibles en la BD:");
    const schemas = await pool.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' ORDER BY schema_name`
    );
    schemas.rows.forEach((row) => {
      const isCurrent = row.schema_name === "the_simpson" ? "✨" : "  ";
      console.log(`   ${isCurrent} ${row.schema_name}`);
    });

    // 3. Verificar esquema the_simpson
    console.log("\n3️⃣  Accediendo al esquema 'the_simpson'...");
    const schemaCheck = await pool.query(
      `SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'the_simpson'
      ) as exists`
    );

    if (!schemaCheck.rows[0].exists) {
      console.error("❌ El esquema 'the_simpson' NO existe");
      process.exit(1);
    }
    console.log("✅ Esquema 'the_simpson' encontrado");

    // 4. Listar tablas en el esquema
    console.log("\n4️⃣  Tablas en el esquema 'the_simpson':");
    const tables = await pool.query(
      `SELECT table_name, table_type 
       FROM information_schema.tables 
       WHERE table_schema = 'the_simpson' 
       ORDER BY table_name`
    );

    if (tables.rows.length === 0) {
      console.error("❌ No hay tablas en el esquema 'the_simpson'");
      process.exit(1);
    }

    for (const table of tables.rows) {
      const rowCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM the_simpson.${table.table_name}`
      );
      const rowCount = rowCountResult.rows[0].count;
      console.log(`   📋 ${table.table_name} (${rowCount} filas)`);
    }

    // 5. Verificar integridad de tablas críticas
    console.log("\n5️⃣  Verificación de tablas críticas:");
    const criticalTables = ["characters", "episodes", "users"];

    for (const tableName of criticalTables) {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM the_simpson.${tableName}`
      );
      const count = result.rows[0].count;
      const status = count > 0 ? "✅" : "⚠️ ";
      console.log(`   ${status} ${tableName}: ${count} registros`);
    }

    // 6. Test de query con TABLES cualificadas
    console.log("\n6️⃣  Test de queries con nombres cualificados:");
    const charTest = await pool.query(
      "SELECT COUNT(*) as count FROM the_simpson.characters"
    );
    console.log(
      `   ✅ SELECT FROM the_simpson.characters: ${charTest.rows[0].count} registros`
    );

    const epTest = await pool.query(
      "SELECT COUNT(*) as count FROM the_simpson.episodes"
    );
    console.log(
      `   ✅ SELECT FROM the_simpson.episodes: ${epTest.rows[0].count} registros`
    );

    console.log("\n✨ VERIFICACIÓN COMPLETADA EXITOSAMENTE ✨\n");
    console.log("Resumen:");
    console.log("  ✅ Conexión a Neon establecida");
    console.log("  ✅ Esquema 'the_simpson' accesible");
    console.log(`  ✅ ${tables.rows.length} tablas encontradas`);
    console.log("  ✅ Queries con nombres cualificados funcionan");
  } catch (error) {
    console.error("\n❌ Error durante la verificación:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runCheck();
