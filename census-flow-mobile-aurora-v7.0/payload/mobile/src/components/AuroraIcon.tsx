import type { LucideIcon } from 'lucide-react-native'
import { StyleSheet, View, type ColorValue } from 'react-native'
import { colors, radius } from '../styles/theme'

export default function AuroraIcon({
  icon: Icon,
  size = 44,
  color = colors.primary,
  backgroundColor = colors.primarySoft,
}: {
  icon: LucideIcon
  size?: number
  color?: string
  backgroundColor?: ColorValue
}) {
  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: Math.max(radius.sm, Math.round(size * 0.32)),
          backgroundColor,
        },
      ]}
    >
      <Icon color={color} size={Math.round(size * 0.46)} />
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,.08)',
  },
})
