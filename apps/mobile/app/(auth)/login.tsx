import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      Alert.alert('Error', 'Email o contraseña incorrectos')
      return
    }
    router.replace('/')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>MyCourt</Text>
        <Text style={styles.subtitle}>Canchas deportivas en Lima</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: '#16a34a',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, padding: 12, fontSize: 16,
    backgroundColor: '#fff', marginBottom: 12,
  },
  button: {
    backgroundColor: '#16a34a', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#86efac' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  linkHighlight: { color: '#16a34a', fontWeight: '600' },
})
