# MyCourt — CLAUDE.md

## Proyecto
Marketplace de reserva de canchas deportivas en Lima, Perú. Conecta jugadores con administradores de canchas (vóley, tenis, pádel en Fase 1).

## Method
BMad — todos los documentos de diseño en `/docs/`.

## Stack
- **Web**: Next.js 15 + TypeScript + Tailwind + shadcn/ui → Vercel
- **Mobile**: React Native + Expo SDK 52 → EAS Build
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Pagos**: MercadoPago (soporta Yape, Plin, tarjetas en Perú)
- **Emails**: Resend + React Email
- **Push**: Expo Notifications + OneSignal
- **Maps**: Google Maps Platform

## Estructura
```
apps/web/        → Next.js (jugador, admin, super-admin)
apps/mobile/     → React Native Expo
packages/shared/ → Tipos TypeScript compartidos
supabase/        → Migrations + Edge Functions
```

## Roles de usuario
- `player` — Jugador que reserva canchas
- `court_owner` — Administrador que gestiona canchas
- `super_admin` — Equipo MyCourt (aprobación, moderación)

## Moneda y Localización
- Moneda: PEN (Soles peruanos)
- Idioma: Español (Perú)
- Timezone: America/Lima (UTC-5)

## Modelo de Negocio
- Comisión: 10% por reserva completada
- Payout al dueño: T+1 hábil tras reserva completada

## Documentos Clave
- PRD: `docs/prd.md`
- Arquitectura: `docs/architecture.md`
- Epics: `docs/epics/`
- Stories: `docs/stories/`

## Timeline
< 3 meses. Ver tabla en PRD sección 10.
