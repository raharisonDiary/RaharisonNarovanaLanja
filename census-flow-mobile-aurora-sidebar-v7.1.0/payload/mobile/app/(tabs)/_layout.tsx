import { Redirect, Slot } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthContext'
import CensusSidebarShell, { useResolvedCensusTheme } from '../../src/components/CensusSidebar'

function AuthenticatedShell() {
  const { user, loading } = useAuth()
  const { palette } = useResolvedCensusTheme()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.page }}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />

  return (
    <CensusSidebarShell>
      <Slot />
    </CensusSidebarShell>
  )
}

export default function TabsLayout() {
  return <AuthenticatedShell />
}
