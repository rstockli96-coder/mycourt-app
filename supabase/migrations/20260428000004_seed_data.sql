-- MyCourt — Seed Data (distritos y configuración inicial)
-- Migration: 20260428000004_seed_data
-- This migration only runs in development (supabase db reset)

-- Insert a default super_admin (update the UUID after creating the user via Auth UI)
-- INSERT INTO profiles (id, role, full_name) VALUES ('<super-admin-uuid>', 'super_admin', 'MyCourt Admin');

-- Sample court for testing (requires an owner profile first)
-- INSERT INTO courts (owner_id, name, sport, address, district, lat, lng, price_per_hour, surface_type, status)
-- VALUES ('<owner-uuid>', 'Cancha Miraflores', 'volleyball', 'Av. Larco 123', 'Miraflores', -12.1191, -77.0491, 50.00, 'synthetic', 'active');
