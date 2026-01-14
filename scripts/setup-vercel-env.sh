#!/bin/bash

# Script para configurar variables de entorno en Vercel para The Simpsons API
# Uso: ./setup-vercel-env.sh

set -e

echo "🚀 Configurando variables de entorno en Vercel..."
echo ""

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado."
    echo "Instalar con: pnpm add -g vercel"
    exit 1
fi

# Verificar que estamos autenticados
if ! vercel whoami &> /dev/null; then
    echo "❌ No estás autenticado en Vercel."
    echo "Ejecuta: vercel login"
    exit 1
fi

echo "✅ Vercel CLI instalado y autenticado"
echo ""

# Dominio de producción
PRODUCTION_URL="https://thesimpson.webcode.es"

# Generar secret si no existe
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "⚠️  BETTER_AUTH_SECRET no definido. Generando uno nuevo..."
    BETTER_AUTH_SECRET=$(openssl rand -base64 32)
fi

# Configurar variables de Production
echo "📝 Configurando variables de PRODUCTION..."

echo "$PRODUCTION_URL" | vercel env add NEXT_PUBLIC_APP_URL production || echo "NEXT_PUBLIC_APP_URL ya existe"
echo "$PRODUCTION_URL" | vercel env add BETTER_AUTH_URL production || echo "BETTER_AUTH_URL ya existe"
echo "$BETTER_AUTH_SECRET" | vercel env add BETTER_AUTH_SECRET production || echo "BETTER_AUTH_SECRET ya existe"

# Configurar DATABASE_URL si está definido
if [ -n "$DATABASE_URL" ]; then
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production || echo "DATABASE_URL ya existe"
else
    echo "⚠️  DATABASE_URL no definido. Configúralo manualmente:"
    echo "   echo 'postgresql://...' | vercel env add DATABASE_URL production"
fi

echo ""
echo "✅ Variables de PRODUCTION configuradas"
echo ""

# Configurar variables de Preview
echo "📝 Configurando variables de PREVIEW..."

# Para preview, usamos el mismo DATABASE_URL y generamos un secret diferente
PREVIEW_SECRET=$(openssl rand -base64 32)

if [ -n "$DATABASE_URL" ]; then
    echo "$DATABASE_URL" | vercel env add DATABASE_URL preview || echo "DATABASE_URL ya existe"
fi

echo "$PREVIEW_SECRET" | vercel env add BETTER_AUTH_SECRET preview || echo "BETTER_AUTH_SECRET ya existe"

echo ""
echo "✅ Variables de PREVIEW configuradas"
echo ""

# Pull variables a .env.local para desarrollo
echo "📥 Descargando variables a .env.local..."
vercel env pull .env.local || echo "Ya existe .env.local"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verificar variables: vercel env ls"
echo "   2. Deploy a production: vercel --prod"
echo "   3. Configurar dominio: vercel domains add thesimpson.webcode.es"
echo ""
echo "🔐 BETTER_AUTH_SECRET generado:"
echo "   $BETTER_AUTH_SECRET"
echo ""
echo "⚠️  Guarda este secret de forma segura!"
