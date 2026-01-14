# Vercel Environment Variables Sync - Quick Start

## 🎯 Propósito

Esta skill y sus scripts asociados garantizan que todas las variables de entorno definidas localmente (en `.env.example`, `.env`, `.env.local`) estén correctamente configuradas en Vercel para todos los entornos (production, preview, development).

## 📦 Componentes

### Scripts

1. **`scripts/audit-vercel-env.sh`** - Reporte completo del estado de sincronización
2. **`scripts/sync-vercel-env.sh`** - Sincronización automática de variables
3. **`scripts/check-vercel-env.sh`** - Verificación rápida de variables faltantes

### Documentación

- **`.github/skills/vercel-env-sync/SKILL.md`** - Skill completa con todos los patrones y best practices

## 🚀 Uso Rápido

### Auditar Estado Actual

```bash
./scripts/audit-vercel-env.sh
```

**Output esperado:**

```
🔍 Auditoría de Variables de Entorno
═══════════════════════════════════

1️⃣  Verificando autenticación...
   ✓ Autenticado como: melosdev

2️⃣  Verificando proyecto...
   ✓ Proyecto vinculado: wispy-poetry-52762475

3️⃣  Analizando archivos locales...
   ✓ Encontradas 4 variables en .env.example

4️⃣  Consultando variables en Vercel...
   ✓ Production: 4 variables
   ✓ Preview: 4 variables
   ✓ Development: 4 variables

5️⃣  Generando reporte...

Variable                       Production   Preview      Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE_URL                   ✓ Existe    ✓ Existe    ✓ Existe
NEXT_PUBLIC_APP_URL            ✓ Existe    ✓ Existe    ✓ Existe
BETTER_AUTH_SECRET             ✓ Existe    ✓ Existe    ✓ Existe
BETTER_AUTH_URL                ✓ Existe    ✓ Existe    ✓ Existe
```

### Sincronizar Variables

#### Solo Production

```bash
./scripts/sync-vercel-env.sh --env production
```

#### Todos los Entornos

```bash
./scripts/sync-vercel-env.sh --all-envs
```

#### Forzar Actualización (Sobrescribir Existentes)

```bash
./scripts/sync-vercel-env.sh --all-envs --force
```

### Verificación Rápida

```bash
./scripts/check-vercel-env.sh
```

## 📋 Variables Requeridas (The Simpsons API)

### `.env.example`

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database

# App URL (for Better Auth callbacks)
NEXT_PUBLIC_APP_URL=https://thesimpson.webcode.es

# Better Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# Better Auth URL (same as NEXT_PUBLIC_APP_URL)
BETTER_AUTH_URL=https://thesimpson.webcode.es
```

### `.env.local` (Development)

```bash
DATABASE_URL=postgresql://[tu-conexion-neon]
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=[generado-con-openssl]
```

## 🔒 Generar Secrets Seguros

```bash
# Generar BETTER_AUTH_SECRET
openssl rand -base64 32
```

## 🔄 Workflow Completo

### Pre-Deployment Checklist

```bash
# 1. Verificar autenticación
vercel whoami

# 2. Auditar estado actual
./scripts/audit-vercel-env.sh

# 3. Si hay faltantes, sincronizar
./scripts/sync-vercel-env.sh --all-envs

# 4. Verificar sincronización
./scripts/audit-vercel-env.sh

# 5. Deploy con confianza
vercel --prod
```

## ✅ Estado Actual (Enero 14, 2026)

Todas las variables están correctamente sincronizadas:

- ✅ **DATABASE_URL**: Production, Preview, Development
- ✅ **NEXT_PUBLIC_APP_URL**: Production, Preview, Development
- ✅ **BETTER_AUTH_SECRET**: Production, Preview, Development
- ✅ **BETTER_AUTH_URL**: Production, Preview, Development

**Total:** 4/4 variables en 3 entornos = 12/12 ✓

## 🐛 Troubleshooting

### Error: "Not authenticated"

```bash
vercel login
```

### Error: "No project linked"

```bash
vercel link
```

### Variable no se actualiza

```bash
# Usar --force para sobrescribir
./scripts/sync-vercel-env.sh --all-envs --force
```

### Permisos de ejecución

```bash
chmod +x scripts/*.sh
```

## 📚 Documentación Completa

Ver [.github/skills/vercel-env-sync/SKILL.md](.github/skills/vercel-env-sync/SKILL.md) para:

- 7 patrones avanzados
- Integración con CI/CD
- Validación de valores
- Backup automático
- Best practices completas
- Troubleshooting detallado

## 🎯 Casos de Uso

### Onboarding de Nuevo Desarrollador

```bash
# 1. Clonar repo
git clone https://github.com/JordiNodeJS/thesimpsonsapi.git

# 2. Pull variables de Vercel
vercel env pull .env.local

# 3. Verificar que tiene todo
./scripts/check-vercel-env.sh
```

### Pre-Deploy Validation

```bash
# Añadir a .github/workflows/deploy.yml
- name: Validate Environment Variables
  run: ./scripts/audit-vercel-env.sh
```

### Agregar Nueva Variable

```bash
# 1. Añadir a .env.example
echo "NEW_VAR=value" >> .env.example

# 2. Añadir valor real a .env.local
echo "NEW_VAR=real-value" >> .env.local

# 3. Sincronizar a Vercel
./scripts/sync-vercel-env.sh --all-envs
```

## 🔗 Related Skills

- **vercel-cli-management**: Gestión general de Vercel CLI
- **nextjs16-proxy-middleware**: Configuración de middleware que usa env vars
- **neon-database-management**: Gestión de DATABASE_URL y conexiones

---

**Última Actualización:** Enero 14, 2026  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)  
**Status:** ✅ Testeado y en producción
