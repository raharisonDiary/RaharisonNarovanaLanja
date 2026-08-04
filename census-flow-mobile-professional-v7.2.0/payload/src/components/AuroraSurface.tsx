import { useId, type PropsWithChildren, type ReactNode } from 'react'
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg'
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

  return (
    <View style={[styles.background, { backgroundColor: palette.page }, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowBlue,
          { backgroundColor: palette.glowBlue },
          dense && styles.denseBlue,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowPurple,
          { backgroundColor: palette.glowIndigo },
          dense && styles.densePurple,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          styles.glowTeal,
          { backgroundColor: palette.glowTeal },
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

  const gradient =
    variant === 'success'
      ? [palette.accent, palette.success, palette.primary]
      : variant === 'primary'
        ? [palette.primaryHover, palette.primary, palette.secondary]
        : variant === 'hero'
          ? [palette.heroStart, palette.heroMiddle, palette.heroEnd]
          : [palette.primary, palette.secondary, palette.accent]

  return (
    <View
      style={[
        styles.gradientSurface,
        {
          borderRadius: radiusValue,
          backgroundColor: gradient[0],
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.34)',
        },
        surfaceShadow(isDark, 'raised'),
        style,
      ]}
    >
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradient[0]} />
            <Stop offset="55%" stopColor={gradient[1]} />
            <Stop offset="100%" stopColor={gradient[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        {decorative ? (
          <>
            <Circle cx="92%" cy="2%" r="84" fill="rgba(255,255,255,0.08)" />
            <Circle cx="100%" cy="100%" r="72" fill="rgba(45,212,191,0.11)" />
            <Circle cx="0%" cy="100%" r="45" fill="rgba(255,255,255,0.05)" />
          </>
        ) : null}
      </Svg>
      <View style={styles.gradientContent}>{children}</View>
    </View>
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

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        surfaceShadow(isDark),
        style,
      ]}
    >
      {accent ? <View style={styles.cardAccent}>{accent}</View> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowBlue: {
    width: 280,
    height: 280,
    right: -150,
    top: -120,
  },
  denseBlue: {
    width: 360,
    height: 360,
    right: -180,
    top: -160,
  },
  glowPurple: {
    width: 220,
    height: 220,
    left: -135,
    top: 215,
  },
  densePurple: {
    width: 300,
    height: 300,
    left: -175,
    top: 260,
  },
  glowTeal: {
    width: 260,
    height: 260,
    right: -165,
    bottom: -145,
  },
  gradientSurface: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradientContent: {
    position: 'relative',
    zIndex: 1,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
})
