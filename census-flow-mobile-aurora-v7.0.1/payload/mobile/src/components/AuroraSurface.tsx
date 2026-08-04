import type { PropsWithChildren, ReactNode } from 'react'
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
import { colors, gradients, radius } from '../styles/theme'

export function AuroraBackground({
  children,
  style,
  dense = false,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  dense?: boolean
}>) {
  return (
    <View style={[styles.background, style]}>
      <View style={[styles.glow, styles.glowBlue, dense && styles.denseBlue]} />
      <View style={[styles.glow, styles.glowPurple, dense && styles.densePurple]} />
      <View style={[styles.glow, styles.glowTeal]} />
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
  const palette = gradients[variant]
  const first = palette[0]
  const middle = palette.length > 2 ? palette[1] : palette[0]
  const last = palette[palette.length - 1]

  return (
    <View
      style={[
        styles.gradientSurface,
        { borderRadius: radiusValue },
        style,
      ]}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={`aurora-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={first} />
            <Stop offset="0.56" stopColor={middle} />
            <Stop offset="1" stopColor={last} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#aurora-${variant})`} />
        {decorative ? (
          <>
            <Circle cx="89%" cy="4%" r="90" fill="rgba(255,255,255,.12)" />
            <Circle cx="98%" cy="94%" r="76" fill="rgba(20,184,166,.20)" />
            <Circle cx="4%" cy="94%" r="46" fill="rgba(255,255,255,.08)" />
          </>
        ) : null}
      </Svg>
      {children}
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
  return (
    <View style={[styles.card, style]}>
      {accent ? <View style={styles.cardAccent}>{accent}</View> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowBlue: {
    width: 280,
    height: 280,
    right: -140,
    top: -100,
    backgroundColor: colors.overlayBlue,
  },
  denseBlue: {
    width: 360,
    height: 360,
    right: -170,
    top: -140,
  },
  glowPurple: {
    width: 220,
    height: 220,
    left: -120,
    top: 210,
    backgroundColor: colors.overlayIndigo,
  },
  densePurple: {
    width: 300,
    height: 300,
    left: -160,
    top: 250,
  },
  glowTeal: {
    width: 260,
    height: 260,
    right: -150,
    bottom: -130,
    backgroundColor: colors.overlayTeal,
  },
  gradientSurface: {
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
})
