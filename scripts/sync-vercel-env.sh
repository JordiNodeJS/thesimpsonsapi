#!/bin/bash

# sync-vercel-env.sh
# Sincroniza variables de entorno desde archivos locales a Vercel

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para leer valor de .env.local (con fallback a .env)
get_env_value() {
  local var_name=$1
  local value=""
  
  # Intentar leer de .env.local primero
  if [ -f .env.local ]; then
    value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d '=' -f 2- | sed 's/^["'\'']//' | sed 's/["'\'']$//' || echo "")
  fi
  
  # Fallback a .env
  if [ -z "$value" ] && [ -f .env ]; then
    value=$(grep "^${var_name}=" .env 2>/dev/null | cut -d '=' -f 2- | sed 's/^["'\'']//' | sed 's/["'\'']$//' || echo "")
  fi
  
  echo "$value"
}

# Función para verificar si variable existe en Vercel
vercel_var_exists() {
  local var_name=$1
  local env=$2
  vercel env ls "$env" 2>/dev/null | tail -n +4 | awk '{print $1}' | grep -q "^${var_name}$"
}

# Función para crear variable en Vercel
create_vercel_var() {
  local var_name=$1
  local var_value=$2
  local env=$3
  
  echo -e "${BLUE}📝 Creando $var_name en $env...${NC}"
  printf "%s\n" "$var_value" | vercel env add "$var_name" "$env" --force 2>&1 | grep -v "Vercel CLI" | grep -v "Error: unknown" || true
}

# Función para actualizar variable en Vercel
update_vercel_var() {
  local var_name=$1
  local var_value=$2
  local env=$3
  
  echo -e "${YELLOW}🔄 Actualizando $var_name en $env...${NC}"
  # Vercel no tiene comando directo para update, hay que remover y crear
  vercel env rm "$var_name" "$env" --yes 2>&1 | grep -v "Vercel CLI" || true
  printf "%s\n" "$var_value" | vercel env add "$var_name" "$env" --force 2>&1 | grep -v "Vercel CLI" | grep -v "Error: unknown" || true
}

# Función para validar valor según tipo de variable
validate_value() {
  local var_name=$1
  local value=$2
  
  # Validaciones específicas
  case $var_name in
    BETTER_AUTH_SECRET)
      if [ ${#value} -lt 32 ]; then
        echo -e "${RED}⚠️  $var_name debe tener al menos 32 caracteres${NC}"
        return 1
      fi
      # Validar que sea base64 válido (caracteres alfanuméricos, +, /, y = para padding)
      if ! echo "$value" | grep -qE '^[A-Za-z0-9+/]+=*$'; then
        echo -e "${RED}⚠️  $var_name parece no ser base64 válido${NC}"
        return 1
      fi
      ;;
    *_URL)
      if [[ ! "$value" =~ ^https?:// ]]; then
        echo -e "${YELLOW}⚠️  $var_name debería ser una URL válida (http:// o https://)${NC}"
      fi
      ;;
    DATABASE_URL)
      if [[ ! "$value" =~ ^postgresql:// ]]; then
        echo -e "${RED}⚠️  DATABASE_URL debe ser una conexión PostgreSQL válida${NC}"
        return 1
      fi
      ;;
  esac
  
  return 0
}

# Función para sincronizar una variable
sync_var() {
  local var_name=$1
  local env=$2
  local force_update=${3:-false}
  
  # Obtener valor local
  local value=$(get_env_value "$var_name")
  
  if [ -z "$value" ]; then
    echo -e "${YELLOW}⚠️  $var_name no tiene valor en archivos locales (.env/.env.local)${NC}"
    return 0  # No es un error crítico, solo skip
  fi
  
  # Validar valor
  if ! validate_value "$var_name" "$value"; then
    echo -e "${RED}❌ Validación fallida para $var_name${NC}"
    return 1
  fi
  
  # Verificar si existe en Vercel
  if vercel_var_exists "$var_name" "$env"; then
    if [ "$force_update" = true ]; then
      update_vercel_var "$var_name" "$value" "$env"
      echo -e "${GREEN}✓ $var_name actualizado en $env${NC}"
    else
      echo -e "${YELLOW}⚠️  $var_name ya existe en $env (usa --force para actualizar)${NC}"
    fi
  else
    create_vercel_var "$var_name" "$value" "$env"
    echo -e "${GREEN}✓ $var_name creado en $env${NC}"
  fi
  
  return 0
}

# Main script
echo -e "${BLUE}🚀 Sincronizando variables de entorno con Vercel...${NC}"
echo ""

# Verificar autenticación
if ! vercel whoami &>/dev/null; then
  echo -e "${RED}❌ No estás autenticado en Vercel${NC}"
  echo "Ejecuta: vercel login"
  exit 1
fi

# Leer variables de .env.example
if [ ! -f .env.example ]; then
  echo -e "${RED}❌ No se encontró .env.example${NC}"
  exit 1
fi

VARS=$(grep -v '^#' .env.example | grep -v '^$' | cut -d '=' -f 1)

# Parsear argumentos
ENVIRONMENTS=("production")  # Default: solo production
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENTS=("$2")
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --all-envs)
      ENVIRONMENTS=("production" "preview" "development")
      shift
      ;;
    *)
      echo -e "${RED}Argumento desconocido: $1${NC}"
      echo ""
      echo "Uso:"
      echo "  $0 [--env production|preview|development] [--all-envs] [--force]"
      echo ""
      echo "Ejemplos:"
      echo "  $0                          # Sincronizar solo production"
      echo "  $0 --env preview            # Sincronizar solo preview"
      echo "  $0 --all-envs               # Sincronizar todos los entornos"
      echo "  $0 --all-envs --force       # Forzar actualización en todos"
      exit 1
      ;;
  esac
done

echo "🎯 Entornos objetivo: ${ENVIRONMENTS[@]}"
echo "🔄 Forzar actualización: $FORCE"
echo ""

# Verificar archivos de valores
if [ ! -f .env.local ] && [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  No se encontró .env.local ni .env${NC}"
  echo -e "${YELLOW}   Las variables sin valor en estos archivos serán omitidas${NC}"
  echo ""
fi

# Sincronizar cada variable en cada entorno
TOTAL=0
SUCCESS=0
SKIPPED=0
FAILED=0

for env in "${ENVIRONMENTS[@]}"; do
  echo -e "\n${BLUE}📦 Procesando entorno: $env${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  for var in $VARS; do
    TOTAL=$((TOTAL + 1))
    
    # Obtener valor para determinar si skip
    value=$(get_env_value "$var")
    
    if sync_var "$var" "$env" "$FORCE"; then
      if [ -n "$value" ]; then
        SUCCESS=$((SUCCESS + 1))
      else
        SKIPPED=$((SKIPPED + 1))
      fi
    else
      FAILED=$((FAILED + 1))
    fi
  done
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Completado${NC}"
echo "  Total: $TOTAL operaciones"
echo "  Exitosas: $SUCCESS"
echo "  Omitidas: $SKIPPED (sin valor local)"
echo "  Fallidas: $FAILED"

if [ $FAILED -gt 0 ]; then
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Sincronización completada exitosamente${NC}"
echo ""
echo "💡 Próximos pasos:"
echo "   1. Verificar: ./scripts/audit-vercel-env.sh"
echo "   2. Pull local: vercel env pull .env.local"
echo "   3. Deploy: vercel --prod"
