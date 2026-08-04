import type { LucideIcon } from 'lucide-react-native'
import { StyleSheet, Text, View, type ColorValue } from 'react-native'
import { colors, radius, softShadow } from '../styles/theme'

export default function MetricCard({
  label,
  value,
  icon: Icon,
  tone = colors.primary,
  softTone = colors.primarySoft,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: string
  softTone?: ColorValue
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.glow, { backgroundColor: softTone }]} />
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: softTone }]}>
          <Icon color={tone} size={20} />
        </View>
        <View style={[styles.dot, { backgroundColor: tone }]} />
      </View>
      <Text style={styles.value}>
        {typeof value === 'number'
          ? new Intl.NumberFormat('fr-FR').format(value)
          : value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '48%',
    minHeight: 124,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 15,
    ...softShadow,
  },
  glow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 999,
    right: -35,
    top: -30,
    opacity: 0.62,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  value: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
  },
  label: { fontSize: 11, color: colors.muted, marginTop: 3, fontWeight: '700' },
})
