import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-5xl">📧</div>
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>
            Te enviamos un enlace de verificación. Haz clic en el enlace para activar tu cuenta MyCourt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            ¿No recibiste el email? Revisa tu carpeta de spam o escríbenos a{' '}
            <a href="mailto:hola@mycourt.pe" className="text-green-600 underline">
              hola@mycourt.pe
            </a>
          </p>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}>
            Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
