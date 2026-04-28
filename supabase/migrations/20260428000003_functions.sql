-- MyCourt — Database Functions & Views
-- Migration: 20260428000003_functions

-- ─── View: courts with average rating ────────────────────────────────────────
CREATE OR REPLACE VIEW courts_with_rating AS
SELECT
  c.*,
  p.full_name AS owner_name,
  p.avatar_url AS owner_avatar,
  ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
  COUNT(r.id) AS review_count
FROM courts c
LEFT JOIN profiles p ON p.id = c.owner_id
LEFT JOIN reviews r ON r.court_id = c.id AND r.is_reported = false
GROUP BY c.id, p.full_name, p.avatar_url;

-- ─── Function: get available slots for a court on a date ─────────────────────
CREATE OR REPLACE FUNCTION get_available_slots(
  p_court_id uuid,
  p_date date
)
RETURNS TABLE (
  slot_start timestamptz,
  slot_end   timestamptz,
  is_available boolean
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_day_of_week int := EXTRACT(DOW FROM p_date);
  v_schedule court_schedules%ROWTYPE;
  v_slot_start timestamptz;
  v_slot_end timestamptz;
  v_slot_minutes int;
  v_open timestamptz;
  v_close timestamptz;
  v_tz text := 'America/Lima';
BEGIN
  SELECT * INTO v_schedule
  FROM court_schedules
  WHERE court_id = p_court_id AND day_of_week = v_day_of_week;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_slot_minutes := v_schedule.slot_duration_minutes;
  v_open  := (p_date || ' ' || v_schedule.open_time)::timestamptz AT TIME ZONE v_tz;
  v_close := (p_date || ' ' || v_schedule.close_time)::timestamptz AT TIME ZONE v_tz;

  v_slot_start := v_open;
  WHILE v_slot_start + (v_slot_minutes || ' minutes')::interval <= v_close LOOP
    v_slot_end := v_slot_start + (v_slot_minutes || ' minutes')::interval;

    -- Check for conflicting bookings
    RETURN QUERY SELECT
      v_slot_start,
      v_slot_end,
      NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE court_id = p_court_id
          AND status NOT IN ('cancelled', 'refunded')
          AND start_time < v_slot_end
          AND end_time > v_slot_start
      )
      AND NOT EXISTS (
        SELECT 1 FROM court_blocks
        WHERE court_id = p_court_id
          AND blocked_at < v_slot_end
          AND blocked_end > v_slot_start
      );

    v_slot_start := v_slot_end;
  END LOOP;
END;
$$;

-- ─── Function: expire pending bookings ────────────────────────────────────────
CREATE OR REPLACE FUNCTION expire_pending_bookings()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE bookings
  SET status = 'cancelled', cancellation_reason = 'Payment timeout'
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < now();
$$;

-- ─── Function: calculate booking amounts ──────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_booking_amounts(
  p_price_per_hour decimal,
  p_duration_minutes int
)
RETURNS TABLE (
  total_amount      decimal,
  commission_amount decimal,
  net_amount        decimal
)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    ROUND((p_price_per_hour * p_duration_minutes / 60.0)::numeric, 2),
    ROUND((p_price_per_hour * p_duration_minutes / 60.0 * 0.10)::numeric, 2),
    ROUND((p_price_per_hour * p_duration_minutes / 60.0 * 0.90)::numeric, 2);
$$;
