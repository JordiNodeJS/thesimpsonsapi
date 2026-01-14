#!/bin/bash

# audit-vercel-env.sh
# Genera un reporte completo del estado de sincronización de variables de entorno

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Auditoría de Variables de Entorno${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo ""

# 1. Verificar autenticación
echo "1️⃣  Verificando autenticación..."
USER=$(vercel whoami 2>&1)
if [ $? -eq 0 ]; then
  echo -e "   ${GREEN}✓${NC} Autenticado como: $USER"
else
  echo -e "   ${RED}✗${NC} No autenticado"
  echo ""
  echo "Ejecuta: vercel login"
  exit 1
fi
echo ""

# 2. Verificar proyecto vinculado
echo "2️⃣  Verificando proyecto..."
if [ -f .vercel/project.json ]; then
  PROJECT=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d '"' -f 4 || echo "unknown")
  ORG=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d '"' -f 4 || echo "unknown")
  echo -e "   ${GREEN}✓${NC} Proyecto vinculado: $PROJECT"
  echo -e "   ${GREEN}✓${NC} Organización: $ORG"
else
  echo -e "   ${RED}✗${NC} Proyecto no vinculado"
  echo ""
  echo "Ejecuta: vercel link"
  exit 1
fi
echo ""

# 3. Obtener variables locales
echo "3️⃣  Analizando archivos locales..."
LOCAL_VARS=()
if [ -f .env.example ]; then
  while IFS= read -r line; do
    # Trim whitespace
    line=$(echo "$line" | xargs 2>/dev/null || echo "$line")
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]] && [[ "$line" == *"="* ]]; then
      var_name=$(echo "$line" | cut -d '=' -f 1 | xargs)
      if [[ -n "$var_name" ]]; then
        LOCAL_VARS+=("$var_name")
      fi
    fi
  done < .env.example
  echo -e "   ${GREEN}✓${NC} Encontradas ${#LOCAL_VARS[@]} variables en .env.example"
else
  echo -e "   ${RED}✗${NC} No se encontró .env.example"
  exit 1
fi
echo ""

# 4. Obtener variables de Vercel
echo "4️⃣  Consultando variables en Vercel..."

# Obtener listas de variables
VERCEL_PROD_VARS=$(vercel env ls production 2>/dev/null | tail -n +4 | awk '{print $1}' | grep -v '^$' | grep -v '^name$')
VERCEL_PREVIEW_VARS=$(vercel env ls preview 2>/dev/null | tail -n +4 | awk '{print $1}' | grep -v '^$' | grep -v '^name$')
VERCEL_DEV_VARS=$(vercel env ls development 2>/dev/null | tail -n +4 | awk '{print $1}' | grep -v '^$' | grep -v '^name$')

PROD_COUNT=$(echo "$VERCEL_PROD_VARS" | grep -c . || echo "0")
PREVIEW_COUNT=$(echo "$VERCEL_PREVIEW_VARS" | grep -c . || echo "0")
DEV_COUNT=$(echo "$VERCEL_DEV_VARS" | grep -c . || echo "0")

echo -e "   ${GREEN}✓${NC} Production: $PROD_COUNT variables"
echo -e "   ${GREEN}✓${NC} Preview: $PREVIEW_COUNT variables"
echo -e "   ${GREEN}✓${NC} Development: $DEV_COUNT variables"
echo ""

# 5. Generar reporte
echo "5️⃣  Generando reporte..."
echo ""
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│                      REPORTE DE ESTADO                          │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

printf "%-35s %-15s %-15s %-15s\n" "Variable" "Production" "Preview" "Development"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MISSING_PROD=0
MISSING_PREVIEW=0
MISSING_DEV=0

for var in "${LOCAL_VARS[@]}"; do
  # Check production
  if echo "$VERCEL_PROD_VARS" | grep -q "^${var}$"; then
    prod="${GREEN}✓ Existe${NC}"
  else
    prod="${RED}✗ Falta${NC}"
    MISSING_PROD=$((MISSING_PROD + 1))
  fi
  
  # Check preview
  if echo "$VERCEL_PREVIEW_VARS" | grep -q "^${var}$"; then
    preview="${GREEN}✓ Existe${NC}"
  else
    preview="${RED}✗ Falta${NC}"
    MISSING_PREVIEW=$((MISSING_PREVIEW + 1))
  fi
  
  # Check development
  if echo "$VERCEL_DEV_VARS" | grep -q "^${var}$"; then
    dev="${GREEN}✓ Existe${NC}"
  else
    dev="${RED}✗ Falta${NC}"
    MISSING_DEV=$((MISSING_DEV + 1))
  fi
  
  printf "%-35s " "$var"
  echo -ne "$prod       $preview       $dev\n"
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Resumen
echo -e "${BLUE}📊 RESUMEN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Variables locales (.env.example): ${#LOCAL_VARS[@]}"
echo ""
echo "  Faltantes en Production: $MISSING_PROD"
echo "  Faltantes en Preview: $MISSING_PREVIEW"
echo "  Faltantes en Development: $MISSING_DEV"
echo ""

if [ $MISSING_PROD -eq 0 ] && [ $MISSING_PREVIEW -eq 0 ] && [ $MISSING_DEV -eq 0 ]; then
  echo -e "${GREEN}✅ Todos los entornos están correctamente configurados${NC}"
  echo ""
  exit 0
else
  echo -e "${YELLOW}⚠️  Hay variables faltantes. Sincroniza con uno de estos comandos:${NC}"
  echo ""
  echo "  # Solo production"
  echo "  ./scripts/sync-vercel-env.sh --env production"
  echo ""
  echo "  # Todos los entornos"
  echo "  ./scripts/sync-vercel-env.sh --all-envs"
  echo ""
  echo "  # Forzar actualización (sobrescribir existentes)"
  echo "  ./scripts/sync-vercel-env.sh --all-envs --force"
  echo ""
  exit 1
fi
