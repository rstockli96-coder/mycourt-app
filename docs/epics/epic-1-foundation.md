# Epic 1: Foundation & Infraestructura

**ID:** EP-01  
**Prioridad:** Crítica  
**Timeline:** Semanas 1–2  
**Objetivo:** Tener el monorepo, base de datos y autenticación funcionando end-to-end.

---

## Descripción
Configurar toda la infraestructura base sobre la que se construirá MyCourt: monorepo pnpm, proyecto Supabase, migraciones SQL iniciales, autenticación con roles, y esqueleto de apps web y móvil.

## Stories

### ST-01: Setup Monorepo
- Inicializar monorepo con pnpm workspaces.
- Configurar `apps/web` (Next.js 15 + TypeScript + Tailwind + shadcn/ui).
- Configurar `apps/mobile` (Expo SDK 52 + TypeScript).
- Configurar `packages/shared` con tipos TypeScript compartidos.
- ESLint + Prettier + Husky pre-commit hooks.

### ST-02: Setup Supabase
- Crear proyecto Supabase.
- Configurar variables de entorno en web y móvil.
- Crear todas las migraciones SQL (tablas, índices, RLS).
- Seed data básica (distritos de Lima, deportes).

### ST-03: Autenticación — Registro y Login
- Registro con email/password para jugadores y administradores.
- Selección de rol durante onboarding (player | court_owner).
- Verificación de email.
- Login/logout.
- Persistencia de sesión en web (cookies) y móvil (SecureStore).

### ST-04: Login Social
- Login con Google (OAuth 2.0 via Supabase).
- Login con Apple (para iOS, requerido por App Store).

### ST-05: Perfiles de Usuario
- Página/pantalla "Mi Perfil": foto, nombre, teléfono.
- Subida de avatar a Supabase Storage.
- Edición de datos básicos.

### ST-06: Onboarding Diferenciado
- Jugador: 3 pasos (bienvenida, deporte favorito, ubicación preferida).
- Administrador: 3 pasos (bienvenida, datos de la empresa/persona, agregar primera cancha CTA).

## Criterios de Aceptación del Epic
- [ ] Un jugador puede registrarse, verificar email y hacer login.
- [ ] Un administrador puede registrarse con rol diferente.
- [ ] RLS activo: usuario no puede ver datos de otros usuarios.
- [ ] Web y móvil comparten tipos de `packages/shared`.
