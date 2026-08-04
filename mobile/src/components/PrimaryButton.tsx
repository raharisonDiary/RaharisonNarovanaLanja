import type { LucideIcon } from 'lucide-react-native'
import { useEffect, useId, useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { motion, nativeDriver, springTo } from '../animations/motion'
import { radius } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

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
  const { palette, isDark } = useCensusTheme()
  const scale = useRef(new Animated.Value(1)).current
  const sheen = useRef(new Animated.Value(0)).current
  const gradientId = `primary-button-${useId().replace(/[:]/g, '')}`
  const inactive = disabled || loading

  useEffect(() => {
    if (secondary || inactive) return
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(sheen, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: nativeDriver,
        }),
        Animated.delay(2200),
        Animated.timing(sheen, {
          toValue: 0,
          duration: 0,
          useNativeDriver: nativeDriver,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [inactive, secondary, sheen])

  const textColor = secondary ? palette.primaryHover : palette.inverseText
  const sheenX = sheen.interpolate({ inputRange: [0, 1], outputRange: [-110, 420] })

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        disabled={inactive}
        onPress={onPress}
        onPressIn={() => springTo(scale, 0.975)}
        onPressOut={() => springTo(scale, 1)}
        style={[
          styles.button,
          secondary
            ? {
                backgroundColor: palette.surfaceRaised,
                borderColor: palette.primaryBorder,
                borderWidth: 1,
              }
            : surfaceShadow(isDark, 'raised'),
          inactive && styles.disabled,
        ]}
      >
        {!secondary ? (
          <>
            <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={palette.primary} />
                  <Stop offset="58%" stopColor={palette.primaryHover} />
                  <Stop offset="100%" stopColor={palette.secondary} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" rx={radius.md} fill={`url(#${gradientId})`} />
            </Svg>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.sheen,
                { transform: [{ translateX: sheenX }, { rotate: '14deg' }] },
              ]}
            />
          </>
        ) : null}

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <>
              {Icon ? <Icon color={textColor} size={18} strokeWidth={2.4} /> : null}
              <Text style={[styles.text, { color: textColor }]}>{title}</Text>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: { fontWeight: '900', letterSpacing: 0.1 },
  disabled: { opacity: 0.52 },
  sheen: {
    position: 'absolute',
    top: -28,
    bottom: -28,
    width: 54,
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: 1,
  },
})
