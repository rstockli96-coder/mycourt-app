import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

type Step = 0 | 1 | 2

const PLAYER_STEPS = [
  { title: '¡Bienvenido a MyCourt! 🎾', desc: 'Reserva canchas de vóley, tenis y pádel en Lima.' },
  { title: 'Completa tu perfil', desc: 'Así los admins saben quién reserva.' },
  { title: '¡Todo listo! 🚀', desc: 'Ya puedes buscar y reservar canchas.' },
]

const OWNER_STEPS = [
  { title: '¡Bienvenido, propietario! 🏟️', desc: 'Publica canchas y recibe reservas.' },
  { title: 'Completa tu perfil', desc: 'Los jugadores verán esta info en tus canchas.' },
  { title: '¡Listo para publicar! 🚀', desc: 'Ve al dashboard para agregar tu primera cancha.' },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [role, setRole] = useState<'player' | 'court_owner'>('player')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const steps = role === 'court_owner' ? OWNER_STEPS : PLAYER_STEPS
  const current = steps[step]

  async function handleSaveProfile() {
    if (!fullName) {
      Alert.alert('Error', 'Ingresa tu nombre completo')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil')
      return
    }
    setStep(2)
  }

  function handleFinish() {
    if (role === 'court_owner') {
      router.replace('/(owner)/(tabs)/dashboard')
    } else {
      router.replace('/(player)/(tabs)/search')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>M</Text>
        </View>
        <Text style={styles.logoText}>MyCourt</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive, i === step && styles.dotCurrent]} />
        ))}
      </View>

      {/* Step 0: Welcome + Role */}
      {step === 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardDesc}>{current.desc}</Text>

          <Text style={styles.roleLabel}>¿Cómo usarás MyCourt?</Text>
          {([
            { value: 'player' as const, label: '🎾 Jugador', desc: 'Quiero reservar canchas' },
            { value: 'court_owner' as const, label: '🏟️ Propietario', desc: 'Quiero publicar mi cancha' },
          ]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.roleCard, role === opt.value && styles.roleCardActive]}
              onPress={() => setRole(opt.value)}
            >
              <Text style={[styles.roleCardLabel, role === opt.value && styles.roleCardLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.roleCardDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardDesc}>{current.desc}</Text>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Teléfono (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+51 999 999 999"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Guardar y continuar</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Done */}
      {step === 2 && (
        <View style={[styles.card, styles.cardCenter]}>
          <Text style={styles.celebEmoji}>🎉</Text>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Text style={styles.cardDesc}>{current.desc}</Text>

          <TouchableOpacity style={styles.btn} onPress={handleFinish}>
            <Text style={styles.btnText}>
              {role === 'court_owner' ? 'Ir al dashboard' : 'Buscar canchas'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 24, paddingTop: 60, flexGrow: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  logoLetter: { color: '#fff', fontSize: 22, fontWeight: '700' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#86EFAC' },
  dotCurrent: { width: 20, backgroundColor: '#16A34A' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardCenter: { alignItems: 'center' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' },
  cardDesc: { fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  celebEmoji: { fontSize: 48, marginBottom: 12 },
  roleLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10 },
  roleCard: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, marginBottom: 8,
  },
  roleCardActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  roleCardLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 2 },
  roleCardLabelActive: { color: '#16A34A' },
  roleCardDesc: { fontSize: 12, color: '#9CA3AF' },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 12,
  },
  btn: { backgroundColor: '#16A34A', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
