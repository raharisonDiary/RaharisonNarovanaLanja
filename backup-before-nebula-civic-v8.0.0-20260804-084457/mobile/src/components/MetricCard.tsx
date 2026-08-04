import type { LucideIcon } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, type ColorValue } from 'react-native'
import { runFadeUp } from '../animations/motion'
import { radius } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

export default function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  softTone,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: string
  softTone?: ColorValue
}) {
  const { palette, isDark } = useCensusTheme()
  const resolvedTone = tone ?? palette.primaryHover
  const resolvedSoftTone = softTone ?? palette.primarySoft
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(12)).current

  useEffect(() => runFadeUp(opacity, translateY, 70), [opacity, translateY])

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
      ]}
    >
      <View style={[styles.glow, { backgroundColor: resolvedSoftTone }]} />
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: resolvedSoftTone }]}>
          <Icon color={resolvedTone} size={20} />
        </View>
        <View style={[styles.dot, { backgroundColor: resolvedTone }]} />
      </View>
      <Text style={[styles.value, { color: palette.text }]}>
        {typeof value === 'number' ? new Intl.NumberFormat('fr-FR').format(value) : value}
      </Text>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '48%',
    minHeight: 126,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 15,
  },
  glow: { position: 'absolute', width: 88, height: 88, borderRadius: 999, right: -35, top: -30, opacity: 0.52 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 999 },
  value: { fontSize: 25, lineHeight: 30, fontWeight: '900', marginTop: 12 },
  label: { fontSize: 11, marginTop: 3, fontWeight: '700' },
})
