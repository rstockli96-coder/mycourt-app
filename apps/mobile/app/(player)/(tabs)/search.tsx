import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { SPORTS, LIMA_DISTRICTS } from '@mycourt/shared'
import type { CourtWithRating } from '@mycourt/shared'

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [courts, setCourts] = useState<CourtWithRating[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    setLoading(true)
    const { data } = await supabase
      .from('courts_with_rating')
      .select('*')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .limit(20)

    setCourts((data as CourtWithRating[]) ?? [])
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Canchas</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  Cancha, deporte o distrito..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={search}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={courts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Busca canchas de vóley, tenis o pádel en Lima</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courtCard}
            onPress={() => router.push(`/court/${item.id}`)}
          >
            <View style={styles.courtInfo}>
              <Text style={styles.courtName}>{item.name}</Text>
              <Text style={styles.courtMeta}>
                {SPORTS.find((s) => s.value === item.sport)?.label} • {item.district}
              </Text>
              <View style={styles.courtFooter}>
                <Text style={styles.courtPrice}>S/. {item.price_per_hour}/hora</Text>
                {item.avg_rating && (
                  <Text style={styles.courtRating}>⭐ {item.avg_rating} ({item.review_count})</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#f9fafb',
  },
  searchBtn: {
    backgroundColor: '#16a34a', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', textAlign: 'center', fontSize: 14 },
  courtCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#e5e7eb',
  },
  courtInfo: { gap: 4 },
  courtName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  courtMeta: { fontSize: 13, color: '#6b7280' },
  courtFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  courtPrice: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  courtRating: { fontSize: 13, color: '#6b7280' },
})
