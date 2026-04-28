'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { CourtWithRating, Sport } from '@mycourt/shared'

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'volleyball', label: 'Vóley' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'padel', label: 'Pádel' },
]

const DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina',
  'San Borja', 'Pueblo Libre', 'Jesús María', 'Lince', 'Magdalena',
]

export default function SearchPage() {
  const router = useRouter()
  const [courts, setCourts] = useState<CourtWithRating[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [filters, setFilters] = useState({
    sport: '' as Sport | '',
    district: '',
    date: '',
    max_price: '',
  })

  async function handleSearch() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('courts')
      .select(`
        *,
        owner:profiles!owner_id(id, full_name, avatar_url),
        reviews(rating)
      `)
      .eq('status', 'active')

    if (filters.sport) query = query.eq('sport', filters.sport)
    if (filters.district) query = query.eq('district', filters.district)
    if (filters.max_price) query = query.lte('price_per_hour', Number(filters.max_price))

    const { data } = await query.order('created_at', { ascending: false }).limit(20)

    const courtsWithRating = (data ?? []).map((c: Record<string, unknown>) => {
      const reviews = (c.reviews as { rating: number }[]) ?? []
      const avg_rating = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null
      return { ...c, avg_rating, review_count: reviews.length } as CourtWithRating
    })

    setCourts(courtsWithRating)
    setSearched(true)
    setLoading(false)
  }

  const sportLabel = (s: Sport) => SPORTS.find((x) => x.value === s)?.label ?? s

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buscar canchas</h1>
        <p className="mt-1 text-gray-500">Encuentra la cancha perfecta en Lima</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label>Deporte</Label>
              <select
                value={filters.sport}
                onChange={(e) => setFilters({ ...filters, sport: e.target.value as Sport | '' })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos los deportes</option>
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Distrito</Label>
              <select
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos los distritos</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Precio máx. (S/./hora)</Label>
              <Input
                type="number"
                placeholder="Ej: 80"
                value={filters.max_price}
                min={0}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Buscando...' : 'Buscar canchas'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div>
          <p className="mb-4 text-sm text-gray-500">
            {courts.length} {courts.length === 1 ? 'cancha encontrada' : 'canchas encontradas'}
          </p>

          {courts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
              <p className="text-gray-500">No se encontraron canchas con esos filtros</p>
              <p className="mt-1 text-sm text-gray-400">Intenta cambiar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <Card
                  key={court.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/(player)/courts/${court.id}`)}
                >
                  <div className="h-40 overflow-hidden rounded-t-lg bg-gray-100">
                    {court.photos?.[0] ? (
                      <img src={court.photos[0]} alt={court.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🏟️</div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{court.name}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">{court.district}</p>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {sportLabel(court.sport)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {court.avg_rating ? (
                          <>
                            <span className="text-yellow-500">★</span>
                            <span>{court.avg_rating.toFixed(1)}</span>
                            <span>({court.review_count})</span>
                          </>
                        ) : (
                          <span>Sin reseñas</span>
                        )}
                      </div>
                      <span className="font-semibold text-green-700">
                        S/. {court.price_per_hour}/hr
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="rounded-lg border border-dashed border-gray-300 py-20 text-center">
          <p className="text-2xl">🎾</p>
          <p className="mt-2 text-gray-500">Busca canchas de vóley, tenis o pádel en Lima</p>
        </div>
      )}
    </div>
  )
}
