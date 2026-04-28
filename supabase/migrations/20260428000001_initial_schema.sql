-- MyCourt — Initial Schema
-- Migration: 20260428000001_initial_schema

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('player', 'court_owner', 'super_admin');
CREATE TYPE sport_type AS ENUM ('volleyball', 'tennis', 'padel', 'football');
CREATE TYPE court_status AS ENUM ('pending', 'active', 'paused', 'rejected');
CREATE TYPE surface_type AS ENUM ('clay', 'grass', 'concrete', 'synthetic', 'carpet');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processed', 'failed');
CREATE TYPE notification_type AS ENUM (
  'booking_confirmed', 'booking_cancelled', 'booking_reminder',
  'new_booking', 'new_review', 'court_approved', 'court_rejected', 'payout_processed'
);

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'player',
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Courts ──────────────────────────────────────────────────────────────────
CREATE TABLE courts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  sport           sport_type NOT NULL,
  description     text,
  address         text NOT NULL,
  district        text NOT NULL,
  lat             decimal(10,8),
  lng             decimal(11,8),
  price_per_hour  decimal(10,2) NOT NULL CHECK (price_per_hour > 0),
  surface_type    surface_type NOT NULL DEFAULT 'concrete',
  is_indoor       boolean NOT NULL DEFAULT false,
  has_parking     boolean NOT NULL DEFAULT false,
  has_locker_room boolean NOT NULL DEFAULT false,
  photos          text[] NOT NULL DEFAULT '{}',
  status          court_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Court Schedules ─────────────────────────────────────────────────────────
CREATE TABLE court_schedules (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id               uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week            int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time              time NOT NULL,
  close_time             time NOT NULL,
  slot_duration_minutes  int NOT NULL DEFAULT 60 CHECK (slot_duration_minutes IN (60, 90, 120)),
  UNIQUE (court_id, day_of_week)
);

-- ─── Court Blocks ────────────────────────────────────────────────────────────
CREATE TABLE court_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id    uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  blocked_at  timestamptz NOT NULL,
  blocked_end timestamptz NOT NULL,
  reason      text,
  CHECK (blocked_end > blocked_at)
);

-- ─── Bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id            uuid NOT NULL REFERENCES courts(id),
  player_id           uuid NOT NULL REFERENCES profiles(id),
  start_time          timestamptz NOT NULL,
  end_time            timestamptz NOT NULL,
  total_amount        decimal(10,2) NOT NULL CHECK (total_amount > 0),
  commission_amount   decimal(10,2) NOT NULL CHECK (commission_amount >= 0),
  net_amount          decimal(10,2) NOT NULL CHECK (net_amount >= 0),
  status              booking_status NOT NULL DEFAULT 'pending',
  cancellation_reason text,
  expires_at          timestamptz,  -- para bookings pending (bloqueo de 10 min)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid NOT NULL REFERENCES bookings(id),
  mp_payment_id       text UNIQUE,
  mp_preference_id    text,
  amount              decimal(10,2) NOT NULL,
  currency            text NOT NULL DEFAULT 'PEN',
  status              payment_status NOT NULL DEFAULT 'pending',
  payment_method      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ─── Payouts ──────────────────────────────────────────────────────────────────
CREATE TABLE payouts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES profiles(id),
  booking_id    uuid NOT NULL REFERENCES bookings(id) UNIQUE,
  amount        decimal(10,2) NOT NULL CHECK (amount > 0),
  status        payout_status NOT NULL DEFAULT 'pending',
  processed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES bookings(id) UNIQUE,
  court_id    uuid NOT NULL REFERENCES courts(id),
  player_id   uuid NOT NULL REFERENCES profiles(id),
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  owner_reply text,
  is_reported boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       text NOT NULL,
  body        text NOT NULL,
  data        jsonb,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_courts_sport_district ON courts(sport, district) WHERE status = 'active';
CREATE INDEX idx_courts_owner ON courts(owner_id);
CREATE INDEX idx_courts_location ON courts(lat, lng) WHERE status = 'active';

CREATE INDEX idx_bookings_court_time ON bookings(court_id, start_time)
  WHERE status NOT IN ('cancelled', 'refunded');
CREATE INDEX idx_bookings_player ON bookings(player_id, created_at DESC);
CREATE INDEX idx_bookings_status ON bookings(status, created_at);
CREATE INDEX idx_bookings_expires ON bookings(expires_at) WHERE status = 'pending';

CREATE INDEX idx_reviews_court ON reviews(court_id, created_at DESC)
  WHERE is_reported = false;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX idx_court_blocks_court_time ON court_blocks(court_id, blocked_at, blocked_end);

-- ─── Updated_at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
