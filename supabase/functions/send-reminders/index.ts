import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cron: runs every hour. Sends reminders for bookings starting in next 2-3 hours.
serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = new Date()
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, player_id, start_time, courts(name, address, district)')
    .eq('status', 'confirmed')
    .gte('start_time', twoHoursFromNow.toISOString())
    .lte('start_time', threeHoursFromNow.toISOString())

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  const notifications = bookings.map((booking) => {
    const court = booking.courts as { name: string; address: string; district: string }
    const startTime = new Date(booking.start_time).toLocaleString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
    })

    return {
      user_id: booking.player_id,
      type: 'booking_reminder' as const,
      title: '⏰ Tu reserva es en 2 horas',
      body: `${court.name} - ${startTime}. ${court.address}, ${court.district}`,
      data: { booking_id: booking.id },
    }
  })

  await supabase.from('notifications').insert(notifications)

  return new Response(JSON.stringify({ sent: notifications.length }), { status: 200 })
})
