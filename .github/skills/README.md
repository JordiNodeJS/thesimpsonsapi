# Skills Directory

Este directorio contiene skills especializadas que proporcionan conocimiento específico del dominio para diferentes aspectos del desarrollo de The Simpsons API.

## 📚 Skills Disponibles

### Development & Architecture

- **[component-development](./component-development/SKILL.md)**: Patrones y mejores prácticas para desarrollar componentes React 19 con Shadcn UI, Radix primitives, y Tailwind CSS 4 en Next.js 16. Cubre accesibilidad, composición, variantes, y patrones server/client.

- **[server-actions-patterns](./server-actions-patterns/SKILL.md)**: Patrones completos para Next.js 16 Server Actions incluyendo mutaciones, manejo de errores, revalidación, type safety, y manejo de formularios.

### Testing & Quality

- **[testing-automation](./testing-automation/SKILL.md)**: Patrones de testing completos para aplicaciones Next.js 16 incluyendo unit tests con Vitest, integration tests, E2E tests con Playwright, component testing, y coverage reporting.

- **[webapp-testing](./webapp-testing/SKILL.md)**: Testing UI/UX completo usando Chrome DevTools MCP para inspección visual, validación de interacciones, y debugging. Incluye integración con Next.js DevTools para diagnósticos específicos del framework.

- **[performance-optimization](./performance-optimization/SKILL.md)**: Estrategias de optimización de performance para aplicaciones Next.js 16 incluyendo Core Web Vitals, caching, optimización de imágenes, análisis de bundle, optimización de queries de base de datos, y auditorías Lighthouse.

### Database & Infrastructure

- **[neon-database-management](./neon-database-management/SKILL.md)**: Gestión completa de bases de datos Neon PostgreSQL usando Model Context Protocol (MCP). Cubre migraciones, queries, schema management, y branching strategies.

### Deployment & DevOps

- **[vercel-cli-management](./vercel-cli-management/SKILL.md)**: Gestión completa de Vercel CLI para deployment de aplicaciones Next.js. Cubre instalación, autenticación, gestión de proyectos, deployments, variables de entorno, dominios, y CI/CD.

- **[vercel-env-sync](./vercel-env-sync/SKILL.md)**: ✨ **UPDATED** ✨ Verificación, comparación y sincronización de variables de entorno entre archivos locales y Vercel. Incluye scripts modernos (env-push.sh, env-pull.sh, env-audit.sh), biblioteca de funciones compartidas, validación automática de seguridad, y soporte completo para Vercel CLI 33+. Garantiza sincronización perfecta en todos los entornos.

- **[github-pull-request](./github-pull-request/SKILL.md)**: Creación, actualización y merge de GitHub pull requests usando GitHub CLI. Maneja el ciclo completo de PR incluyendo validación, creación, labeling, review, y squash merge.

### Next.js 16 Specific

- **[nextjs16-proxy-middleware](./nextjs16-proxy-middleware/SKILL.md)**: Guía completa para Next.js 16 proxy/middleware patterns. Cubre migración de middleware.ts a proxy.ts, configuraciones de matcher, 7 patrones comunes (auth, CORS, rewrites, cookies, headers, rate limiting), testing, y troubleshooting.

## 🎯 Uso de Skills

Las skills están diseñadas para ser consultadas por AI agents cuando necesiten conocimiento especializado. Cada skill proporciona:

- **Overview**: Descripción del propósito y alcance
- **Core Patterns**: Patrones fundamentales con ejemplos de código
- **Advanced Patterns**: Técnicas avanzadas para casos de uso complejos
- **Troubleshooting**: Soluciones a problemas comunes
- **Best Practices**: Recomendaciones y convenciones
- **Quick Reference**: Comandos y snippets esenciales

## 📝 Crear Nueva Skill

Usa la plantilla en [SKILL_TEMPLATE.md](./SKILL_TEMPLATE.md) como punto de partida para crear nuevas skills.

## 🔗 Relaciones entre Skills

```
component-development
  ↓
server-actions-patterns ──→ neon-database-management
  ↓                              ↓
testing-automation           vercel-env-sync
  ↓                              ↓
webapp-testing               vercel-cli-management
  ↓                              ↓
performance-optimization     github-pull-request
```

## 🚀 Skills Recientes

### vercel-env-sync (Enero 2026 - v2.0)

**Nueva versión** con arquitectura moderna según estándar VS Code Agent Skills:

```bash
# Nueva estructura
.github/skills/vercel-env-sync/
├── SKILL.md                     # Documentación completa con YAML frontmatter
├── scripts/
│   ├── env-push.sh             # Sincronizar local → Vercel (usa vercel env update)
│   ├── env-pull.sh             # Descargar Vercel → local
│   └── env-audit.sh            # Reporte completo de estado
└── lib/
    └── env-functions.sh        # 20+ funciones compartidas reutilizables

# Quick start
cd .github/skills/vercel-env-sync
chmod +x scripts/*.sh lib/*.sh

# Verificar salud
source lib/env-functions.sh && vercel::env::health_check

# Auditar estado
./scripts/env-audit.sh

# Sincronizar (dry-run primero)
./scripts/env-push.sh --all-envs --dry-run
./scripts/env-push.sh --all-envs
```

**Mejoras clave v2.0:**

- ✅ Scripts dentro de skill según [VS Code Agent Skills standard](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- ✅ YAML frontmatter para auto-discovery por Copilot
- ✅ Funciones compartidas en `lib/` reutilizables
- ✅ Usa `vercel env update` (moderno) en lugar de `rm + add` (deprecado)
- ✅ Auto-detección de variables sensibles con flag `--sensitive`
- ✅ Validación automática (URLs, longitud de secrets, formato PostgreSQL)
- ✅ Soporte `--dry-run` para preview de cambios
- ✅ Backups automáticos antes de modificaciones
- ✅ Salida JSON para integración CI/CD
- ✅ Compatible con Git Bash (Windows), Bash 4+, Vercel CLI 33+

Ver [vercel-env-sync/SKILL.md](./vercel-env-sync/SKILL.md) para documentación completa.

## 📚 Convenciones

Todas las skills siguen estas convenciones:

- **Nombre de archivo**: `SKILL.md` (consistente en todos los directorios)
- **Formato**: Markdown con secciones bien definidas
- **Ejemplos**: Código funcional y probado
- **Referencias**: Links a documentación oficial
- **Actualización**: Se actualizan cuando cambian las tecnologías base

## 🤝 Contribuir

Para añadir o mejorar skills:

1. Usa [SKILL_TEMPLATE.md](./SKILL_TEMPLATE.md)
2. Incluye ejemplos prácticos y probados
3. Documenta troubleshooting y edge cases
4. Actualiza este README con la nueva skill
5. Crea PR con descripción detallada

---

Última actualización: Enero 14, 2026
