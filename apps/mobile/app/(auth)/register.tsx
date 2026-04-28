import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

type Role = 'player' | 'court_owner'

export default function RegisterScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('player')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert(
      '¡Registro exitoso!',
      'Revisa tu email para verificar tu cuenta',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a MyCourt — canchas en Lima</Text>

        {/* Role selector */}
        <Text style={styles.label}>Soy...</Text>
        <View style={styles.roleRow}>
          {([
            { value: 'player', label: '🎾 Jugador', desc: 'Quiero reservar canchas' },
            { value: 'court_owner', label: '🏟️ Propietario', desc: 'Quiero publicar mi cancha' },
          ] as { value: Role; label: string; desc: string }[]).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.roleCard, role === opt.value && styles.roleCardActive]}
              onPress={() => setRole(opt.value)}
            >
              <Text style={[styles.roleLabel, role === opt.value && styles.roleLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.roleDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 24, paddingTop: 60 },
  logo: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 10,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleCard: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, backgroundColor: '#fff',
  },
  roleCardActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  roleLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 2 },
  roleLabelActive: { color: '#16A34A' },
  roleDesc: { fontSize: 11, color: '#9CA3AF' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15,
    color: '#111827', backgroundColor: '#fff', marginBottom: 12,
  },
  btn: {
    backgroundColor: '#16A34A', borderRadius: 8,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6B7280' },
  link: { color: '#16A34A', fontWeight: '600' },
})
