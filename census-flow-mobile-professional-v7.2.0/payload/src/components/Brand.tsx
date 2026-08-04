import { BarChart3, UsersRound } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { radius } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

export default function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  const { palette, isDark } = useCensusTheme()
  const markSize = compact ? 40 : 48
  return (
    <View style={styles.container}>
      <View style={[styles.mark, { width: markSize, height: markSize, borderRadius: compact ? 13 : 16 }, surfaceShadow(isDark)]}>
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%"><Defs><LinearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor="#2457D6" /><Stop offset="58%" stopColor="#615AD9" /><Stop offset="100%" stopColor="#0E9F8F" /></LinearGradient></Defs><Rect width="100%" height="100%" rx={compact ? 13 : 16} fill="url(#brandGradient)" /></Svg>
        <UsersRound color="#FFFFFF" size={compact ? 20 : 23} />
        <View style={[styles.chartDot, { backgroundColor: palette.accent }]}><BarChart3 color="#FFFFFF" size={compact ? 8 : 9} /></View>
      </View>
      {!compact ? <View><Text style={[styles.title, { color: inverse ? '#FFFFFF' : palette.text }]}>Census Flow</Text><Text style={[styles.subtitle, { color: inverse ? '#C9D8ED' : palette.textMuted }]}>Compter · Comprendre · Planifier</Text></View> : null}
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mark: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  chartDot: { position: 'absolute', right: 4, bottom: 4, width: 15, height: 15, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFFFFF' },
  title: { fontWeight: '900', fontSize: 17, letterSpacing: -0.35 },
  subtitle: { fontSize: 9, marginTop: 1 },
})
