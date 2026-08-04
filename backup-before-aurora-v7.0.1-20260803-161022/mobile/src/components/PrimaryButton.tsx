import type { LucideIcon } from 'lucide-react-native'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native'
import { colors, radius, shadow } from '../styles/theme'

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  secondary = false,
}: {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  icon?: LucideIcon
  secondary?: boolean
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={secondary ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {Icon ? (
            <Icon
              color={secondary ? colors.primary : '#FFFFFF'}
              size={18}
            />
          ) : null}
          <Text style={[styles.text, secondary && styles.secondaryText]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    ...shadow,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: { color: '#FFFFFF', fontWeight: '900' },
  secondaryText: { color: colors.primary },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.985 }] },
})
