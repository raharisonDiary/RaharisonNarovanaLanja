import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import { colors, radius } from '../styles/theme'

export default function FormField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.multiline : null,
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSoft,
    letterSpacing: 0.05,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    color: colors.text,
    fontSize: 14,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: 14 },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  error: { fontSize: 11, color: colors.danger, fontWeight: '700' },
})
