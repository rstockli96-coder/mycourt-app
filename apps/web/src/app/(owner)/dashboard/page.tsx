import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [courtsRes, bookingsRes] = await Promise.all([
    supabase
      .from('courts')
      .select('id, status')
      .eq('owner_id', user.id),
    supabase
      .from('bookings')
      .select('id, status, total_amount, net_amount, created_at, court:courts!court_id(owner_id)')
      .eq('court.owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const courts = courtsRes.data ?? []
  const recentBookings = bookingsRes.data ?? []

  const activeCourts = courts.filter((c) => c.status === 'active').length
  const pendingCourts = courts.filter((c) => c.status === 'pending').length

  const completedBookings = recentBookings.filter((b) => b.status === 'completed')
  const totalRevenue = completedBookings.reduce((s, b) => s + (b.net_amount ?? 0), 0)

  const metrics = [
    { label: 'Canchas activas', value: activeCourts, icon: '🏟️', color: 'text-green-700' },
    { label: 'Canchas pendientes', value: pendingCourts, icon: '⏳', color: 'text-yellow-700' },
    { label: 'Reservas recientes', value: recentBookings.length, icon: '📅', color: 'text-blue-700' },
    { label: 'Ingresos (S/.)', value: totalRevenue.toFixed(0), icon: '💰', color: 'text-purple-700' },
  ]

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    refunded: 'Reembolsada',
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Resumen de tu actividad en MyCourt</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/(owner)/courts/new">+ Nueva cancha</Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {courts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-4xl">🏟️</p>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">¡Publica tu primera cancha!</h2>
            <p className="mt-1 text-sm text-gray-500">
              Crea el perfil de tu cancha para empezar a recibir reservas
            </p>
            <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
              <Link href="/(owner)/courts/new">Crear cancha</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas reservas</CardTitle>
            <Link href="/(owner)/bookings" className="text-sm text-green-600 hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentBookings.map((booking: Record<string, unknown>) => (
                <div key={booking.id as string} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reserva #{(booking.id as string).slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.created_at as string).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">S/. {booking.net_amount as number}</p>
                    <span className="text-xs text-gray-500">
                      {STATUS_LABELS[booking.status as string] ?? booking.status as string}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
