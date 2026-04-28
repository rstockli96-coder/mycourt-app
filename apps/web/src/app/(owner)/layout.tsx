import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/shared/Logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/courts', label: 'Mis canchas', icon: '🏟️' },
  { href: '/bookings', label: 'Reservas', icon: '📅' },
]

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'player') redirect('/(player)/search')

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={`/(owner)${link.href}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
