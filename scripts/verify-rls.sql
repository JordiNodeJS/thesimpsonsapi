-- ============================================
-- RLS VERIFICATION & MANAGEMENT SCRIPT
-- ============================================
-- Proyecto: The Simpsons API
-- Fecha: 19 de enero de 2026
-- Propósito: Verificar estado de RLS, performance, y facilitar rollback
-- ============================================

-- ============================================
-- 1. VERIFICAR ESTADO DE RLS
-- ============================================

-- 1.1. Listar todas las tablas con estado RLS
SELECT
    schemaname,
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status,
    pg_size_pretty(
        pg_total_relation_size(
            schemaname || '.' || tablename
        )
    ) as size
FROM pg_tables
WHERE
    schemaname = 'the_simpson'
ORDER BY rowsecurity DESC, tablename;

-- ============================================
-- 2. LISTAR TODAS LAS POLÍTICAS RLS
-- ============================================

-- 2.1. Políticas agrupadas por tabla
SELECT
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT cmd::text, ', ') as operations_covered
FROM pg_policies
WHERE
    schemaname = 'the_simpson'
GROUP BY
    tablename
ORDER BY tablename;

-- 2.2. Detalle de cada política
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN permissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END as type,
    CASE
        WHEN qual LIKE '%current_setting%' THEN 'Owner-based'
        WHEN qual LIKE '%EXISTS%' THEN 'Cascading ownership'
        WHEN qual = 'true' THEN 'Public read'
        ELSE 'Custom'
    END as policy_type,
    LENGTH(qual) + LENGTH(COALESCE(with_check, '')) as complexity_score
FROM pg_policies
WHERE
    schemaname = 'the_simpson'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 3. VERIFICAR PERFORMANCE DE POLÍTICAS
-- ============================================

-- 3.1. Verificar índices para columnas filtradas por RLS
SELECT
    t.tablename,
    i.indexname,
    i.indexdef,
    pg_size_pretty(
        pg_relation_size(i.indexname::regclass)
    ) as index_size,
    CASE
        WHEN i.indexdef LIKE '%user_id%' THEN '✅ Optimized for RLS'
        ELSE '⚠️ May not optimize RLS'
    END as rls_optimization
FROM pg_tables t
    LEFT JOIN pg_indexes i ON t.tablename = i.tablename
    AND t.schemaname = i.schemaname
WHERE
    t.schemaname = 'the_simpson'
    AND t.rowsecurity = true
ORDER BY t.tablename, i.indexname;

-- 3.2. Detectar tablas sin índice en user_id (RLS performance issue)
SELECT
    t.tablename,
    pg_size_pretty(
        pg_total_relation_size('the_simpson.' || t.tablename)
    ) as table_size,
    '⚠️ MISSING INDEX ON user_id' as recommendation
FROM pg_tables t
WHERE
    t.schemaname = 'the_simpson'
    AND t.rowsecurity = true
    AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE
            i.schemaname = t.schemaname
            AND i.tablename = t.tablename
            AND i.indexdef LIKE '%user_id%'
    )
ORDER BY pg_total_relation_size('the_simpson.' || t.tablename) DESC;

-- ============================================
-- 4. TEST DE AISLAMIENTO RLS
-- ============================================

-- IMPORTANTE: Ejecutar estos tests manualmente para verificar aislamiento

-- 4.1. Test de diary_entries
-- Usuario 1 crea entrada
SET app.current_user_id = 'test-user-1';
-- INSERT INTO the_simpson.diary_entries (user_id, activity_description, character_id, location_id)
-- VALUES ('test-user-1', 'Test entry from User 1', 1, 1);

-- Usuario 2 intenta ver entradas de Usuario 1
SET app.current_user_id = 'test-user-2';
-- SELECT * FROM the_simpson.diary_entries WHERE user_id = 'test-user-1';
-- ✅ EXPECTED: 0 rows (RLS blocks access)

-- Usuario 2 solo ve sus propias entradas
-- SELECT * FROM the_simpson.diary_entries;
-- ✅ EXPECTED: Only User 2's entries

-- 4.2. Test de character_comments (semi-público)
-- Usuario 1 crea comentario
SET app.current_user_id = 'test-user-1';
-- INSERT INTO the_simpson.character_comments (user_id, character_id, content)
-- VALUES ('test-user-1', 1, 'Test comment from User 1');

-- Usuario 2 puede leer comentarios (público)
SET app.current_user_id = 'test-user-2';
-- SELECT * FROM the_simpson.character_comments WHERE user_id = 'test-user-1';
-- ✅ EXPECTED: Can see User 1's comment (public read)

-- Usuario 2 NO puede editar comentarios de Usuario 1
-- UPDATE the_simpson.character_comments
-- SET content = 'Hacked!'
-- WHERE user_id = 'test-user-1';
-- ✅ EXPECTED: 0 rows updated (RLS blocks)

-- ============================================
-- 5. ROLLBACK SCRIPTS (USAR SOLO SI NECESARIO)
-- ============================================

-- 5.1. DESACTIVAR RLS EN UNA TABLA ESPECÍFICA
-- ALTER TABLE the_simpson.diary_entries DISABLE ROW LEVEL SECURITY;

-- 5.2. ELIMINAR UNA POLÍTICA ESPECÍFICA
-- DROP POLICY diary_entries_select_own ON the_simpson.diary_entries;

-- 5.3. ROLLBACK COMPLETO (DESACTIVAR TODO RLS)
-- ⚠️ CUIDADO: Esto elimina TODA la seguridad RLS

/*
DO $$
DECLARE
r RECORD;
BEGIN
-- Eliminar todas las políticas
FOR r IN 
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'the_simpson'
LOOP
EXECUTE format('DROP POLICY %I ON %I.%I', 
r.policyname, r.schemaname, r.tablename);
RAISE NOTICE 'Dropped policy: %.%', r.tablename, r.policyname;
END LOOP;

-- Desactivar RLS en todas las tablas
FOR r IN 
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'the_simpson' AND rowsecurity = true
LOOP
EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', 
r.schemaname, r.tablename);
RAISE NOTICE 'Disabled RLS on: %', r.tablename;
END LOOP;
END $$;
*/

-- 5.4. RECREAR UNA POLÍTICA (EJEMPLO: diary_entries)

/*
-- Habilitar RLS
ALTER TABLE the_simpson.diary_entries ENABLE ROW LEVEL SECURITY;

-- Recrear políticas
CREATE POLICY diary_entries_select_own ON the_simpson.diary_entries
FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY diary_entries_insert_own ON the_simpson.diary_entries
FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY diary_entries_update_own ON the_simpson.diary_entries
FOR UPDATE 
USING (user_id = current_setting('app.current_user_id', true))
WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY diary_entries_delete_own ON the_simpson.diary_entries
FOR DELETE USING (user_id = current_setting('app.current_user_id', true));
*/

-- ============================================
-- 6. MONITOREO DE QUERIES CON RLS
-- ============================================

-- 6.1. Ver consultas activas con RLS
SELECT
    pid,
    usename,
    state,
    LEFT(query, 100) as query_preview,
    CASE
        WHEN query LIKE '%app.current_user_id%' THEN '✅ RLS context set'
        ELSE '⚠️ No RLS context'
    END as rls_context
FROM pg_stat_activity
WHERE
    datname = 'neondb'
    AND state = 'active'
ORDER BY query_start DESC;

-- 6.2. Slow queries relacionadas con RLS
SELECT
    LEFT(query, 100) as query,
    calls,
    ROUND(mean_exec_time::numeric, 2) as avg_ms,
    ROUND(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
WHERE
    query LIKE '%the_simpson%'
    AND (
        query LIKE '%diary_entries%'
        OR query LIKE '%quote_collections%'
        OR query LIKE '%character_comments%'
    )
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================
-- 7. HEALTH CHECK COMPLETO
-- ============================================

SELECT
    'RLS Health Check' as check_type,
    (
        SELECT COUNT(*)
        FROM pg_tables
        WHERE
            schemaname = 'the_simpson'
            AND rowsecurity = true
    ) as tables_with_rls,
    (
        SELECT COUNT(*)
        FROM pg_policies
        WHERE
            schemaname = 'the_simpson'
    ) as total_policies,
    (
        SELECT COUNT(*)
        FROM pg_indexes
        WHERE
            schemaname = 'the_simpson'
            AND indexdef LIKE '%user_id%'
    ) as user_id_indexes,
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM pg_policies
            WHERE
                schemaname = 'the_simpson'
        ) >= 28 THEN '✅ All policies active'
        ELSE '⚠️ Missing policies'
    END as policy_status;

-- ============================================
-- 8. RECOMENDACIONES DE OPTIMIZACIÓN
-- ============================================

-- 8.1. Verificar que todas las tablas RLS tienen índices apropiados
WITH
    rls_tables AS (
        SELECT tablename
        FROM pg_tables
        WHERE
            schemaname = 'the_simpson'
            AND rowsecurity = true
    ),
    indexed_tables AS (
        SELECT DISTINCT
            tablename
        FROM pg_indexes
        WHERE
            schemaname = 'the_simpson'
            AND indexdef LIKE '%user_id%'
    )
SELECT
    rt.tablename,
    CASE
        WHEN it.tablename IS NOT NULL THEN '✅ Indexed'
        ELSE '⚠️ NEEDS INDEX: CREATE INDEX ' || rt.tablename || '_user_id_idx ON the_simpson.' || rt.tablename || '(user_id);'
    END as index_status
FROM
    rls_tables rt
    LEFT JOIN indexed_tables it ON rt.tablename = it.tablename
ORDER BY rt.tablename;

-- ============================================
-- 9. EXPORTAR CONFIGURACIÓN RLS
-- ============================================

-- 9.1. Generar script de backup de políticas
SELECT
    'CREATE POLICY ' || policyname || ' ON ' || schemaname || '.' || tablename || ' FOR ' || cmd::text || CASE
        WHEN qual IS NOT NULL THEN ' USING (' || qual || ')'
        ELSE ''
    END || CASE
        WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')'
        ELSE ''
    END || ';' as policy_creation_script
FROM pg_policies
WHERE
    schemaname = 'the_simpson'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para ejecutar secciones específicas:
-- 1. Verificación rápida: Ejecutar secciones 1-3
-- 2. Test completo: Ejecutar secciones 1-4
-- 3. Rollback: Ejecutar sección 5 (CON CUIDADO)
-- 4. Monitoreo: Ejecutar secciones 6-8