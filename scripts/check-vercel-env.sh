#!/bin/bash

# check-vercel-env.sh
# Compara variables de .env.example con las configuradas en Vercel

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando variables de entorno..."

# 1. Extraer variables de .env.example (sin comentarios ni líneas vacías)
LOCAL_VARS=$(grep -v '^#' .env.example | grep -v '^$' | cut -d '=' -f 1 | sort | uniq)

# 2. Obtener variables de Vercel (todos los entornos)
VERCEL_VARS=$(vercel env ls 2>/dev/null | tail -n +4 | awk '{print $1}' | sort | uniq)

echo ""
echo "📋 Variables locales encontradas:"
echo "$LOCAL_VARS" | sed 's/^/  - /'

echo ""
echo "☁️  Variables en Vercel:"
echo "$VERCEL_VARS" | sed 's/^/  - /'

echo ""
echo "❌ Variables FALTANTES en Vercel:"
MISSING=0
for var in $LOCAL_VARS; do
  if ! echo "$VERCEL_VARS" | grep -q "^$var$"; then
    echo -e "  ${RED}✗${NC} $var"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo -e "  ${GREEN}✓ Todas las variables están configuradas${NC}"
fi

echo ""
echo "⚠️  Variables EXTRA en Vercel (no en local):"
EXTRA=0
for var in $VERCEL_VARS; do
  if ! echo "$LOCAL_VARS" | grep -q "^$var$"; then
    echo -e "  ${YELLOW}!${NC} $var"
    EXTRA=$((EXTRA + 1))
  fi
done

if [ $EXTRA -eq 0 ]; then
  echo -e "  ${GREEN}✓ No hay variables extra${NC}"
fi

echo ""
echo "📊 Resumen:"
echo "  Local: $(echo "$LOCAL_VARS" | wc -l) variables"
echo "  Vercel: $(echo "$VERCEL_VARS" | wc -l) variables"
echo "  Faltantes: $MISSING"
echo "  Extra: $EXTRA"

exit $MISSING
