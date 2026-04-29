'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS = ['Información básica', 'Ubicación y precio', 'Comodidades']

const courtSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  sport: z.enum(['volleyball', 'tennis', 'padel']),
  description: z.string().optional(),
  address: z.string().min(5, 'Ingresa la dirección completa'),
  district: z.string().min(2, 'Selecciona un distrito'),
  price_per_hour: z.number().min(10, 'Mínimo S/. 10').max(500, 'Máximo S/. 500'),
  surface_type: z.enum(['clay', 'grass', 'concrete', 'synthetic', 'carpet']),
  is_indoor: z.boolean(),
  has_parking: z.boolean(),
  has_locker_room: z.boolean(),
})

type CourtForm = z.infer<typeof courtSchema>

const DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina',
  'San Borja', 'Pueblo Libre', 'Jesús María', 'Lince', 'Magdalena',
  'Callao', 'San Miguel', 'Breña', 'Rímac', 'Los Olivos',
]

export default function NewCourtPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CourtForm>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      sport: 'volleyball',
      surface_type: 'synthetic',
      is_indoor: false,
      has_parking: false,
      has_locker_room: false,
    },
  })

  async function onSubmit(data: CourtForm) {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('courts').insert({
      ...data,
      owner_id: user.id,
      lat: -12.046374, // default Lima
      lng: -77.042793,
      photos: [],
      status: 'pending',
    })

    if (insertError) {
      setError('Error al crear la cancha. Intenta de nuevo.')
      setSaving(false)
      return
    }

    router.push('/(owner)/courts')
  }

  const stepFields: Record<number, (keyof CourtForm)[]> = {
    0: ['name', 'sport', 'description'],
    1: ['address', 'district', 'price_per_hour', 'surface_type'],
    2: ['is_indoor', 'has_parking', 'has_locker_room'],
  }

  function canContinue() {
    const fields = stepFields[step]
    return fields.every((f) => {
      const val = watch(f)
      if (typeof val === 'boolean') return true
      return !!val && !errors[f]
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva cancha</h1>
        <p className="mt-1 text-gray-500">Paso {step + 1} de {STEPS.length}: {STEPS[step]}</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-green-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="name">Nombre de la cancha *</Label>
                  <Input id="name" placeholder="Ej: Cancha Los Pinos" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sport">Deporte *</Label>
                  <select
                    id="sport"
                    {...register('sport')}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="volleyball">Vóley</option>
                    <option value="tennis">Tenis</option>
                    <option value="padel">Pádel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Describe tu cancha: instalaciones, estado, etc."
                    {...register('description')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}

            {/* Step 1: Location & Price */}
            {step === 1 && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="address">Dirección completa *</Label>
                  <Input id="address" placeholder="Av. Ejemplo 123" {...register('address')} />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="district">Distrito *</Label>
                  <select
                    id="district"
                    {...register('district')}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona un distrito</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="price_per_hour">Precio por hora (S/.) *</Label>
                  <Input
                    id="price_per_hour"
                    type="number"
                    placeholder="Ej: 60"
                    min={10}
                    max={500}
                    {...register('price_per_hour', { valueAsNumber: true })}
                  />
                  {errors.price_per_hour && <p className="text-sm text-red-500">{errors.price_per_hour.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="surface_type">Tipo de superficie *</Label>
                  <select
                    id="surface_type"
                    {...register('surface_type')}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="synthetic">Grass sintético</option>
                    <option value="clay">Arcilla</option>
                    <option value="grass">Grass natural</option>
                    <option value="concrete">Concreto</option>
                    <option value="carpet">Alfombra</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 2: Amenities */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Selecciona las comodidades que ofrece tu cancha</p>
                {[
                  { id: 'is_indoor', label: '🏠 Cancha cubierta / bajo techo' },
                  { id: 'has_parking', label: '🚗 Estacionamiento disponible' },
                  { id: 'has_locker_room', label: '🚿 Vestuarios / duchas' },
                ].map((amenity) => (
                  <label key={amenity.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      {...register(amenity.id as keyof CourtForm)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                  </label>
                ))}

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => step === 0 ? router.push('/(owner)/courts') : setStep(step - 1)}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Creando cancha...' : 'Crear cancha'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
