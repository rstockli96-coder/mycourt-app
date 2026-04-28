import { COMMISSION_RATE, CANCELLATION_FREE_HOURS } from '../constants/index.js'

export function calculateCommission(totalAmount: number): {
  commission: number
  net: number
} {
  const commission = Math.round(totalAmount * COMMISSION_RATE * 100) / 100
  return { commission, net: totalAmount - commission }
}

export function formatCurrency(amount: number): string {
  return `S/. ${amount.toFixed(2)}`
}

export function isCancellationFree(startTime: string): boolean {
  const hoursUntilStart = (new Date(startTime).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntilStart > CANCELLATION_FREE_HOURS
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatDateTimePE(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  })
}

export function generateBookingCode(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase()
}
