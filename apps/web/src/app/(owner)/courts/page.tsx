import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Court, CourtStatus } from '@mycourt/shared'

const STATUS_LABELS: Record<CourtStatus, string> = {
  pending: 'Pendiente aprobación',
  active: 'Activa',
  paused: 'Pausada',
  rejected: 'Rechazada',
}

const STATUS_COLORS: Record<CourtStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-800',
}

const SPORT_LABELS: Record<string, string> = {
  volleyball: 'Vóley',
  tennis: 'Tenis',
  padel: 'Pádel',
  football: 'Fútbol',
}

export default async function CourtsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const courtList = (courts ?? []) as Court[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis canchas</h1>
          <p className="mt-1 text-gray-500">{courtList.length} {courtList.length === 1 ? 'cancha registrada' : 'canchas registradas'}</p>
        </div>
        <Link href="/(owner)/courts/new" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700')}>
          + Nueva cancha
        </Link>
      </div>

      {courtList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-20 text-center">
          <p className="text-4xl">🏟️</p>
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No tienes canchas registradas</h2>
          <p className="mt-1 text-sm text-gray-500">Agrega tu primera cancha para empezar a recibir reservas</p>
          <Link href="/(owner)/courts/new" className={cn(buttonVariants(), 'mt-4 bg-green-600 hover:bg-green-700')}>
            Crear cancha
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courtList.map((court) => (
            <Card key={court.id} className="overflow-hidden">
              <div className="h-36 bg-gray-100">
                {court.photos?.[0] ? (
                  <img src={court.photos[0]} alt={court.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🏟️</div>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{court.name}</h3>
                    <p className="text-sm text-gray-500">{court.district}</p>
                  </div>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[court.status]}`}>
                    {STATUS_LABELS[court.status]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <Badge variant="outline">{SPORT_LABELS[court.sport] ?? court.sport}</Badge>
                  <span className="font-semibold text-green-700">S/. {court.price_per_hour}/hr</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
