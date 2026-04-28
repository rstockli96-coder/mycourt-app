export const COMMISSION_RATE = 0.10 // 10%

export const BOOKING_LOCK_MINUTES = 10 // slot bloqueado durante pago

export const CANCELLATION_FREE_HOURS = 24 // reembolso 100% si cancela > 24h antes

export const SPORTS = [
  { value: 'volleyball', label: 'Vóley' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'padel', label: 'Pádel' },
  { value: 'football', label: 'Fútbol' },
] as const

export const SURFACE_TYPES = [
  { value: 'clay', label: 'Arcilla' },
  { value: 'grass', label: 'Grass' },
  { value: 'concrete', label: 'Concreto' },
  { value: 'synthetic', label: 'Sintético' },
  { value: 'carpet', label: 'Alfombra' },
] as const

export const LIMA_DISTRICTS = [
  'Barranco', 'Breña', 'Chorrillos', 'Comas', 'El Agustino',
  'Independencia', 'Jesús María', 'La Molina', 'La Victoria',
  'Lince', 'Los Olivos', 'Lurigancho-Chosica', 'Lurín',
  'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Puente Piedra',
  'Pueblo Libre', 'Rimac', 'San Borja', 'San Isidro',
  'San Juan de Lurigancho', 'San Juan de Miraflores',
  'San Luis', 'San Martín de Porres', 'San Miguel',
  'Santa Anita', 'Santiago de Surco', 'Surquillo',
  'Villa El Salvador', 'Villa María del Triunfo',
] as const

export const SLOT_DURATIONS = [
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
] as const

export const MAX_COURT_PHOTOS = 8

export const CURRENCY = 'PEN'
export const CURRENCY_SYMBOL = 'S/.'

export const TIMEZONE = 'America/Lima'
