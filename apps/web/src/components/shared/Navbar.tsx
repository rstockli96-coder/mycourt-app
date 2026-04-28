'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from './Logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  userFullName?: string | null
  userAvatarUrl?: string | null
  role?: 'player' | 'court_owner' | 'super_admin'
}

export function Navbar({ userFullName, userAvatarUrl, role = 'player' }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userFullName
    ? userFullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const playerLinks = [
    { href: '/(player)/search', label: 'Buscar canchas' },
    { href: '/(player)/bookings', label: 'Mis reservas' },
  ]

  const ownerLinks = [
    { href: '/(owner)/dashboard', label: 'Dashboard' },
    { href: '/(owner)/courts', label: 'Mis canchas' },
  ]

  const links = role === 'court_owner' ? ownerLinks : playerLinks

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={userAvatarUrl ?? undefined} />
            <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-gray-700 md:block">{userFullName ?? 'Usuario'}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}
