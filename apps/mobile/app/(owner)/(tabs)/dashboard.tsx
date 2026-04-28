import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

interface Metric {
  label: string
  value: string | number
  icon: string
  color: string
}

export default function OwnerDashboardScreen() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [recentBookings, setRecentBookings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [courtsRes, bookingsRes] = await Promise.all([
        supabase.from('courts').select('id, status').eq('owner_id', user.id),
        supabase
          .from('bookings')
          .select('id, status, net_amount, created_at, court:courts!court_id(owner_id)')
          .eq('court.owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const courts = courtsRes.data ?? []
      const bookings = bookingsRes.data ?? []

      const activeCourts = courts.filter((c) => c.status === 'active').length
      const totalRevenue = bookings
        .filter((b) => b.status === 'completed')
        .reduce((s, b) => s + ((b.net_amount as number) ?? 0), 0)

      setMetrics([
        { label: 'Canchas activas', value: activeCourts, icon: '🏟️', color: '#16A34A' },
        { label: 'Reservas', value: bookings.length, icon: '📅', color: '#3B82F6' },
        { label: 'Ingresos (S/.)', value: totalRevenue.toFixed(0), icon: '💰', color: '#7C3AED' },
      ])
      setRecentBookings(bookings)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#16A34A" size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={styles.heading}>Dashboard</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(owner)/(tabs)/courts')}
        >
          <Text style={styles.addBtnText}>+ Cancha</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        {metrics.map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricIcon}>{m.icon}</Text>
            <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservas recientes</Text>
        {recentBookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aún no tienes reservas</Text>
          </View>
        ) : (
          recentBookings.map((b) => (
            <View key={b.id as string} style={styles.bookingRow}>
              <View>
                <Text style={styles.bookingId}>Reserva #{(b.id as string).slice(0, 8)}</Text>
                <Text style={styles.bookingDate}>
                  {new Date(b.created_at as string).toLocaleDateString('es-PE')}
                </Text>
              </View>
              <Text style={styles.bookingAmount}>S/. {b.net_amount as number ?? 0}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827' },
  addBtn: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  metricIcon: { fontSize: 22, marginBottom: 6 },
  metricValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  metricLabel: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  bookingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  bookingId: { fontSize: 14, fontWeight: '500', color: '#374151' },
  bookingDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  bookingAmount: { fontSize: 15, fontWeight: '700', color: '#16A34A' },
})
