# Vercel CLI Management

## Overview

Esta skill proporciona patrones y mejores prácticas para usar Vercel CLI en el desarrollo y deployment de aplicaciones Next.js. Cubre gestión de variables de entorno, deployments, proyectos, y workflows de CI/CD.

## Instalación

### Global (Recomendado)

```bash
# npm
npm install -g vercel

# pnpm
pnpm add -g vercel

# yarn
yarn global add vercel
```

### Local (Por Proyecto)

```bash
# npm
npm install --save-dev vercel

# pnpm
pnpm add -D vercel

# yarn
yarn add -D vercel
```

### Verificar Instalación

```bash
vercel --version
# Output: Vercel CLI 50.3.3
```

## Autenticación

### Login Interactivo

```bash
vercel login
```

Opciones de autenticación:

- GitHub
- GitLab
- Bitbucket
- Email

### Login con Token

```bash
vercel login --token <YOUR_TOKEN>
```

Para obtener un token:

1. Ir a https://vercel.com/account/tokens
2. Crear nuevo token
3. Guardar el token de forma segura

### Verificar Estado de Autenticación

```bash
vercel whoami
# Output: tu-username
```

### Logout

```bash
vercel logout
```

## Gestión de Proyectos

### Inicializar Proyecto

```bash
# En el directorio del proyecto
vercel

# Primera vez, creará .vercel/project.json
```

Esto vincula tu proyecto local con Vercel.

### Vincular Proyecto Existente

```bash
vercel link
```

Opciones:

- Vincular a proyecto existente
- Crear nuevo proyecto
- Especificar scope (personal/team)

### Ver Información del Proyecto

```bash
vercel inspect
```

### Cambiar Configuración del Proyecto

```bash
vercel project <command>

# Comandos disponibles:
vercel project ls              # Listar proyectos
vercel project add             # Agregar proyecto
vercel project rm <name>       # Eliminar proyecto
```

## Deployments

### Deploy a Preview (Branch)

```bash
# Deploy automático (detecta branch actual)
vercel

# Especificar nombre del deployment
vercel --name my-preview
```

### Deploy a Production

```bash
vercel --prod
```

### Deploy con Build Específico

```bash
# Forzar rebuild
vercel --force

# Usar build cache
vercel --build-env SKIP_BUILD_CACHE=false
```

### Deploy desde CI/CD

```bash
# GitHub Actions, GitLab CI, etc.
vercel deploy --token=$VERCEL_TOKEN --prod
```

### Ver Deployments

```bash
# Listar últimos deployments
vercel ls

# Listar deployments con más detalles
vercel ls --meta
```

### Inspeccionar Deployment

```bash
vercel inspect <deployment-url>
```

### Promover Preview a Production

```bash
vercel promote <deployment-url>
```

### Eliminar Deployment

```bash
vercel remove <deployment-url>

# Confirmar eliminación sin prompt
vercel remove <deployment-url> --yes
```

## Gestión de Variables de Entorno

### Listar Variables de Entorno

```bash
# Todas las variables
vercel env ls

# Por tipo de entorno
vercel env ls production
vercel env ls preview
vercel env ls development
```

### Agregar Variable de Entorno

#### Método 1: Interactivo

```bash
vercel env add <NAME>
```

El CLI preguntará:

1. El valor de la variable
2. Si es sensible (encrypted)
3. En qué entornos aplicarla (production, preview, development)

#### Método 2: No Interactivo (CI/CD)

```bash
# Agregar a production
echo "my-secret-value" | vercel env add MY_SECRET production

# Agregar a múltiples entornos
echo "my-value" | vercel env add MY_VAR production preview development
```

#### Método 3: Desde Archivo

```bash
# Leer valor desde archivo
cat secret.txt | vercel env add MY_SECRET production

# Usar heredoc
vercel env add DATABASE_URL production << EOF
postgresql://user:password@host:5432/database
EOF
```

### Actualizar Variable de Entorno

```bash
# Método 1: Eliminar y recrear
vercel env rm MY_VAR production
echo "new-value" | vercel env add MY_VAR production

# Método 2: Pull, editar, push (desarrollo local)
vercel env pull .env.local
# Editar .env.local manualmente
vercel env add MY_VAR development < .env.local
```

### Eliminar Variable de Entorno

```bash
# Eliminar de un entorno específico
vercel env rm MY_VAR production

# Eliminar sin confirmación
vercel env rm MY_VAR production --yes
```

### Pull Variables de Entorno (Desarrollo Local)

```bash
# Descargar variables de development
vercel env pull

# Descargar a archivo específico
vercel env pull .env.local

# Descargar de environment específico
vercel env pull .env.production --environment=production
```

Esto crea un archivo `.env.local` (o el especificado) con las variables.

⚠️ **IMPORTANTE**: Agregar `.env*.local` al `.gitignore`

### Mejores Prácticas para Variables de Entorno

#### 1. Estructura de Variables por Entorno

```bash
# Production
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add BETTER_AUTH_SECRET production

# Preview (para testing en PRs)
vercel env add DATABASE_URL preview
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add BETTER_AUTH_SECRET preview

# Development
vercel env pull .env.local
```

#### 2. Variables Públicas (NEXT*PUBLIC*\*)

```bash
# Estas son expuestas al cliente
echo "https://thesimpson.webcode.es" | vercel env add NEXT_PUBLIC_APP_URL production
```

#### 3. Variables Sensibles

```bash
# Marcar como sensible para encryption
vercel env add BETTER_AUTH_SECRET production
# ¿Marcar como sensible? (y/N): y
```

#### 4. Script de Configuración Inicial

```bash
#!/bin/bash
# setup-env.sh

# Production
echo "$DATABASE_URL_PROD" | vercel env add DATABASE_URL production
echo "$BETTER_AUTH_SECRET_PROD" | vercel env add BETTER_AUTH_SECRET production
echo "https://thesimpson.webcode.es" | vercel env add NEXT_PUBLIC_APP_URL production
echo "https://thesimpson.webcode.es" | vercel env add BETTER_AUTH_URL production

# Preview
echo "$DATABASE_URL_PREVIEW" | vercel env add DATABASE_URL preview
echo "$BETTER_AUTH_SECRET_PREVIEW" | vercel env add BETTER_AUTH_SECRET preview
echo "https://preview.thesimpson.webcode.es" | vercel env add NEXT_PUBLIC_APP_URL preview
```

Ejecutar:

```bash
chmod +x setup-env.sh
./setup-env.sh
```

## Logs y Debugging

### Ver Logs de Deployment

```bash
# Logs en tiempo real
vercel logs <deployment-url>

# Logs con filtro
vercel logs <deployment-url> --follow
```

### Ver Logs de Production

```bash
vercel logs --prod
```

### Filtrar Logs

```bash
# Por función
vercel logs <deployment-url> --function=api/hello

# Por status code
vercel logs <deployment-url> --status=500
```

## Dominios

### Listar Dominios

```bash
vercel domains ls
```

### Agregar Dominio

```bash
vercel domains add thesimpson.webcode.es
```

### Verificar Dominio

```bash
vercel domains inspect thesimpson.webcode.es
```

### Asignar Dominio a Proyecto

```bash
# Agregar dominio al proyecto actual
vercel alias set <deployment-url> thesimpson.webcode.es

# O simplemente
vercel domains add thesimpson.webcode.es --project=thesimpsonsapi
```

### Eliminar Dominio

```bash
vercel domains rm thesimpson.webcode.es
```

## Secrets (Deprecated - Usar `vercel env`)

⚠️ **Nota**: Los secrets están deprecated. Usar `vercel env` en su lugar.

```bash
# Método legacy (no recomendado)
vercel secrets add my-secret "my-value"
vercel secrets ls
vercel secrets rm my-secret

# Método moderno (recomendado)
echo "my-value" | vercel env add MY_SECRET production
```

## Aliases

### Crear Alias

```bash
# Asignar deployment a dominio
vercel alias set <deployment-url> thesimpson.webcode.es

# Alias a subdomain
vercel alias set <deployment-url> app.thesimpson.webcode.es
```

### Listar Aliases

```bash
vercel alias ls
```

### Eliminar Alias

```bash
vercel alias rm thesimpson.webcode.es
```

## Teams y Collaboration

### Listar Teams

```bash
vercel teams ls
```

### Cambiar a Team

```bash
vercel switch <team-name>
```

### Invitar Miembros

```bash
vercel teams invite <email> --team=<team-name>
```

## Configuración (vercel.json)

### Estructura Básica

```json
{
  "version": 2,
  "name": "thesimpsonsapi",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://thesimpson.webcode.es"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Redirects

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    },
    {
      "source": "/blog/:slug",
      "destination": "/news/:slug",
      "permanent": false
    }
  ]
}
```

### Rewrites

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.external.com/:path*"
    }
  ]
}
```

### Headers

```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Variables Necesarias en GitHub Secrets

```bash
# Obtener tokens
VERCEL_TOKEN           # Token de Vercel
VERCEL_ORG_ID          # ID de organización (en .vercel/project.json)
VERCEL_PROJECT_ID      # ID de proyecto (en .vercel/project.json)
```

Para obtener IDs:

```bash
# Después de vercel link
cat .vercel/project.json
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  image: node:18
  stage: deploy
  script:
    - npm install -g vercel
    - vercel pull --yes --environment=production --token=$VERCEL_TOKEN
    - vercel build --prod --token=$VERCEL_TOKEN
    - vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
  only:
    - main
```

## Comandos Útiles

### Desarrollo Local

```bash
# Simular entorno de Vercel localmente
vercel dev

# Con puerto específico
vercel dev --port 3001

# Con variables de entorno
vercel dev --env .env.local
```

### Build Local

```bash
# Build como lo haría Vercel
vercel build

# Build para production
vercel build --prod
```

### Limpieza de Caché

```bash
# No hay comando directo, pero puedes:
vercel deploy --force  # Fuerza rebuild sin cache
```

## Troubleshooting

### Problema: "Project not linked"

```bash
# Solución: Vincular proyecto
vercel link

# O especificar manualmente
vercel --scope <team-name> --project-name <project-name>
```

### Problema: Variables de entorno no se actualizan

```bash
# Solución: Redeploy después de cambiar variables
vercel env add MY_VAR production
vercel --prod  # Redeploy para aplicar cambios
```

### Problema: Build falla en Vercel pero funciona localmente

```bash
# Solución: Verificar variables de entorno
vercel env pull .env.local
vercel build  # Build local con env de Vercel

# Ver logs detallados
vercel logs <deployment-url>
```

### Problema: Dominio no resuelve

```bash
# Verificar DNS
vercel domains inspect thesimpson.webcode.es

# Re-verificar dominio
vercel domains verify thesimpson.webcode.es
```

## Mejores Prácticas

### ✅ HACER

1. **Usar `vercel env`** en lugar de secrets deprecated
2. **Configurar variables en todos los entornos** (production, preview, development)
3. **Usar `vercel dev`** para desarrollo local con env exacto
4. **Guardar `.vercel/project.json`** en `.gitignore`
5. **Documentar variables de entorno** en README o `.env.example`
6. **Usar CI/CD** para deployments automáticos
7. **Testear en preview** antes de promover a production

### ❌ EVITAR

1. **No commitear `.vercel/`** al repositorio
2. **No hardcodear secrets** en `vercel.json`
3. **No usar `vercel secrets`** (deprecated)
4. **No deployar directamente a production** sin testing previo
5. **No compartir VERCEL_TOKEN** públicamente

## Ejemplo Completo: Configuración de Proyecto

```bash
#!/bin/bash
# setup-vercel-project.sh

# 1. Instalar Vercel CLI
pnpm add -g vercel

# 2. Login
vercel login

# 3. Link proyecto
vercel link

# 4. Configurar variables de entorno
echo "Configurando variables de entorno..."

# Production
echo "$DATABASE_URL" | vercel env add DATABASE_URL production
echo "$(openssl rand -base64 32)" | vercel env add BETTER_AUTH_SECRET production
echo "https://thesimpson.webcode.es" | vercel env add NEXT_PUBLIC_APP_URL production
echo "https://thesimpson.webcode.es" | vercel env add BETTER_AUTH_URL production

# Preview
echo "$DATABASE_URL_PREVIEW" | vercel env add DATABASE_URL preview
echo "$(openssl rand -base64 32)" | vercel env add BETTER_AUTH_SECRET preview
echo "https://preview-thesimpsonsapi.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL preview

# Development
vercel env pull .env.local

# 5. Configurar dominio
vercel domains add thesimpson.webcode.es

# 6. Deploy inicial
vercel --prod

echo "✅ Proyecto configurado exitosamente"
```

## Scripts NPM Útiles

```json
{
  "scripts": {
    "deploy": "vercel",
    "deploy:prod": "vercel --prod",
    "env:pull": "vercel env pull .env.local",
    "env:ls": "vercel env ls",
    "logs": "vercel logs --prod",
    "inspect": "vercel inspect"
  }
}
```

## Recursos

- [Documentación oficial de Vercel CLI](https://vercel.com/docs/cli)
- [Variables de entorno en Vercel](https://vercel.com/docs/environment-variables)
- [CI/CD con Vercel](https://vercel.com/docs/deployments/git)
- [Vercel API Reference](https://vercel.com/docs/rest-api)

## Versión

Esta skill está basada en **Vercel CLI 50.3.3** (Enero 2026).
