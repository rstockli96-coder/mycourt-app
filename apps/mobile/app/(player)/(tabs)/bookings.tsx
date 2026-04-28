import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import type { BookingWithDetails, BookingStatus } from '@mycourt/shared'

const TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'confirmed', label: 'Próximas' },
  { key: 'completed', label: 'Pasadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#16A34A',
  completed: '#3B82F6',
  cancelled: '#EF4444',
  refunded: '#6B7280',
}

const SPORT_EMOJI: Record<string, string> = {
  volleyball: '🏐',
  tennis: '🎾',
  padel: '🏸',
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts!court_id(id, name, sport, address, district, photos),
          player:profiles!player_id(id, full_name, avatar_url)
        `)
        .eq('player_id', user.id)
        .order('start_time', { ascending: false })

      setBookings((data ?? []) as BookingWithDetails[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab)

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#16A34A" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mis reservas</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay reservas aquí</Text>
          </View>
        }
        renderItem={({ item }) => {
          const start = new Date(item.start_time)
          const end = new Date(item.end_time)
          const timeStr = `${start.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
          const dateStr = start.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })

          return (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.sportEmoji}>{SPORT_EMOJI[item.court.sport] ?? '🏟️'}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.courtName}>{item.court.name}</Text>
                <Text style={styles.courtDistrict}>{item.court.district}</Text>
                <Text style={styles.timeText}>📅 {dateStr}</Text>
                <Text style={styles.timeText}>🕐 {timeStr}</Text>
                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.amount}>S/. {item.total_amount}</Text>
                </View>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  tabActive: { backgroundColor: '#16A34A' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 2, gap: 12,
  },
  cardLeft: { justifyContent: 'flex-start', paddingTop: 2 },
  sportEmoji: { fontSize: 28 },
  cardRight: { flex: 1, gap: 2 },
  courtName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  courtDistrict: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  timeText: { fontSize: 13, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  amount: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },
})
