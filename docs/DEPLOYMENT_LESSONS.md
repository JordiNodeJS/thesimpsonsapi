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

## 3. Gestión de Esquemas con `search_path`

### El Problema

Por defecto, PostgreSQL busca tablas en el esquema `public`. Si los datos están en un esquema personalizado (como `the_simpson`), las consultas fallarán a menos que se especifique el esquema en cada tabla o se configure el "camino de búsqueda".

### La Lección

Configurar el esquema directamente en la cadena de conexión es la forma más robusta de asegurar que la app siempre encuentre los datos, especialmente en entornos donde las conexiones se crean y destruyen constantemente.

- **Solución:** Añadir `?options=-c%20search_path%3Dthe_simpson,public` a la `DATABASE_URL`.

## 4. Resiliencia en Server Components

### El Problema

Un fallo momentáneo en la base de datos o una variable de entorno mal configurada provocaba que Next.js lanzara un error 500 global, rompiendo toda la experiencia del usuario.

### La Lección

Las páginas que dependen de datos externos deben ser resilientes.

- **Solución:** Implementar bloques `try-catch` dentro de los Server Components. Si la carga de datos falla, se debe capturar el error y mostrar un estado de fallback amigable (ej. "Servicio temporalmente no disponible") en lugar de permitir que la aplicación colapse.

---

_Documento creado el 28 de diciembre de 2025 como referencia para futuros desarrollos._
