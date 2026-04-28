import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import MercadoPago from 'https://esm.sh/mercadopago@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateBookingRequest {
  court_id: string
  start_time: string // ISO datetime
  end_time: string   // ISO datetime
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body: CreateBookingRequest = await req.json()
    const { court_id, start_time, end_time } = body

    // Get court details
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('id, name, price_per_hour, status, owner_id')
      .eq('id', court_id)
      .single()

    if (courtError || !court || court.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Cancha no disponible' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check slot availability (no concurrent bookings)
    const { data: conflicting } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', court_id)
      .not('status', 'in', '("cancelled","refunded")')
      .lt('start_time', end_time)
      .gt('end_time', start_time)
      .limit(1)

    if (conflicting && conflicting.length > 0) {
      return new Response(JSON.stringify({ error: 'El horario ya no está disponible' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate amounts
    const durationMinutes =
      (new Date(end_time).getTime() - new Date(start_time).getTime()) / (1000 * 60)
    const { data: amounts } = await supabase.rpc('calculate_booking_amounts', {
      p_price_per_hour: court.price_per_hour,
      p_duration_minutes: durationMinutes,
    })

    const { total_amount, commission_amount, net_amount } = amounts[0]

    // Create booking (pending, expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        court_id,
        player_id: user.id,
        start_time,
        end_time,
        total_amount,
        commission_amount,
        net_amount,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Error al crear la reserva' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create MercadoPago preference
    const mp = new MercadoPago({ accessToken: Deno.env.get('MP_ACCESS_TOKEN')! })
    const preference = await mp.preferences.create({
      body: {
        items: [{
          id: booking.id,
          title: `Reserva ${court.name}`,
          quantity: 1,
          unit_price: total_amount,
          currency_id: 'PEN',
        }],
        external_reference: booking.id,
        back_urls: {
          success: `${Deno.env.get('APP_URL')}/bookings/${booking.id}?status=success`,
          failure: `${Deno.env.get('APP_URL')}/bookings/${booking.id}?status=failure`,
          pending: `${Deno.env.get('APP_URL')}/bookings/${booking.id}?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
        expires: true,
        expiration_date_to: expiresAt,
      },
    })

    // Save MP preference ID to payment record
    await supabase.from('payments').insert({
      booking_id: booking.id,
      mp_preference_id: preference.id,
      amount: total_amount,
      currency: 'PEN',
      status: 'pending',
    })

    return new Response(
      JSON.stringify({
        booking_id: booking.id,
        payment_url: preference.init_point,
        expires_at: expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
