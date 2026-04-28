import { Tabs } from 'expo-router'

export default function PlayerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Mis Reservas',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 20, opacity: color === '#16a34a' ? 1 : 0.5 }}>{emoji}</Text>
}
