import { useEffect, useId, useRef, type PropsWithChildren, type ReactNode } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { floatingLoop, runFadeUp } from '../animations/motion'
import { radius } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

export function AuroraBackground({
  children,
  style,
  dense = false,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  dense?: boolean
}>) {
  const { palette } = useCensusTheme()
  const floatA = useRef(new Animated.Value(0)).current
  const floatB = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const a = floatingLoop(floatA, 14, 5600)
    const b = floatingLoop(floatB, -10, 6800)
    a.start()
    b.start()
    return () => {
      a.stop()
      b.stop()
    }
  }, [floatA, floatB])

  return (
    <View style={[styles.background, { backgroundColor: palette.page }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowBlue,
          { backgroundColor: palette.glowBlue, transform: [{ translateY: floatA }] },
          dense && styles.denseBlue,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowPurple,
          { backgroundColor: palette.glowIndigo, transform: [{ translateY: floatB }] },
          dense && styles.densePurple,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowTeal,
          { backgroundColor: palette.glowTeal, transform: [{ translateY: floatA }] },
        ]}
      />
      {children}
    </View>
  )
}

export function GradientSurface({
  children,
  style,
  variant = 'aurora',
  radiusValue = radius.xl,
  decorative = true,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  variant?: 'aurora' | 'primary' | 'hero' | 'success'
  radiusValue?: number
  decorative?: boolean
}>) {
  const { palette, isDark } = useCensusTheme()
  const rawId = useId().replace(/[:]/g, '')
  const gradientId = `census-gradient-${variant}-${rawId}`
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current

  useEffect(() => runFadeUp(opacity, translateY), [opacity, translateY])

  const gradient =
    variant === 'success'
      ? [palette.success, '#059669', '#059669']
      : variant === 'primary'
        ? [palette.primary, palette.primary, palette.primaryHover]
        : variant === 'hero'
          ? [palette.heroStart, palette.heroMiddle, palette.heroEnd]
          : [palette.heroStart, palette.heroMiddle, palette.heroEnd]

  return (
    <Animated.View
      style={[
        styles.gradientSurface,
        {
          borderRadius: radiusValue,
          backgroundColor: gradient[0],
          borderColor: isDark ? 'rgba(130,195,241,0.22)' : 'rgba(184,221,251,0.82)',
          opacity,
          transform: [{ translateY }],
        },
        surfaceShadow(isDark, 'raised'),
        style,
        Platform.OS === 'web' && (variant === 'hero' || variant === 'primary')
          ? styles.webCompactGradient
          : null,
      ]}
    >
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradient[0]} />
            <Stop offset="58%" stopColor={gradient[1]} />
            <Stop offset="100%" stopColor={gradient[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        {decorative && Platform.OS !== 'web' ? (
          <>
            <Circle cx="92%" cy="2%" r="84" fill="rgba(255,255,255,0.12)" />
            <Circle cx="100%" cy="100%" r="72" fill={palette.glowIndigo} />
            <Circle cx="0%" cy="100%" r="45" fill="rgba(255,255,255,0.05)" />
          </>
        ) : null}
      </Svg>
      <View style={styles.gradientContent}>{children}</View>
    </Animated.View>
  )
}

export function AuroraCard({
  children,
  style,
  accent,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  accent?: ReactNode
}>) {
  const { palette, isDark } = useCensusTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(10)).current

  useEffect(() => runFadeUp(opacity, translateY, 35), [opacity, translateY])

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity,
          transform: [{ translateY }],
        },
        surfaceShadow(isDark),
        style,
      ]}
    >
      {accent ? <View style={styles.cardAccent}>{accent}</View> : null}
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  background: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', borderRadius: 999 },
  glowBlue: { width: 280, height: 280, right: -150, top: -120 },
  denseBlue: { width: 360, height: 360, right: -180, top: -160 },
  glowPurple: { width: 220, height: 220, left: -135, top: 215 },
  densePurple: { width: 300, height: 300, left: -175, top: 260 },
  glowTeal: { width: 260, height: 260, right: -165, bottom: -145 },
  gradientSurface: { position: 'relative', overflow: 'hidden', borderWidth: 1 },
  webCompactGradient: {
    minHeight: 0,
    maxHeight: 170,
  },
  gradientContent: { position: 'relative', zIndex: 1 },
  card: { position: 'relative', overflow: 'hidden', borderWidth: 1, borderRadius: radius.lg },
  cardAccent: { position: 'absolute', left: 0, right: 0, top: 0 },
})
