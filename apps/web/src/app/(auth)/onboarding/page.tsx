'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/shared/Logo'

type Step = 'welcome' | 'profile' | 'done'

interface OnboardingData {
  fullName: string
  phone: string
  district: string
}

const DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina',
  'San Borja', 'Pueblo Libre', 'Jesús María', 'Lince', 'Magdalena',
]

const PLAYER_STEPS = [
  { key: 'welcome', title: '¡Bienvenido a MyCourt! 🎾', desc: 'Reserva canchas de vóley, tenis y pádel en Lima en pocos segundos.' },
  { key: 'profile', title: 'Completa tu perfil', desc: 'Así los administradores saben quién reserva sus canchas.' },
  { key: 'done', title: '¡Todo listo! 🚀', desc: 'Ya puedes buscar y reservar canchas en Lima.' },
]

const OWNER_STEPS = [
  { key: 'welcome', title: '¡Bienvenido, administrador! 🏟️', desc: 'Publica tus canchas y empieza a recibir reservas.' },
  { key: 'profile', title: 'Completa tu perfil', desc: 'Los jugadores verán esta información en tus canchas.' },
  { key: 'done', title: '¡Listo para publicar! 🚀', desc: 'Ve a "Mis canchas" para agregar tu primera cancha.' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [role, setRole] = useState<'player' | 'court_owner'>('player')
  const [data, setData] = useState<OnboardingData>({ fullName: '', phone: '', district: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = role === 'court_owner' ? OWNER_STEPS : PLAYER_STEPS
  const currentIdx = steps.findIndex((s) => s.key === step)
  const currentStep = steps[currentIdx]

  async function handleSaveProfile() {
    if (!data.fullName) {
      setError('Ingresa tu nombre completo')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: data.fullName, phone: data.phone || null })
      .eq('id', user.id)

    setSaving(false)
    if (updateError) {
      setError('No se pudo guardar el perfil')
      return
    }
    setStep('done')
  }

  function handleFinish() {
    if (role === 'court_owner') {
      router.push('/(owner)/dashboard')
    } else {
      router.push('/(player)/search')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-2 w-2 rounded-full transition-all ${i <= currentIdx ? 'bg-green-600 w-6' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {step === 'welcome' && (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentStep.title}</h1>
                <p className="mt-2 text-gray-500">{currentStep.desc}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">¿Cómo usarás MyCourt?</p>
                {[
                  { value: 'player' as const, label: '🎾 Jugador', desc: 'Quiero reservar canchas' },
                  { value: 'court_owner' as const, label: '🏟️ Propietario', desc: 'Quiero publicar mi cancha' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      role === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <Button onClick={() => setStep('profile')} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Continuar
              </Button>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">{currentStep.title}</h1>
                <p className="mt-1 text-gray-500">{currentStep.desc}</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                />
              </div>

              {role === 'player' && (
                <div className="space-y-1">
                  <Label htmlFor="district">Distrito favorito (opcional)</Label>
                  <select
                    id="district"
                    value={data.district}
                    onChange={(e) => setData({ ...data, district: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona un distrito</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {saving ? 'Guardando...' : 'Guardar y continuar'}
              </Button>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-6 text-center">
              <div className="text-5xl">🎉</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentStep.title}</h1>
                <p className="mt-2 text-gray-500">{currentStep.desc}</p>
              </div>
              <Button onClick={handleFinish} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                {role === 'court_owner' ? 'Ir al dashboard' : 'Buscar canchas'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
