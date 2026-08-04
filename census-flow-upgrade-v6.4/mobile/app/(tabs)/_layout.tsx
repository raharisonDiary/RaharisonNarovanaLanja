import { Redirect, Tabs } from 'expo-router'
import { Home, Map, Menu, RefreshCw, UsersRound } from 'lucide-react-native'
import { ActivityIndicator, Platform, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthContext'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import { colors, radius, softShadow } from '../../src/styles/theme'

export default function TabsLayout() {
  const { user, loading } = useAuth()
  const { t } = usePreferences()

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.OS === 'ios' ? 22 : 12,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.white,
          ...softShadow,
        },
        tabBarItemStyle: { borderRadius: radius.md },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '900' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Home color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="households"
        options={{
          title: t('households'),
          tabBarIcon: ({ color }) => <UsersRound color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('map'),
          tabBarIcon: ({ color }) => <Map color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: t('sync'),
          tabBarIcon: ({ color }) => <RefreshCw color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Menu color={color} size={21} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}
