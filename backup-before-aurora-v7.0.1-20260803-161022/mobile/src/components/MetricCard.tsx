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
      <View style={[styles.accent, { backgroundColor: tone }]} />
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {typeof value === 'number'
            ? new Intl.NumberFormat('fr-FR').format(value)
            : value}
        </Text>
      </View>
      <View style={[styles.icon, { backgroundColor: softTone }]}>
        <Icon color={tone} size={21} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '48%',
    minHeight: 112,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    ...softShadow,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  copy: { flex: 1, paddingRight: 8 },
  label: { fontSize: 12, color: colors.muted },
  value: {
    fontSize: 25,
    fontWeight: '900',
    color: colors.text,
    marginTop: 9,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
