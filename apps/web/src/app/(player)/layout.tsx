import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'court_owner') redirect('/(owner)/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userFullName={profile?.full_name}
        userAvatarUrl={profile?.avatar_url}
        role="player"
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
