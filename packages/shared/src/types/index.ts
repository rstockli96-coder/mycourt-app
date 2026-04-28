// Domain types for MyCourt

export type UserRole = 'player' | 'court_owner' | 'super_admin'

export type Sport = 'volleyball' | 'tennis' | 'padel' | 'football'

export type CourtStatus = 'pending' | 'active' | 'paused' | 'rejected'

export type SurfaceType = 'clay' | 'grass' | 'concrete' | 'synthetic' | 'carpet'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded'

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export type PayoutStatus = 'pending' | 'processed' | 'failed'

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
}

// ─── Courts ──────────────────────────────────────────────────────────────────

export interface Court {
  id: string
  owner_id: string
  name: string
  sport: Sport
  description: string | null
  address: string
  district: string
  lat: number
  lng: number
  price_per_hour: number
  surface_type: SurfaceType
  is_indoor: boolean
  has_parking: boolean
  has_locker_room: boolean
  photos: string[]
  status: CourtStatus
  created_at: string
}

export interface CourtWithRating extends Court {
  avg_rating: number | null
  review_count: number
  owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface CourtSchedule {
  id: string
  court_id: string
  day_of_week: number // 0=Sunday, 6=Saturday
  open_time: string  // HH:MM
  close_time: string // HH:MM
  slot_duration_minutes: number
}

export interface CourtBlock {
  id: string
  court_id: string
  blocked_at: string
  blocked_end: string
  reason: string | null
}

// ─── Time Slots ──────────────────────────────────────────────────────────────

export interface TimeSlot {
  start_time: string // ISO datetime
  end_time: string   // ISO datetime
  is_available: boolean
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface Booking {
  id: string
  court_id: string
  player_id: string
  start_time: string
  end_time: string
  total_amount: number
  commission_amount: number
  net_amount: number
  status: BookingStatus
  cancellation_reason: string | null
  created_at: string
}

export interface BookingWithDetails extends Booking {
  court: Pick<Court, 'id' | 'name' | 'sport' | 'address' | 'district' | 'photos'>
  player: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string
  booking_id: string
  mp_payment_id: string | null
  mp_preference_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  created_at: string
}

// ─── Payouts ──────────────────────────────────────────────────────────────────

export interface Payout {
  id: string
  owner_id: string
  booking_id: string
  amount: number
  status: PayoutStatus
  processed_at: string | null
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  booking_id: string
  court_id: string
  player_id: string
  rating: number // 1-5
  comment: string | null
  owner_reply: string | null
  is_reported: boolean
  created_at: string
}

export interface ReviewWithPlayer extends Review {
  player: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'new_booking'     // for court owner
  | 'new_review'      // for court owner
  | 'court_approved'
  | 'court_rejected'
  | 'payout_processed'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}

export interface ApiError {
  message: string
  code?: string
}

// ─── Search / Filters ─────────────────────────────────────────────────────────

export interface CourtSearchParams {
  sport?: Sport
  district?: string
  date?: string // YYYY-MM-DD
  min_price?: number
  max_price?: number
  surface_type?: SurfaceType
  is_indoor?: boolean
  has_parking?: boolean
  has_locker_room?: boolean
  page?: number
  per_page?: number
}
