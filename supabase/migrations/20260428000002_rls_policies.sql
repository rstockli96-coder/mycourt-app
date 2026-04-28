-- MyCourt — Row Level Security Policies
-- Migration: 20260428000002_rls_policies

-- ─── Enable RLS on all tables ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Super admin can see all profiles
CREATE POLICY "profiles_super_admin" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Courts ──────────────────────────────────────────────────────────────────
-- Anyone (including anonymous) can see active courts
CREATE POLICY "courts_public_active" ON courts
  FOR SELECT USING (status = 'active');

-- Owner can see all their courts (any status)
CREATE POLICY "courts_owner_all" ON courts
  FOR ALL USING (owner_id = auth.uid());

-- Super admin can see/manage all courts
CREATE POLICY "courts_super_admin" ON courts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Court Schedules ─────────────────────────────────────────────────────────
CREATE POLICY "schedules_public_read" ON court_schedules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courts WHERE id = court_id AND status = 'active')
  );

CREATE POLICY "schedules_owner_manage" ON court_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courts WHERE id = court_id AND owner_id = auth.uid())
  );

-- ─── Court Blocks ────────────────────────────────────────────────────────────
CREATE POLICY "blocks_public_read" ON court_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courts WHERE id = court_id AND status = 'active')
  );

CREATE POLICY "blocks_owner_manage" ON court_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courts WHERE id = court_id AND owner_id = auth.uid())
  );

-- ─── Bookings ─────────────────────────────────────────────────────────────────
-- Players can see their own bookings
CREATE POLICY "bookings_player_own" ON bookings
  FOR SELECT USING (player_id = auth.uid());

-- Players can create bookings
CREATE POLICY "bookings_player_insert" ON bookings
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- Players can cancel their own pending/confirmed bookings
CREATE POLICY "bookings_player_cancel" ON bookings
  FOR UPDATE USING (
    player_id = auth.uid()
    AND status IN ('pending', 'confirmed')
  );

-- Court owners can see bookings for their courts
CREATE POLICY "bookings_owner_read" ON bookings
  FOR SELECT USING (
    court_id IN (SELECT id FROM courts WHERE owner_id = auth.uid())
  );

-- Super admin sees all
CREATE POLICY "bookings_super_admin" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE POLICY "payments_player_own" ON payments
  FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE player_id = auth.uid())
  );

CREATE POLICY "payments_owner_read" ON payments
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN courts c ON c.id = b.court_id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_super_admin" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Payouts ──────────────────────────────────────────────────────────────────
CREATE POLICY "payouts_owner_own" ON payouts
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "payouts_super_admin" ON payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Reviews ──────────────────────────────────────────────────────────────────
-- Public: read non-reported reviews on active courts
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (
    is_reported = false
    AND EXISTS (SELECT 1 FROM courts WHERE id = court_id AND status = 'active')
  );

-- Players can create reviews for their completed bookings
CREATE POLICY "reviews_player_insert" ON reviews
  FOR INSERT WITH CHECK (
    player_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
        AND player_id = auth.uid()
        AND status = 'completed'
    )
  );

-- Players can see their own reviews
CREATE POLICY "reviews_player_own" ON reviews
  FOR SELECT USING (player_id = auth.uid());

-- Owner can reply to reviews on their courts
CREATE POLICY "reviews_owner_reply" ON reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM courts WHERE id = court_id AND owner_id = auth.uid())
  );

-- Players can report reviews
CREATE POLICY "reviews_player_report" ON reviews
  FOR UPDATE USING (player_id = auth.uid());

CREATE POLICY "reviews_super_admin" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ─── Notifications ─────────────────────────────────────────────────────────────
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());
