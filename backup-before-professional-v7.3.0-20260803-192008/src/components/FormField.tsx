import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { radius } from '../styles/theme'
import { useCensusTheme } from '../styles/censusTheme'

export default function FormField({ label, error, style, ...props }: TextInputProps & { label: string; error?: string }) {
  const { palette } = useCensusTheme()
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.textMuted}
        selectionColor={palette.primary}
        style={[
          styles.input,
          {
            color: palette.text,
            backgroundColor: palette.surfaceRaised,
            borderColor: error ? palette.danger : palette.border,
          },
          error ? { backgroundColor: palette.dangerSoft } : null,
          props.multiline ? styles.multiline : null,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.05 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 15, fontSize: 14 },
  multiline: { minHeight: 104, textAlignVertical: 'top', paddingTop: 14 },
  error: { fontSize: 11, fontWeight: '700' },
})
