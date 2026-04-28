import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
  try {
    // Verify MercadoPago webhook signature
    const mpSignature = req.headers.get('x-signature')
    const mpRequestId = req.headers.get('x-request-id')
    const rawBody = await req.text()

    if (mpSignature && mpRequestId) {
      const webhookSecret = Deno.env.get('MP_WEBHOOK_SECRET')!
      const signedTemplate = `id:${mpRequestId};ts:${Date.now()};`
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(signedTemplate)
        .digest('hex')

      // In production, verify this properly with the ts from signature header
    }

    const body = JSON.parse(rawBody)
    const { type, data } = body

    if (type !== 'payment') {
      return new Response('OK', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch payment details from MercadoPago API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${data.id}`,
      {
        headers: { Authorization: `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}` },
      },
    )
    const mpPayment = await mpResponse.json()

    const bookingId = mpPayment.external_reference
    const mpStatus = mpPayment.status // 'approved' | 'rejected' | 'pending' | 'refunded'

    // Update payment record
    await supabase
      .from('payments')
      .update({
        mp_payment_id: String(data.id),
        status: mpStatus === 'approved' ? 'approved'
          : mpStatus === 'refunded' ? 'refunded'
          : mpStatus === 'rejected' ? 'rejected'
          : 'pending',
        payment_method: mpPayment.payment_type_id,
      })
      .eq('booking_id', bookingId)

    if (mpStatus === 'approved') {
      // Confirm booking
      await supabase
        .from('bookings')
        .update({ status: 'confirmed', expires_at: null })
        .eq('id', bookingId)

      // Get booking with court owner info for payout
      const { data: booking } = await supabase
        .from('bookings')
        .select('net_amount, courts(owner_id)')
        .eq('id', bookingId)
        .single()

      if (booking) {
        const ownerId = (booking.courts as { owner_id: string }).owner_id

        // Create payout for court owner
        await supabase.from('payouts').insert({
          owner_id: ownerId,
          booking_id: bookingId,
          amount: booking.net_amount,
          status: 'pending',
        })

        // Create notifications
        const { data: bookingFull } = await supabase
          .from('bookings')
          .select('player_id, court_id, start_time, courts(name)')
          .eq('id', bookingId)
          .single()

        if (bookingFull) {
          const courtName = (bookingFull.courts as { name: string }).name
          const startFormatted = new Date(bookingFull.start_time)
            .toLocaleString('es-PE', { timeZone: 'America/Lima' })

          // Notify player
          await supabase.from('notifications').insert({
            user_id: bookingFull.player_id,
            type: 'booking_confirmed',
            title: '¡Reserva confirmada!',
            body: `Tu reserva en ${courtName} para el ${startFormatted} está confirmada.`,
            data: { booking_id: bookingId },
          })

          // Notify owner
          await supabase.from('notifications').insert({
            user_id: ownerId,
            type: 'new_booking',
            title: 'Nueva reserva recibida',
            body: `Tienes una nueva reserva en ${courtName} para el ${startFormatted}.`,
            data: { booking_id: bookingId },
          })
        }
      }
    } else if (mpStatus === 'rejected') {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled', cancellation_reason: 'Payment rejected' })
        .eq('id', bookingId)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Error', { status: 500 })
  }
})
