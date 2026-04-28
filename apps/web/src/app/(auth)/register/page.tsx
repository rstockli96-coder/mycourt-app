'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserRole } from '@mycourt/shared'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['player', 'court_owner'] as const),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('player')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'player' },
  })

  function selectRole(role: 'player' | 'court_owner') {
    setSelectedRole(role)
    setValue('role', role)
  }

  async function onSubmit(data: RegisterForm) {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/verify-email')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <CardTitle className="text-2xl">Crear cuenta en MyCourt</CardTitle>
          <CardDescription>Únete a la plataforma de canchas deportivas en Lima</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selector */}
            <div className="space-y-2">
              <Label>¿Cómo quieres usar MyCourt?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectRole('player')}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    selectedRole === 'player'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl">🏐</div>
                  <div className="mt-1 font-medium text-sm">Soy Jugador</div>
                  <div className="text-xs text-gray-500">Busco y reservo canchas</div>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('court_owner')}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    selectedRole === 'court_owner'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl">🏟️</div>
                  <div className="mt-1 font-medium text-sm">Tengo Canchas</div>
                  <div className="text-xs text-gray-500">Administro mis canchas</div>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                placeholder="Juan Pérez García"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </Button>

            <p className="text-center text-xs text-gray-500">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terms" className="underline">Términos de servicio</Link>
              {' '}y{' '}
              <Link href="/privacy" className="underline">Política de privacidad</Link>
            </p>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="ml-1 font-medium text-green-600 hover:underline">
            Inicia sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
