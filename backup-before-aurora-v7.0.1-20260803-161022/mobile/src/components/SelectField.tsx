import { Check, ChevronDown, Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { usePreferences } from '../preferences/PreferencesContext'
import { colors, radius, spacing } from '../styles/theme'

export interface SelectOption { label: string; value: string }

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
    () => options.filter((item) => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),
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
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder ?? t('select')}
        </Text>
        <ChevronDown color={colors.muted} size={18} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={styles.title}>{label}</Text>
              <Pressable onPress={close}><X color={colors.text} size={22} /></Pressable>
            </View>
            <View style={styles.searchBox}>
              <Search color={colors.muted} size={18} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={t('search')}
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
            <FlatList
              data={filtered}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.value}
              ListEmptyComponent={<Text style={styles.empty}>{t('noData')}</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value)
                    close()
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value && <Check color={colors.primary} size={20} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSoft },
  field: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { flex: 1, color: colors.text },
  placeholder: { color: colors.muted },
  backdrop: { flex: 1, backgroundColor: 'rgba(3,19,47,.55)', justifyContent: 'flex-end' },
  modal: { maxHeight: '82%', backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  searchBox: { margin: spacing.lg, marginBottom: spacing.sm, minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, color: colors.text },
  option: { minHeight: 52, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { color: colors.text, flex: 1 },
  empty: { padding: spacing.xl, textAlign: 'center', color: colors.muted },
})
