import { Check, ChevronDown, Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { usePreferences } from '../preferences/PreferencesContext'
import { colors, radius, softShadow, spacing } from '../styles/theme'

export interface SelectOption {
  label: string
  value: string
}

export default function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
}) {
  const { t } = usePreferences()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = options.find((item) => item.value === value)
  const filtered = useMemo(
    () =>
      options.filter((item) =>
        item.label
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ),
    [options, query],
  )

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text
          style={[styles.value, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder ?? t('select')}
        </Text>
        <View style={styles.chevron}>
          <ChevronDown color={colors.primary} size={16} />
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Sélection</Text>
                <Text style={styles.title}>{label}</Text>
              </View>
              <Pressable style={styles.close} onPress={close}>
                <X color={colors.text} size={19} />
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <Search color={colors.primary} size={18} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={t('search')}
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                style={styles.searchInput}
              />
            </View>
            <FlatList
              data={filtered}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.value}
              ListEmptyComponent={<Text style={styles.empty}>{t('noData')}</Text>}
              renderItem={({ item }) => {
                const active = item.value === value
                return (
                  <Pressable
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(item.value)
                      close()
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {item.label}
                    </Text>
                    {active ? (
                      <View style={styles.check}>
                        <Check color="#FFFFFF" size={14} />
                      </View>
                    ) : null}
                  </Pressable>
                )
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontSize: 12, fontWeight: '800', color: colors.textSoft },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingLeft: 15,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { flex: 1, color: colors.text, fontSize: 14 },
  placeholder: { color: colors.muted },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,26,51,.62)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '84%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
    ...softShadow,
  },
  grabber: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 3 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: { flex: 1, color: colors.text },
  option: {
    minHeight: 54,
    marginHorizontal: spacing.lg,
    marginVertical: 3,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
  },
  optionActive: { backgroundColor: colors.primarySoft },
  optionText: { color: colors.text, flex: 1 },
  optionTextActive: { color: colors.primaryDark, fontWeight: '900' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { padding: spacing.xl, textAlign: 'center', color: colors.muted },
})
