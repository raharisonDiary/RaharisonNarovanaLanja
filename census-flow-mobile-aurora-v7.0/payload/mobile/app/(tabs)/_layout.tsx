import { Redirect, Tabs } from 'expo-router'
import {
  Home,
  MapPinned,
  Menu,
  RefreshCw,
  UsersRound,
} from 'lucide-react-native'
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthContext'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
} from '../../src/styles/theme'

export default function TabsLayout() {
  const { user, loading } = useAuth()
  const { t } = usePreferences()

  if (loading) {
    return (
      <View style={styles.loading}>
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
        tabBarActiveBackgroundColor: colors.primarySoft,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.OS === 'ios' ? 22 : 12,
          height: 76,
          paddingHorizontal: 7,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          backgroundColor: colors.white,
          ...floatingShadow,
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
          marginHorizontal: 2,
          paddingVertical: 3,
        },
        tabBarIconStyle: { marginTop: 1 },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          marginBottom: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Home color={color} size={focused ? 20 : 19} strokeWidth={focused ? 2.7 : 2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="households"
        options={{
          title: t('households'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <UsersRound color={color} size={focused ? 20 : 19} strokeWidth={focused ? 2.7 : 2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('map'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MapPinned color={color} size={focused ? 20 : 19} strokeWidth={focused ? 2.7 : 2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: t('sync'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <RefreshCw color={color} size={focused ? 20 : 19} strokeWidth={focused ? 2.7 : 2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Menu color={color} size={focused ? 20 : 19} strokeWidth={focused ? 2.7 : 2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconShell: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    transform: [{ translateY: -1 }],
  },
})
