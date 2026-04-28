import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { BookingWithDetails, BookingStatus } from '@mycourt/shared'

export function usePlayerBookings(status?: BookingStatus[]) {
  return useQuery({
    queryKey: ['player-bookings', status],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from('bookings')
        .select(`
          *,
          court:courts!court_id(id, name, sport, address, district, photos),
          player:profiles!player_id(id, full_name, avatar_url)
        `)
        .eq('player_id', user.id)
        .order('start_time', { ascending: false })

      if (status?.length) query = query.in('status', status)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as BookingWithDetails[]
    },
  })
}

export function useOwnerBookings() {
  return useQuery({
    queryKey: ['owner-bookings'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: courts } = await supabase
        .from('courts')
        .select('id')
        .eq('owner_id', user.id)

      if (!courts?.length) return []
      const courtIds = courts.map((c) => c.id)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts!court_id(id, name, sport, address, district, photos),
          player:profiles!player_id(id, full_name, avatar_url)
        `)
        .in('court_id', courtIds)
        .order('start_time', { ascending: false })

      if (error) throw error
      return (data ?? []) as BookingWithDetails[]
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', cancellation_reason: reason ?? null })
        .eq('id', bookingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] })
    },
  })
}
