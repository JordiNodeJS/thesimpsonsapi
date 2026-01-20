# Next.js DDD Architect Skill

Skill experta en arquitectura front-end basada en Domain-Driven Design (DDD) para proyectos Next.js 16 con App Router.

## 🎯 Propósito

Proporciona patrones, estructuras y estrategias para implementar arquitectura limpia y modular en aplicaciones Next.js mediante Domain-Driven Folders, separación de capas y diseño de bounded contexts.

## 📦 Uso

Esta skill se activa automáticamente cuando:

- El usuario solicita refactorizar hacia DDD
- Se necesita organizar dominios de negocio
- Se quiere separar lógica de negocio del framework
- Se busca escalar la arquitectura de la aplicación

## 🗂 Estructura de Dominio Canónica

```
domains/
  {domain-name}/
    components/       # Componentes específicos del dominio
    services/         # Lógica de negocio y fetching
    actions/          # Server actions de Next.js
    store/            # Estado del cliente (Zustand/Jotai)
    hooks/            # Hooks específicos del dominio
    types.ts          # Tipos e interfaces
    schemas.ts        # Validaciones Zod
    constants.ts      # Constantes del dominio
    index.ts          # API pública (exports controlados)
```

## 🏗 Capas de Arquitectura

### 1. Delivery Layer (`/app`)

- Rutas, layouts, pages de Next.js
- Orquestación de datos y componentes
- Mínima lógica - solo composición

### 2. Domain Layer (`/domains`)

- Lógica de negocio
- Servicios, repositorios, stores
- Componentes específicos del dominio
- **Framework-agnostic**

### 3. Infrastructure Layer (`/app/_lib`)

- Clientes de base de datos (Prisma)
- Integraciones con APIs externas
- Autenticación, logging

### 4. Shared Kernel (`/shared`)

- Utilidades cross-domain
- UI primitives
- Tipos globales

## 🚀 Patrones Principales

### Server Actions dentro del Dominio

```typescript
// domains/users/services/createUser.ts
export async function createUser(input: CreateUserInput) {
  // Lógica de negocio pura
}

// domains/users/actions/createUserAction.ts
("use server");
export async function createUserAction(input: CreateUserInput) {
  const user = await createUser(input);
  revalidatePath("/users");
  return { success: true, user };
}
```

### Exports Controlados

```typescript
// domains/users/index.ts
export { getUsers } from "./services/getUsers";
export { UserList, UserCard } from "./components";
export { createUserAction } from "./actions/createUserAction";
export type { User, CreateUserInput } from "./types";
```

### Stores por Dominio

```typescript
// domains/users/store/useUsersStore.ts
export const useUsersStore = create<UsersState>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
```

## ✅ Beneficios

- **Modularidad**: Dominios independientes y desacoplados
- **Testabilidad**: Lógica de negocio aislada del framework
- **Escalabilidad**: Fácil agregar nuevos dominios sin afectar existentes
- **Mantenibilidad**: Estructura clara y predecible
- **Reusabilidad**: Servicios pueden usarse en API routes, cron jobs, tests

## 📚 Casos de Uso

### ✅ Usar esta skill para:

- Refactorizar proyecto existente a DDD
- Diseñar nuevos dominios (users, episodes, orders)
- Organizar server actions por dominio
- Separar lógica de negocio del App Router
- Implementar bounded contexts
- Diseñar stores por dominio

### ❌ NO usar para:

- Componentes UI genéricos (usar component-development)
- Configuración de Next.js (usar docs/)
- Testing genérico (usar testing-automation)
- Despliegues (usar vercel-env-sync)

## 🛠 Migración de Proyecto Existente

### Paso 1: Crear estructura de dominio

```bash
mkdir -p domains/users/{components,services,actions,store}
touch domains/users/{index.ts,types.ts,schemas.ts}
```

### Paso 2: Mover lógica de negocio

```typescript
// Antes: app/_lib/repositories.ts
export async function getUserById(id: string) {
  /* ... */
}

// Después: domains/users/services/getUserById.ts
export async function getUserById(id: string) {
  /* ... */
}
```

### Paso 3: Actualizar imports

```typescript
// Antes: app/users/page.tsx
import { getUserById } from "@/app/_lib/repositories";

// Después: app/users/page.tsx
import { getUserById } from "@/domains/users";
```

## 🎓 Recursos

- [SKILL.md](./SKILL.md) - Documentación completa de la skill
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - Decisiones arquitectónicas del proyecto
- [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📝 Convenciones de Nombres

- **Services**: `{verb}{Entity}.ts` (ej: `getUserById.ts`, `createUser.ts`)
- **Actions**: `{verb}{Entity}Action.ts` (ej: `createUserAction.ts`)
- **Components**: `{Entity}{Component}.tsx` (ej: `UserCard.tsx`, `UserList.tsx`)
- **Stores**: `use{Entity}Store.ts` (ej: `useUsersStore.ts`)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026
