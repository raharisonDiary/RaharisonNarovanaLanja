import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useCensusTheme } from '../styles/censusTheme'

export default function ProgressRing({ value, size = 88, strokeWidth = 9, label = 'Terminé' }: { value: number; size?: number; strokeWidth?: number; label?: string }) {
  const { palette } = useCensusTheme()
  const safeValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (safeValue / 100) * circumference
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={palette.primarySoft} strokeWidth={strokeWidth} fill="transparent" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={palette.primary} strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset} rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <Text style={[styles.value, { color: palette.text }]}>{safeValue}%</Text>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
    </View>
  )
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', justifyContent: 'center' }, value: { fontSize: 20, fontWeight: '900' }, label: { fontSize: 8, fontWeight: '700', marginTop: 1 } })
