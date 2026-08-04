import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../src/auth/AuthContext'
import { PreferencesProvider } from '../src/preferences/PreferencesContext'
import { colors } from '../src/styles/theme'

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
            animationDuration: 220,
          }}
        />
      </AuthProvider>
    </PreferencesProvider>
  )
}
