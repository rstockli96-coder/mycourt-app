import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

const SPORT_LABELS: Record<string, string> = {
  volleyball: 'Vóley',
  tennis: 'Tenis',
  padel: 'Pádel',
}

const SURFACE_LABELS: Record<string, string> = {
  clay: 'Arcilla',
  grass: 'Grass natural',
  concrete: 'Concreto',
  synthetic: 'Grass sintético',
  carpet: 'Alfombra',
}

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [court, setCourt] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('courts')
        .select(`
          *,
          owner:profiles!owner_id(id, full_name),
          reviews(rating, comment, player:profiles!player_id(full_name))
        `)
        .eq('id', id)
        .single()

      setCourt(data)
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#16A34A" size="large" />
      </View>
    )
  }

  if (!court) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Cancha no encontrada</Text>
      </View>
    )
  }

  const reviews = (court.reviews as { rating: number; comment: string; player: { full_name: string } }[]) ?? []
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null
  const photos = (court.photos as string[]) ?? []

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Header photo */}
        {photos[0] ? (
          <Image source={{ uri: photos[0] }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoEmoji}>🏟️</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.courtName}>{court.name as string}</Text>
              <Text style={styles.district}>📍 {court.district as string}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.price}>S/. {court.price_per_hour as number}</Text>
              <Text style={styles.priceLabel}>por hora</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportText}>{SPORT_LABELS[court.sport as string] ?? court.sport as string}</Text>
            </View>
            {avgRating && (
              <Text style={styles.rating}>⭐ {avgRating.toFixed(1)} ({reviews.length})</Text>
            )}
          </View>

          {/* Description */}
          {court.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{court.description as string}</Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.features}>
              <Text style={styles.feature}>🏟️ {SURFACE_LABELS[court.surface_type as string] ?? court.surface_type as string}</Text>
              {court.is_indoor && <Text style={styles.feature}>🏠 Cubierta</Text>}
              {court.has_parking && <Text style={styles.feature}>🚗 Estacionamiento</Text>}
              {court.has_locker_room && <Text style={styles.feature}>🚿 Vestuarios</Text>}
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reseñas ({reviews.length})</Text>
              {reviews.slice(0, 3).map((review, i) => (
                <View key={i} style={styles.review}>
                  <Text style={styles.reviewAuthor}>{review.player?.full_name ?? 'Jugador'}</Text>
                  <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <View>
          <Text style={styles.ctaPrice}>S/. {court.price_per_hour as number}/hr</Text>
        </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => Alert.alert('Próximamente', 'Reserva disponible en la siguiente versión')}
        >
          <Text style={styles.ctaBtnText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#6B7280' },
  inner: { paddingBottom: 100 },
  photo: { width: '100%', height: 220 },
  photoPlaceholder: { width: '100%', height: 180, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 48 },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleLeft: { flex: 1, marginRight: 12 },
  courtName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  district: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  priceBadge: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '700', color: '#16A34A' },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sportBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sportText: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  rating: { fontSize: 13, color: '#6B7280' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feature: { fontSize: 13, color: '#374151' },
  review: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reviewAuthor: { fontSize: 13, fontWeight: '600', color: '#374151' },
  reviewRating: { fontSize: 13, color: '#F59E0B', marginVertical: 2 },
  reviewComment: { fontSize: 13, color: '#6B7280' },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  ctaPrice: { fontSize: 18, fontWeight: '700', color: '#16A34A' },
  ctaBtn: {
    backgroundColor: '#16A34A', borderRadius: 10,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
