import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function Index() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(data?.role ?? null)
      }
    })
  }, [])

  if (session === undefined) return null

  if (!session) return <Redirect href="/(auth)/login" />
  if (role === 'court_owner') return <Redirect href="/(owner)/(tabs)/dashboard" />
  return <Redirect href="/(player)/(tabs)/search" />
}
