import { CheckCircle2, Clock3, CircleAlert } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { radius } from '../styles/theme'
import { useCensusTheme } from '../styles/censusTheme'

export default function StatusPill({ value }: { value: string }) {
  const { palette } = useCensusTheme()
  const lower = value.toLowerCase()
  const positive = lower.includes('valid') || lower.includes('active') || lower.includes('termin') || lower.includes('success')
  const negative = lower.includes('reject') || lower.includes('erreur')
  const pending = lower.includes('submit') || lower.includes('attente') || lower.includes('pending')
  const tone = positive ? { bg: palette.successSoft, fg: palette.success, Icon: CheckCircle2 } : negative ? { bg: palette.dangerSoft, fg: palette.danger, Icon: CircleAlert } : pending ? { bg: palette.warningSoft, fg: palette.warning, Icon: Clock3 } : { bg: palette.primarySoft, fg: palette.primary, Icon: Clock3 }
  const ToneIcon = tone.Icon
  return <View style={[styles.pill, { backgroundColor: tone.bg }]}><ToneIcon color={tone.fg} size={11} /><Text style={[styles.text, { color: tone.fg }]}>{value}</Text></View>
}
const styles = StyleSheet.create({ pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 }, text: { fontSize: 10, fontWeight: '900' } })
