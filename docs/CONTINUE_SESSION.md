# Script de Continuación — MyCourt Epic 1

Copia y pega este mensaje completo al inicio de la próxima sesión con Claude Code.

---

## PROMPT DE CONTINUACIÓN

Hola Claude. Continuamos el desarrollo del proyecto MyCourt. Aquí el contexto completo:

### Proyecto
MyCourt es un marketplace de reserva de canchas deportivas en Lima, Perú.
- Repo GitHub: https://github.com/rstockli96-coder/mycourt-app
- Directorio local: `/Users/rolandstockli/Desktop/test_claude/mycourt_app_project_II`
- Método: BMad (documentación en `/docs/`)
- Stack: Next.js 16 + Expo SDK 54 + Supabase + MercadoPago

### Estado actual
Completamos la mayor parte del **Epic 1 (Foundation)**. Lo que ya existe:

**Monorepo pnpm workspaces:**
- `apps/web` — Next.js 16 con TypeScript, Tailwind, shadcn/ui
- `apps/mobile` — Expo SDK 54 con TypeScript y Expo Router
- `packages/shared` — Tipos TypeScript, constantes y utils compartidos

**Supabase (`supabase/`):**
- 4 migraciones SQL: schema completo (9 tablas), RLS policies, funciones SQL, seed
- 3 Edge Functions: `create-booking`, `mp-webhook`, `send-reminders`

**Web (`apps/web/src/`):**
- `lib/supabase/` — client.ts, server.ts, middleware.ts
- `middleware.ts` — protección de rutas por rol
- `app/api/auth/callback/route.ts` — OAuth callback
- `app/(auth)/login/page.tsx` — Login email + Google
- `app/(auth)/register/page.tsx` — Registro con selector de rol
- `app/(auth)/verify-email/page.tsx` — Verificación email

**Mobile (`apps/mobile/`):**
- `src/lib/supabase.ts` — Cliente con SecureStore
- `app/_layout.tsx` — Root layout con sesión
- `app/index.tsx` — Redirect por rol
- `app/(auth)/login.tsx` — Pantalla login nativa
- `app/(player)/(tabs)/_layout.tsx` — Bottom tabs jugador
- `app/(player)/(tabs)/search.tsx` — Pantalla búsqueda

---

### TAREAS PENDIENTES (en orden de prioridad)

#### TAREA 1 — Instalar dependencias del workspace
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && pnpm install
```
Esto enlaza `@mycourt/shared` con web y mobile.

#### TAREA 2 — Setup Supabase local
1. Instalar Supabase CLI:
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && npm install -g supabase
```
2. Iniciar Supabase local:
```bash
supabase start
```
3. Correr las migraciones:
```bash
supabase db reset
```
4. Copiar las claves generadas a `apps/web/.env.local` (desde `.env.local.example`)

#### TAREA 3 — Pantallas web faltantes

**3a. Layout de grupos de rutas:**
- `apps/web/src/app/(auth)/layout.tsx` — layout sin navbar para auth
- `apps/web/src/app/(player)/layout.tsx` — layout con navbar para jugador
- `apps/web/src/app/(owner)/layout.tsx` — layout con sidebar para admin

**3b. Componentes compartidos:**
- `apps/web/src/components/shared/Navbar.tsx` — navbar con avatar y logout
- `apps/web/src/components/shared/Logo.tsx`

**3c. Páginas del jugador:**
- `apps/web/src/app/(player)/search/page.tsx` — búsqueda con filtros + mapa
- `apps/web/src/app/(player)/bookings/page.tsx` — mis reservas (tabs: próximas/pasadas/canceladas)
- `apps/web/src/app/(player)/courts/[id]/page.tsx` — detalle de cancha con galería + calendario

**3d. Páginas del administrador:**
- `apps/web/src/app/(owner)/dashboard/page.tsx` — dashboard con métricas
- `apps/web/src/app/(owner)/courts/page.tsx` — lista de canchas del admin
- `apps/web/src/app/(owner)/courts/new/page.tsx` — formulario multi-step nueva cancha

**3e. Hooks de datos:**
- `apps/web/src/hooks/useCourts.ts` — TanStack Query para canchas
- `apps/web/src/hooks/useBookings.ts` — TanStack Query para reservas
- `apps/web/src/hooks/useProfile.ts` — perfil del usuario autenticado

#### TAREA 4 — Pantallas móviles faltantes
- `apps/mobile/app/(auth)/register.tsx` — Registro con selector de rol
- `apps/mobile/app/(player)/(tabs)/bookings.tsx` — Mis reservas
- `apps/mobile/app/(player)/(tabs)/profile.tsx` — Perfil del jugador
- `apps/mobile/app/court/[id].tsx` — Detalle de cancha
- `apps/mobile/app/(owner)/(tabs)/_layout.tsx` — Tabs del owner
- `apps/mobile/app/(owner)/(tabs)/dashboard.tsx` — Dashboard del owner

#### TAREA 5 — Onboarding diferenciado
- Web: `apps/web/src/app/(auth)/onboarding/page.tsx` (3 pasos por rol)
- Mobile: `apps/mobile/app/(auth)/onboarding.tsx`

#### TAREA 6 — Variable de entorno y primer run
1. Crear `apps/web/.env.local` con claves de Supabase local
2. Correr `pnpm dev:web` y verificar que login/register funcionen
3. Correr `pnpm dev:mobile` (Expo) y verificar en simulador

#### TAREA 7 — Commit y push a GitHub
Al terminar, hacer commit con todo lo nuevo:
```bash
source ~/.config/envman/PATH.env
git add .
git commit -m "feat: complete Epic 1 - auth pages, layouts, hooks and onboarding"
git push
```

---

### Criterios de Aceptación del Epic 1 (de `docs/epics/epic-1-foundation.md`)
- [ ] Jugador puede registrarse, verificar email y hacer login (web + móvil)
- [ ] Administrador puede registrarse con rol diferente
- [ ] RLS activo: usuario no puede ver datos de otros
- [ ] Web y móvil comparten tipos de `@mycourt/shared`
- [ ] Onboarding diferenciado por rol funciona
- [ ] Supabase local corre con migraciones aplicadas

---

### Comandos útiles de referencia
```bash
# Cargar node/pnpm
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

# Dev web
pnpm dev:web

# Dev mobile
pnpm dev:mobile

# Ver Supabase local
supabase status

# Studio de Supabase (GUI)
# Abre http://127.0.0.1:54323 en el browser

# GitHub CLI
source ~/.config/envman/PATH.env && gh repo view rstockli96-coder/mycourt-app
```
