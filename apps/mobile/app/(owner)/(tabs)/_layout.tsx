import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function OwnerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, opacity: color === '#16A34A' ? 1 : 0.5 }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: 'Mis canchas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, opacity: color === '#16A34A' ? 1 : 0.5 }}>🏟️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, opacity: color === '#16A34A' ? 1 : 0.5 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  )
}
