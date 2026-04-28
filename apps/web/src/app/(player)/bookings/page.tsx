'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { BookingWithDetails, BookingStatus } from '@mycourt/shared'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const SPORT_EMOJI: Record<string, string> = {
  volleyball: '🏐',
  tennis: '🎾',
  padel: '🏸',
  football: '⚽',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts!court_id(id, name, sport, address, district, photos),
          player:profiles!player_id(id, full_name, avatar_url)
        `)
        .eq('player_id', user.id)
        .order('start_time', { ascending: false })

      setBookings((data ?? []) as BookingWithDetails[])
      setLoading(false)
    }
    fetchBookings()
  }, [])

  const upcoming = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status))
  const past = bookings.filter((b) => b.status === 'completed')
  const cancelled = bookings.filter((b) => ['cancelled', 'refunded'].includes(b.status))

  function BookingCard({ booking }: { booking: BookingWithDetails }) {
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    return (
      <Card>
        <CardContent className="flex items-start gap-4 pt-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl">
            {SPORT_EMOJI[booking.court.sport] ?? '🏟️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.court.name}</h3>
                <p className="text-sm text-gray-500">{booking.court.district}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                {STATUS_LABELS[booking.status]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                📅 {format(start, "d 'de' MMMM, yyyy", { locale: es })}
              </span>
              <span>
                🕐 {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </span>
              <span className="font-medium text-green-700">S/. {booking.total_amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
        <p className="text-3xl">📋</p>
        <p className="mt-2 text-gray-500">{message}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
        <p className="mt-1 text-gray-500">Historial y próximas reservas</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas {upcoming.length > 0 && `(${upcoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">
            Pasadas {past.length > 0 && `(${past.length})`}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas {cancelled.length > 0 && `(${cancelled.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0
            ? <EmptyState message="No tienes reservas próximas" />
            : upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0
            ? <EmptyState message="No tienes reservas pasadas" />
            : past.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-3">
          {cancelled.length === 0
            ? <EmptyState message="No tienes reservas canceladas" />
            : cancelled.map((b) => <BookingCard key={b.id} booking={b} />)
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
