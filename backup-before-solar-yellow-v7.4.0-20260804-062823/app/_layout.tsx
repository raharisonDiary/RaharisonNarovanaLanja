import { Redirect, Stack, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View } from 'react-native'
import { AuthProvider, useAuth } from '../src/auth/AuthContext'
import CensusSidebarShell from '../src/components/CensusSidebar'
import GlobalThemeStyles from '../src/components/GlobalThemeStyles'
import { PreferencesProvider } from '../src/preferences/PreferencesContext'
import { useCensusTheme } from '../src/styles/censusTheme'

const PUBLIC_ROOT_SEGMENTS = new Set([
  'login',
  'forgot-password',
  'confirmation',
])

function Navigator() {
  const segments = useSegments() as unknown as string[]
  const { user, loading } = useAuth()
  const { isDark, palette } = useCensusTheme()

  const firstSegment = segments[0]
  const isLanding = segments.length === 0
  const isPublicRoute = isLanding || (firstSegment ? PUBLIC_ROOT_SEGMENTS.has(firstSegment) : false)
  const isProtectedRoute = !isPublicRoute

  if (loading && isProtectedRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.page,
        }}
      >
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    )
  }

  if (!loading && !user && isProtectedRoute) {
    return <Redirect href="/login" />
  }

  const navigator = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.page },
        animation: 'fade_from_bottom',
        animationDuration: 180,
      }}
    />
  )

  return (
    <>
      <GlobalThemeStyles />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {user && isProtectedRoute ? (
        <CensusSidebarShell>{navigator}</CensusSidebarShell>
      ) : (
        navigator
      )}
    </>
  )
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </PreferencesProvider>
  )
}
