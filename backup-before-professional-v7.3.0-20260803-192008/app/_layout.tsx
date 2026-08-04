import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../src/auth/AuthContext'
import GlobalThemeStyles from '../src/components/GlobalThemeStyles'
import { PreferencesProvider, usePreferences } from '../src/preferences/PreferencesContext'

function Navigator() {
  const { isDark } = usePreferences()
  return (
    <>
      <GlobalThemeStyles />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? '#07111F' : '#F4F7FB' }, animation: 'slide_from_right', animationDuration: 220 }} />
    </>
  )
}

export default function RootLayout() {
  return <PreferencesProvider><AuthProvider><Navigator /></AuthProvider></PreferencesProvider>
}
