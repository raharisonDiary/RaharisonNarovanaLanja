import type { LucideIcon } from 'lucide-react-native'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { colors, floatingShadow, radius } from '../styles/theme'

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  secondary = false,
}: {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  icon?: LucideIcon
  secondary?: boolean
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        !secondary && styles.primaryShadow,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {!secondary ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="buttonGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#2563EB" />
              <Stop offset="0.68" stopColor="#4F46E5" />
              <Stop offset="1" stopColor="#6366F1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={radius.md} fill="url(#buttonGradient)" />
        </Svg>
      ) : null}
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : '#FFFFFF'} />
      ) : (
        <>
          {Icon ? (
            <Icon
              color={secondary ? colors.primary : '#FFFFFF'}
              size={18}
            />
          ) : null}
          <Text style={[styles.text, secondary && styles.secondaryText]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  primaryShadow: { ...floatingShadow },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.1 },
  secondaryText: { color: colors.primary },
  disabled: { opacity: 0.52 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.94 },
})
