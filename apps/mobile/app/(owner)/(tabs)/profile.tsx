import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@mycourt/shared'

export default function OwnerProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id)
    setSaving(false)
    Alert.alert(error ? 'Error' : 'Listo', error ? 'No se pudo actualizar' : 'Perfil actualizado')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/(auth)/login')
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#16A34A" size="large" /></View>
  }

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName || 'Administrador'}</Text>
        <Text style={styles.role}>Propietario de canchas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información personal</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Tu nombre completo"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+51 999 999 999"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  inner: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 12,
  },
  saveBtn: { backgroundColor: '#16A34A', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logoutBtn: { borderWidth: 1, borderColor: '#EF4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
})
