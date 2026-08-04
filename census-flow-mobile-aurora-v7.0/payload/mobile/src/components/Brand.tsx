import { BarChart3, UsersRound } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { colors, radius, softShadow } from '../styles/theme'

export default function Brand({ compact = false }: { compact?: boolean }) {
  const markSize = compact ? 40 : 48
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mark,
          {
            width: markSize,
            height: markSize,
            borderRadius: compact ? 13 : 16,
          },
        ]}
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2563EB" />
              <Stop offset="0.58" stopColor="#6366F1" />
              <Stop offset="1" stopColor="#14B8A6" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={compact ? 13 : 16} fill="url(#brandGradient)" />
        </Svg>
        <UsersRound color="#FFFFFF" size={compact ? 20 : 23} />
        <View style={styles.chartDot}>
          <BarChart3 color="#FFFFFF" size={compact ? 8 : 9} />
        </View>
      </View>
      {!compact ? (
        <View>
          <Text style={styles.title}>Census Flow</Text>
          <Text style={styles.subtitle}>Compter · Comprendre · Planifier</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mark: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  chartDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 15,
    height: 15,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  title: {
    fontWeight: '900',
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.35,
  },
  subtitle: { fontSize: 9, color: colors.muted, marginTop: 1 },
})
