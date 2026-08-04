import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useCensusTheme } from '../styles/censusTheme'

export default function ScreenHeader({ title, subtitle, right, eyebrow }: { title: string; subtitle?: string; right?: ReactNode; eyebrow?: string }) {
  const { palette } = useCensusTheme()
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: palette.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  )
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  text: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.25, textTransform: 'uppercase', marginBottom: 5 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '900', letterSpacing: -0.7 },
  subtitle: { fontSize: 13, marginTop: 5, lineHeight: 19 },
})
