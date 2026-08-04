import { StyleSheet } from 'react-native'
import { colors, radius, softShadow, spacing } from './theme'

export const commonStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...softShadow,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  label: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.text,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '900' },
  secondaryButton: { backgroundColor: colors.primarySoft },
  secondaryButtonText: { color: colors.primary, fontWeight: '900' },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
