# MyCourt — Architecture Document

**Version:** 1.0  
**Date:** 2026-04-28  
**Method:** BMad  
**Status:** Approved for Implementation

---

## 1. Decisión de Stack Tecnológico

### Criterios de selección
- Timeline < 3 meses → máxima reutilización de código web/móvil.
- Marketplace con pagos → backend robusto con mínimo código personalizado.
- Sin preferencia tecnológica → elegir lo óptimo para el caso de uso.

### Stack Seleccionado

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Web Frontend** | Next.js 15 + TypeScript + Tailwind CSS | SSR/SSG para SEO, App Router, ecosistema maduro |
| **Mobile** | React Native + Expo (SDK 52) | Compartir lógica/tipos con Next.js, OTA updates |
| **Backend / BaaS** | Supabase | PostgreSQL, Auth, Storage, Realtime, Row-Level Security |
| **Pagos** | MercadoPago SDK | Líder en Perú/LATAM, soporta Yape/Plin/tarjetas, PCI-DSS |
| **Mapas** | Google Maps Platform | Places API para búsqueda de dirección, Maps para visualización |
| **Emails** | Resend + React Email | Emails transaccionales con plantillas React |
| **Push Notifications** | Expo Notifications + OneSignal | FCM/APNs unificado |
| **Hosting Web** | Vercel | Deploy automático, edge network, integración Next.js |
| **Hosting Mobile** | Expo EAS Build + EAS Submit | CI/CD para App Store y Play Store |
| **State Management** | Zustand (web) + React Query (TanStack) | Ligero, async state para API calls |
| **Formularios** | React Hook Form + Zod | Validación tipada end-to-end |
| **UI Components** | shadcn/ui (web) + React Native Paper (móvil) | Componentes accesibles, customizables |

---

## 2. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTES                            │
│  ┌─────────────────┐     ┌──────────────────────────┐  │
│  │   Next.js Web   │     │  React Native / Expo App  │  │
│  │   (Vercel)      │     │  (iOS + Android)          │  │
│  └────────┬────────┘     └───────────┬──────────────┘  │
└───────────┼──────────────────────────┼─────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────────────────────────────────────┐
│                  SUPABASE (BaaS)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐  │
│  │ PostgREST│  │   Auth   │  │ Storage  │  │Realtime│ │
│  │  (API)   │  │ (JWT)    │  │ (S3-like)│  │(WS)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                 │  │
│  │         (con Row Level Security)                 │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Edge Functions (Deno)               │  │
│  │  - Webhook MercadoPago                           │  │
│  │  - Lógica de comisiones                          │  │
│  │  - Trigger emails / push                         │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐
│     SERVICIOS EXTERNOS        │
│  ┌──────────┐  ┌───────────┐  │
│  │MercadoPago│  │Google Maps│  │
│  └──────────┘  └───────────┘  │
│  ┌──────────┐  ┌───────────┐  │
│  │  Resend  │  │ OneSignal │  │
│  └──────────┘  └───────────┘  │
└───────────────────────────────┘
```

---

## 3. Modelo de Datos (PostgreSQL)

### 3.1 Tablas Principales

```sql
-- Usuarios (extiende auth.users de Supabase)
profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users,
  role        enum('player', 'court_owner', 'super_admin'),
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
)

-- Canchas
courts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid REFERENCES profiles(id),
  name            text NOT NULL,
  sport           enum('volleyball', 'tennis', 'padel', 'football'),
  description     text,
  address         text NOT NULL,
  district        text NOT NULL,  -- distrito de Lima
  lat             decimal(10,8),
  lng             decimal(11,8),
  price_per_hour  decimal(10,2) NOT NULL,  -- en Soles (PEN)
  surface_type    enum('clay', 'grass', 'concrete', 'synthetic', 'carpet'),
  is_indoor       boolean DEFAULT false,
  has_parking     boolean DEFAULT false,
  has_locker_room boolean DEFAULT false,
  photos          text[],  -- URLs en Supabase Storage
  status          enum('pending', 'active', 'paused', 'rejected'),
  created_at      timestamptz DEFAULT now()
)

-- Horarios disponibles por cancha
court_schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id    uuid REFERENCES courts(id),
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Domingo
  open_time   time NOT NULL,
  close_time  time NOT NULL,
  slot_duration_minutes int DEFAULT 60
)

-- Bloqueos manuales (admin bloquea horas)
court_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id    uuid REFERENCES courts(id),
  blocked_at  timestamptz NOT NULL,
  blocked_end timestamptz NOT NULL,
  reason      text
)

-- Reservas
bookings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id            uuid REFERENCES courts(id),
  player_id           uuid REFERENCES profiles(id),
  start_time          timestamptz NOT NULL,
  end_time            timestamptz NOT NULL,
  total_amount        decimal(10,2) NOT NULL,  -- precio total en PEN
  commission_amount   decimal(10,2) NOT NULL,  -- 10% para MyCourt
  net_amount          decimal(10,2) NOT NULL,  -- para el dueño
  status              enum('pending', 'confirmed', 'completed', 'cancelled', 'refunded'),
  cancellation_reason text,
  created_at          timestamptz DEFAULT now()
)

-- Pagos (referencia a MercadoPago)
payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid REFERENCES bookings(id),
  mp_payment_id       text UNIQUE,  -- ID de MercadoPago
  mp_preference_id    text,
  amount              decimal(10,2) NOT NULL,
  currency            text DEFAULT 'PEN',
  status              enum('pending', 'approved', 'rejected', 'refunded'),
  payment_method      text,  -- 'yape', 'plin', 'credit_card', etc.
  created_at          timestamptz DEFAULT now()
)

-- Payouts al dueño de cancha
payouts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid REFERENCES profiles(id),
  booking_id    uuid REFERENCES bookings(id),
  amount        decimal(10,2) NOT NULL,
  status        enum('pending', 'processed', 'failed'),
  processed_at  timestamptz
)

-- Reseñas
reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid REFERENCES bookings(id) UNIQUE,
  court_id    uuid REFERENCES courts(id),
  player_id   uuid REFERENCES profiles(id),
  rating      int CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  owner_reply text,
  is_reported boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

-- Notificaciones
notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id),
  type        text,  -- 'booking_confirmed', 'reminder', 'cancelled', etc.
  title       text,
  body        text,
  data        jsonb,
  read_at     timestamptz,
  created_at  timestamptz DEFAULT now()
)
```

### 3.2 Índices Clave
```sql
CREATE INDEX idx_courts_sport_district ON courts(sport, district) WHERE status = 'active';
CREATE INDEX idx_bookings_court_time ON bookings(court_id, start_time) WHERE status != 'cancelled';
CREATE INDEX idx_bookings_player ON bookings(player_id, created_at DESC);
CREATE INDEX idx_reviews_court ON reviews(court_id, rating);
```

---

## 4. Row Level Security (RLS)

```sql
-- Jugadores solo ven sus propias reservas
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_own_bookings" ON bookings
  FOR SELECT USING (player_id = auth.uid());

-- Admins de cancha solo ven reservas de sus canchas
CREATE POLICY "owners_court_bookings" ON bookings
  FOR SELECT USING (
    court_id IN (SELECT id FROM courts WHERE owner_id = auth.uid())
  );

-- Canchas activas son visibles para todos
CREATE POLICY "public_active_courts" ON courts
  FOR SELECT USING (status = 'active');

-- Solo el dueño puede editar su cancha
CREATE POLICY "owner_manage_court" ON courts
  FOR ALL USING (owner_id = auth.uid());
```

---

## 5. Edge Functions (Supabase Deno)

| Función | Trigger | Responsabilidad |
|---------|---------|-----------------|
| `mp-webhook` | POST /functions/mp-webhook | Recibir notificaciones de MercadoPago, actualizar estado de pago/reserva |
| `create-booking` | POST /functions/create-booking | Crear reserva, bloquear slot, crear preferencia de pago en MP |
| `cancel-booking` | POST /functions/cancel-booking | Cancelar reserva, iniciar reembolso si aplica |
| `send-reminders` | Cron cada hora | Enviar recordatorios 2h antes de reservas |
| `process-payouts` | Cron diario | Procesar pagos pendientes a dueños T+1 |

---

## 6. Flujo de Reserva (Happy Path)

```
Jugador selecciona slot
        │
        ▼
POST /functions/create-booking
  ├── Verificar disponibilidad (SELECT con FOR UPDATE)
  ├── Crear booking (status: 'pending')
  ├── Crear preferencia MercadoPago
  └── Devolver URL de pago MP
        │
        ▼
Jugador completa pago en MP (redirect/checkout)
        │
        ▼
MP envía webhook → /functions/mp-webhook
  ├── Verificar firma del webhook
  ├── Si aprobado:
  │   ├── UPDATE booking status → 'confirmed'
  │   ├── UPDATE payment status → 'approved'
  │   ├── Crear payout (pending)
  │   └── Enviar email + push al jugador y admin
  └── Si rechazado:
      ├── UPDATE booking status → 'cancelled'
      └── Liberar slot
```

---

## 7. Estructura de Carpetas del Proyecto

```
mycourt_app_project_II/
├── apps/
│   ├── web/                    # Next.js 15
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (player)/
│   │   │   │   ├── search/
│   │   │   │   ├── courts/[id]/
│   │   │   │   └── bookings/
│   │   │   ├── (owner)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── courts/
│   │   │   │   └── bookings/
│   │   │   └── (admin)/
│   │   ├── components/
│   │   └── lib/
│   └── mobile/                 # React Native + Expo
│       ├── app/                # Expo Router
│       ├── components/
│       └── lib/
├── packages/
│   ├── shared/                 # Tipos TypeScript compartidos
│   │   ├── types/
│   │   └── utils/
│   └── ui/                    # Componentes UI compartibles
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge functions
│   └── seed.sql
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── epics/
│   └── stories/
└── package.json                # Monorepo (pnpm workspaces)
```

---

## 8. Seguridad

- **Autenticación**: JWT via Supabase Auth (access token 1h, refresh token 7d).
- **Autorización**: RLS en PostgreSQL + validación en Edge Functions.
- **Pagos**: Nunca almacenamos datos de tarjeta. Tokenización vía MercadoPago.
- **Webhook MP**: Verificar firma HMAC-SHA256.
- **Rate limiting**: Vercel Edge Middleware + Supabase rate limits.
- **CORS**: Configurado por dominios específicos en Supabase.
- **Secrets**: Variables de entorno en Vercel y Supabase Vault.

---

## 9. Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MercadoPago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Resend
RESEND_API_KEY=

# OneSignal
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://mycourt.pe
```

---

## 10. Infraestructura de Costos Estimados

| Servicio | Plan | Costo/mes estimado |
|---------|------|-------------------|
| Supabase | Pro | $25 USD |
| Vercel | Pro | $20 USD |
| Expo EAS | Production | $99 USD |
| Google Maps | Pay-as-you-go | ~$20 USD |
| Resend | Free/Starter | $0–20 USD |
| MercadoPago | Comisión % | Variable |
| **Total fijo** | | ~$170 USD/mes |
