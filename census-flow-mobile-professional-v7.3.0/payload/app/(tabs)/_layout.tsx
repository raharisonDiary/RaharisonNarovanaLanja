import { Redirect, Slot } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthContext'
import { useCensusTheme } from '../../src/styles/censusTheme'

export default function TabsLayout() {
  const { user, loading } = useAuth()
  const { palette } = useCensusTheme()

  if (loading) {
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

  if (!user) return <Redirect href="/login" />

  return <Slot />
}
