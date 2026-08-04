import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { radius } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, icon: Icon, secondary = false }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: LucideIcon; secondary?: boolean }) {
  const { palette, isDark } = useCensusTheme()
  return (
    <Pressable disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [
      styles.button,
      secondary ? { backgroundColor: palette.surfaceRaised, borderColor: palette.primaryBorder, borderWidth: 1 } : surfaceShadow(isDark, 'raised'),
      (disabled || loading) && styles.disabled,
      pressed && styles.pressed,
    ]}>
      {!secondary ? (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs><LinearGradient id="primaryButtonGradient" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0%" stopColor={palette.primaryHover} /><Stop offset="60%" stopColor={palette.primary} /><Stop offset="100%" stopColor={palette.secondary} /></LinearGradient></Defs>
          <Rect width="100%" height="100%" rx={radius.md} fill="url(#primaryButtonGradient)" />
        </Svg>
      ) : null}
      {loading ? <ActivityIndicator color={secondary ? palette.primary : '#FFFFFF'} /> : <>
        {Icon ? <Icon color={secondary ? palette.primary : '#FFFFFF'} size={18} /> : null}
        <Text style={[styles.text, { color: secondary ? palette.primary : '#FFFFFF' }]}>{title}</Text>
      </>}
    </Pressable>
  )
}
const styles = StyleSheet.create({
  button: { position: 'relative', overflow: 'hidden', minHeight: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18 },
  text: { fontWeight: '900', letterSpacing: 0.1 },
  disabled: { opacity: 0.52 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.94 },
})
