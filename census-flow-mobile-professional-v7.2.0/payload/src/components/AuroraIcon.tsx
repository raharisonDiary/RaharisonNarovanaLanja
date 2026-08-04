import type { LucideIcon } from 'lucide-react-native'
import { StyleSheet, View, type ColorValue } from 'react-native'
import { radius } from '../styles/theme'
import { useCensusTheme } from '../styles/censusTheme'

export default function AuroraIcon({ icon: Icon, size = 44, color, backgroundColor }: { icon: LucideIcon; size?: number; color?: string; backgroundColor?: ColorValue }) {
  const { palette } = useCensusTheme()
  const resolvedColor = color ?? palette.primary
  const resolvedBackground = backgroundColor ?? palette.primarySoft
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: Math.max(radius.sm, Math.round(size * 0.32)), backgroundColor: resolvedBackground, borderColor: palette.primaryBorder }]}>
      <Icon color={resolvedColor} size={Math.round(size * 0.46)} />
    </View>
  )
}
const styles = StyleSheet.create({ icon: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 } })
