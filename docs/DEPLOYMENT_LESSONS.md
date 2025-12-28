# Lecciones Aprendidas: Despliegue con Vercel y Neon

Este documento resume los desafíos técnicos encontrados durante el despliegue de **The Simpsons API** y las soluciones aplicadas para optimizar la comunicación entre Next.js (Vercel) y PostgreSQL (Neon).

## 1. Evolución del Driver de Neon (`@neondatabase/serverless`)

### El Problema

El uso de propiedades obsoletas en la configuración del driver provocaba fallos en el proceso de compilación (Build) de TypeScript.

- **Error:** `Property 'fetchConnection' does not exist on type 'typeof neonConfig'`.
- **Causa:** A partir de la versión `1.0.0`, el driver de Neon renombró varias propiedades de configuración.

### La Lección

Siempre verificar los cambios en las versiones mayores de los drivers serverless.

- **Solución:** Usar `neonConfig.poolQueryViaFetch = true` para habilitar consultas sobre HTTP en lugar de WebSockets.

## 2. HTTP vs WebSockets en Entornos Serverless

### El Problema

Las funciones serverless de Vercel tienen un ciclo de vida corto. Mantener conexiones persistentes mediante WebSockets (`pool.connect()`) puede agotar rápidamente el pool de conexiones o causar excepciones de servidor si la conexión se interrumpe.

### La Lección

Para consultas "stateless" (sin estado) en Server Components:

- **Solución:** Preferir `pool.query()` sobre `pool.connect()`. Al usar `pool.query()` junto con `poolQueryViaFetch`, el driver realiza una petición HTTP rápida que se cierra inmediatamente después de recibir los datos, eliminando la sobrecarga de gestión de conexiones persistentes.

## 3. Gestión de Esquemas con `search_path` y HTTP Fetch

### El Problema

El modo HTTP de Neon (`poolQueryViaFetch = true`) es excelente para el rendimiento en Vercel, pero tiene una limitación crítica: **ignora los parámetros de sesión** como `search_path` pasados en la URL de conexión (`options=-c search_path=...`). Esto causaba que, aunque la conexión fuera exitosa, la base de datos no encontrara las tablas en el esquema `the_simpson`.

### La Lección

Cuando se utiliza un esquema personalizado en Neon con el driver HTTP:

- **Solución A (Recomendada):** Usar **nombres de tabla cualificados** en las consultas SQL (ej. `SELECT * FROM the_simpson.characters`). Esto elimina la dependencia del `search_path` y permite mantener las ventajas de rendimiento del protocolo HTTP.
- **Solución B:** Desactivar `poolQueryViaFetch` para forzar el uso de WebSockets, que sí respetan el `search_path` de la URL, aunque con una ligera penalización de rendimiento en entornos serverless.
- **Solución C:** Configurar el `search_path` de forma permanente a nivel de usuario en la base de datos (`ALTER USER ... SET search_path TO ...`).

## 4. Resiliencia en Server Components

### El Problema

Un fallo momentáneo en la base de datos o una variable de entorno mal configurada provocaba que Next.js lanzara un error 500 global, rompiendo toda la experiencia del usuario.

### La Lección

Las páginas que dependen de datos externos deben ser resilientes.

- **Solución:** Implementar bloques `try-catch` dentro de los Server Components. Si la carga de datos falla, se debe capturar el error y mostrar un estado de fallback amigable (ej. "Servicio temporalmente no disponible") en lugar de permitir que la aplicación colapse.

## 5. Aplicación Práctica: Migración a Nombres de Tabla Cualificados

### El Problema (Descubierto el 29 de diciembre de 2025)

Durante el despliegue en Vercel, todas las páginas mostraban el error **"Failed to load episodes. Please try again later."** aunque las consultas HTTP devolvían código 200 exitoso. El problema no estaba en la conexión de red, sino en la ejecución de las consultas SQL.

### Análisis de Causa Raíz

Tras revisar la arquitectura de la aplicación:

1. El archivo `db-utils.ts` usaba `pool.connect()` seguido de `SET search_path TO the_simpson, public`
2. Aunque esto funciona en desarrollo, en producción con `poolQueryViaFetch = true`, el parámetro `search_path` se **ignora silenciosamente**
3. Las consultas SQL sin el prefijo `the_simpson.` fallaban al no encontrar las tablas
4. Los errores no se propagaban a la consola del navegador, solo mostraban el mensaje de fallback

### La Lección

**La teoría en la documentación debe validarse contra la realidad del código.** La sección 3 (Gestión de Esquemas) ya mencionaba este problema, pero el código aún usaba `SET search_path` en lugar de nombres cualificados.

### Solución Aplicada (Implementación Correcta)

Se completó la migración a la **Solución A (Recomendada)** implementando nombres de tabla cualificados en:

1. **Todas las consultas en `repositories.ts`:**

   - `SELECT * FROM the_simpson.characters`
   - `SELECT * FROM the_simpson.episodes`
   - `SELECT * FROM the_simpson.locations`
   - etc.

2. **Todas las operaciones en los archivos `_actions/`:**

   - `INSERT INTO the_simpson.character_follows`
   - `DELETE FROM the_simpson.diary_entries`
   - `INSERT INTO the_simpson.quote_collections`
   - etc.

3. **Optimización de `db-utils.ts`:**
   - Eliminado el patrón `withConnection()` que usaba `pool.connect()`
   - Cambio a `pool.query()` directamente para aprovechar el protocolo HTTP
   - Reducción de sobrecarga de conexiones persistentes

### Resultados

✅ **Todas las páginas funcionales:**

- Página de episodios: carga 50+ episodios correctamente
- Página de personajes: carga 50+ personajes correctamente
- Acciones de usuario (diary, collections): funcionan sin errores
- Sin cambios en variables de entorno ni configuración de BD

### Recomendaciones para el Futuro

1. **Validar en staging:** Antes de hacer deploy a producción, siempre validar contra Vercel Preview Deployments
2. **Revisar Server Components:** Los errores en async components pueden quedar silenciosos si solo mostramos fallbacks
3. **Monitoreo en consola:** Agregar logs más detallados (`console.error`) en los catch blocks para debugging remoto
4. **Nombramiento de tablas:** Adoptar convenión de **siempre usar nombres cualificados** en esquemas personalizados, incluso si el `search_path` funciona localmente

---

_Documento actualizado el 29 de diciembre de 2025 con lecciones de validación en producción._
