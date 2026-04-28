# Script de Continuación — MyCourt Epic 1 (Tarea 6)

Copia y pega este mensaje completo al inicio de la próxima sesión con Claude Code.

---

## PROMPT DE CONTINUACIÓN

Hola Claude. Continuamos el desarrollo del proyecto MyCourt.

### Proyecto
- Repo GitHub: https://github.com/rstockli96-coder/mycourt-app
- Directorio local: `/Users/rolandstockli/Desktop/test_claude/mycourt_app_project_II`
- Método: BMad (documentación en `/docs/`)
- Stack: Next.js 16 + Expo SDK 54 + Supabase + MercadoPago

---

### Estado actual — Epic 1 completado (commit `6d5cd7a`)

Todo el código de UI está listo. Lo que existe:

**Web (`apps/web/src/`):**
- `app/(auth)/`: login, register, verify-email, onboarding (3 pasos por rol), layout
- `app/(player)/`: layout con Navbar, search, bookings, courts/[id]
- `app/(owner)/`: layout con sidebar, dashboard, courts, courts/new (form multi-step)
- `components/shared/`: Navbar.tsx, Logo.tsx
- `hooks/`: useCourts, useBookings, useProfile (TanStack Query)
- `lib/supabase/`: client.ts, server.ts, middleware.ts

**Mobile (`apps/mobile/app/`):**
- `(auth)/`: login, register (selector de rol), onboarding
- `(player)/(tabs)/`: _layout, search, bookings, profile
- `(owner)/(tabs)/`: _layout, dashboard, courts, profile
- `court/[id].tsx`
- `src/lib/supabase.ts` — cliente con SecureStore

**Backend (`supabase/`):**
- 4 migraciones: schema, RLS, funciones SQL, seed
- 3 Edge Functions: create-booking, mp-webhook, send-reminders
- `config.toml`: puerto API=54321, Studio=54323, Inbucket=54324

---

### TAREA 6 — Setup Supabase local + primer run (PENDIENTE)

Este es el único bloque que falta para completar el Epic 1.

#### 6a. Instalar Supabase CLI (si no está)
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
# Verificar si ya está instalado:
supabase --version
# Si no está: npm install -g supabase
```

#### 6b. Iniciar Supabase local
```bash
# Desde el directorio raíz del proyecto:
supabase start
```
Esto levanta PostgreSQL, Auth, Storage, Studio en Docker.
Al terminar imprime las claves — guardarlas.

#### 6c. Aplicar migraciones y seed
```bash
supabase db reset
```
Aplica las 4 migraciones en `supabase/migrations/` en orden.

#### 6d. Crear archivos de entorno
Crear `apps/web/.env.local` basado en `apps/web/.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key de supabase start>
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Dejar MP y Google Maps vacíos por ahora
```

Crear `apps/mobile/.env.local` basado en `apps/mobile/.env.example`:
```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key de supabase start>
```

#### 6e. Verificar web — `pnpm dev:web`
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
pnpm dev:web
```
Abrir http://localhost:3000 y verificar:
- [ ] `/login` carga sin errores
- [ ] Registro nuevo usuario (rol jugador) → redirige a `/onboarding`
- [ ] Onboarding completa y redirige a `/(player)/search`
- [ ] `/(player)/search` carga (aunque sin canchas en DB es normal)
- [ ] `/(owner)/dashboard` accesible si registro fue como court_owner

Si hay errores de TypeScript o de módulo, reportarlos exactos.

#### 6f. Verificar mobile — `pnpm dev:mobile`
```bash
pnpm dev:mobile
# Abrir en iOS Simulator con 'i' o en Expo Go escaneando QR
```
Verificar:
- [ ] Pantalla de login carga
- [ ] Registro con rol jugador funciona
- [ ] Onboarding aparece y redirige a tabs del jugador
- [ ] Tab "Buscar" y "Mis reservas" se muestran sin crashes

#### 6g. Commit final del Epic 1
```bash
source ~/.config/envman/PATH.env
git add .
git commit -m "feat: Epic 1 complete - Supabase local running, env vars configured"
git push
```

---

### Criterios de Aceptación del Epic 1 (checklist)
- [ ] Jugador puede registrarse, verificar email y hacer login (web + móvil)
- [ ] Administrador puede registrarse con rol diferente
- [ ] RLS activo: usuario no puede ver datos de otros
- [ ] Web y móvil comparten tipos de `@mycourt/shared`
- [ ] Onboarding diferenciado por rol funciona
- [ ] Supabase local corre con migraciones aplicadas

---

### Comandos útiles de referencia
```bash
# Cargar nvm
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

# Ver estado de Supabase local
supabase status

# Studio GUI
# → http://127.0.0.1:54323

# Emails de prueba (Inbucket)
# → http://127.0.0.1:54324

# Dev web
pnpm dev:web       # → http://localhost:3000

# Dev mobile
pnpm dev:mobile    # → QR code para Expo Go / simulador

# Generar tipos TypeScript desde schema
pnpm db:types
```

### Posibles problemas conocidos
- **Docker no iniciado**: `supabase start` requiere Docker Desktop corriendo
- **Puerto ocupado**: si el 54321 está ocupado, cambiar en `supabase/config.toml`
- **`@mycourt/shared` no resuelve**: correr `pnpm install` desde la raíz
- **Mobile `@/` alias no resuelve**: verificar que `tsconfig.json` tiene `paths: {"@/*": ["./src/*"]}` y que `babel.config.js` existe en `apps/mobile/`
