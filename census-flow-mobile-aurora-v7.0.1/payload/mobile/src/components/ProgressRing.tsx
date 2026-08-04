import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../styles/theme'

export default function ProgressRing({
  value,
  size = 88,
  strokeWidth = 9,
  label = 'Terminé',
}: {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const safeValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (safeValue / 100) * circumference

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DBEAFE"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.value}>{safeValue}%</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  value: { color: colors.text, fontSize: 20, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 8, fontWeight: '700', marginTop: 1 },
})
