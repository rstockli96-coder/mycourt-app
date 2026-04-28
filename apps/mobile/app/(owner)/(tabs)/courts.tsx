import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Court, CourtStatus } from '@mycourt/shared'

const STATUS_COLORS: Record<CourtStatus, string> = {
  pending: '#F59E0B',
  active: '#16A34A',
  paused: '#6B7280',
  rejected: '#EF4444',
}

const STATUS_LABELS: Record<CourtStatus, string> = {
  pending: 'Pendiente',
  active: 'Activa',
  paused: 'Pausada',
  rejected: 'Rechazada',
}

const SPORT_LABELS: Record<string, string> = {
  volleyball: 'Vóley',
  tennis: 'Tenis',
  padel: 'Pádel',
}

export default function OwnerCourtsScreen() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setCourts((data ?? []) as Court[])
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
    <View style={styles.container}>
      <Text style={styles.heading}>Mis canchas</Text>

      <FlatList
        data={courts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No tienes canchas registradas</Text>
            <Text style={styles.emptyText}>Contacta a soporte para publicar tu primera cancha</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitles}>
                <Text style={styles.courtName}>{item.name}</Text>
                <Text style={styles.courtDistrict}>{item.district}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.sport}>{SPORT_LABELS[item.sport] ?? item.sport}</Text>
              <Text style={styles.price}>S/. {item.price_per_hour}/hr</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', padding: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitles: { flex: 1, marginRight: 10 },
  courtName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  courtDistrict: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sport: { fontSize: 13, color: '#6B7280' },
  price: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 6, paddingHorizontal: 32 },
})
