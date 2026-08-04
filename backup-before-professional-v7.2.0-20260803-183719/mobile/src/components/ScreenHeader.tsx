import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/theme'

export default function ScreenHeader({
  title,
  subtitle,
  right,
  eyebrow,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  eyebrow?: string
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.65,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 19,
  },
})
