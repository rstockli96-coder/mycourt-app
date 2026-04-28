import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CourtWithRating, ReviewWithPlayer } from '@mycourt/shared'

const SPORT_LABELS: Record<string, string> = {
  volleyball: 'Vóley',
  tennis: 'Tenis',
  padel: 'Pádel',
  football: 'Fútbol',
}

const SURFACE_LABELS: Record<string, string> = {
  clay: 'Arcilla',
  grass: 'Grass natural',
  concrete: 'Concreto',
  synthetic: 'Grass sintético',
  carpet: 'Alfombra',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function CourtDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: court } = await supabase
    .from('courts')
    .select(`
      *,
      owner:profiles!owner_id(id, full_name, avatar_url),
      reviews(*, player:profiles!player_id(id, full_name, avatar_url))
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!court) notFound()

  const reviews = (court.reviews ?? []) as ReviewWithPlayer[]
  const avg_rating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  const amenities = [
    { key: 'is_indoor', label: 'Techo / Cubierta', icon: '🏠' },
    { key: 'has_parking', label: 'Estacionamiento', icon: '🚗' },
    { key: 'has_locker_room', label: 'Vestuarios', icon: '🚿' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{court.name}</h1>
            <p className="mt-1 text-gray-500">📍 {court.address}, {court.district}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-700">S/. {court.price_per_hour}</p>
            <p className="text-sm text-gray-500">por hora</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {SPORT_LABELS[court.sport] ?? court.sport}
          </Badge>
          {avg_rating && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <span className="text-yellow-500">★</span>
              {avg_rating.toFixed(1)} ({reviews.length} reseñas)
            </span>
          )}
        </div>
      </div>

      {/* Gallery */}
      {court.photos?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl sm:grid-cols-3">
          {court.photos.slice(0, 5).map((photo: string, i: number) => (
            <div
              key={i}
              className={`overflow-hidden bg-gray-100 ${i === 0 ? 'col-span-2 row-span-2 h-64 sm:h-80' : 'h-32 sm:h-40'}`}
            >
              <img src={photo} alt={`${court.name} - foto ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          {court.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
              <p className="mt-2 text-gray-600">{court.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Características</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🏟️</span> {SURFACE_LABELS[court.surface_type] ?? court.surface_type}
              </div>
              {amenities.map((a) => (
                (court as Record<string, unknown>)[a.key] && (
                  <div key={a.key} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{a.icon}</span> {a.label}
                  </div>
                )
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Reseñas {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-gray-400">Aún no hay reseñas para esta cancha.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {review.player?.full_name ?? 'Jugador'}
                      </span>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Reservar cancha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">S/. {court.price_per_hour}</p>
                <p className="text-sm text-gray-500">por hora</p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Ver disponibilidad
              </Button>
              <p className="text-center text-xs text-gray-400">
                Solo se cobra al confirmar tu reserva
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
