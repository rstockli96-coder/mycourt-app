import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CourtWithRating, CourtSearchParams } from '@mycourt/shared'

export function useCourts(params: CourtSearchParams = {}) {
  return useQuery({
    queryKey: ['courts', params],
    queryFn: async () => {
      const supabase = createClient()

      let query = supabase
        .from('courts')
        .select(`
          *,
          owner:profiles!owner_id(id, full_name, avatar_url),
          reviews(rating)
        `)
        .eq('status', 'active')

      if (params.sport) query = query.eq('sport', params.sport)
      if (params.district) query = query.eq('district', params.district)
      if (params.min_price) query = query.gte('price_per_hour', params.min_price)
      if (params.max_price) query = query.lte('price_per_hour', params.max_price)
      if (params.is_indoor !== undefined) query = query.eq('is_indoor', params.is_indoor)
      if (params.has_parking !== undefined) query = query.eq('has_parking', params.has_parking)
      if (params.has_locker_room !== undefined) query = query.eq('has_locker_room', params.has_locker_room)
      if (params.surface_type) query = query.eq('surface_type', params.surface_type)

      const page = params.page ?? 1
      const perPage = params.per_page ?? 20
      const from = (page - 1) * perPage
      query = query.range(from, from + perPage - 1)

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      return (data ?? []).map((c: Record<string, unknown>) => {
        const reviews = (c.reviews as { rating: number }[]) ?? []
        const avg_rating = reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : null
        return { ...c, avg_rating, review_count: reviews.length } as CourtWithRating
      })
    },
  })
}

export function useOwnerCourts() {
  return useQuery({
    queryKey: ['owner-courts'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })
}

export function useCourt(id: string) {
  return useQuery({
    queryKey: ['court', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('courts')
        .select(`
          *,
          owner:profiles!owner_id(id, full_name, avatar_url),
          reviews(*, player:profiles!player_id(id, full_name, avatar_url))
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}
