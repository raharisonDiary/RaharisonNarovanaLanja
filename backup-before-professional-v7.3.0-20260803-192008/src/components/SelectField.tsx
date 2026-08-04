import { Check, ChevronDown, Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { usePreferences } from '../preferences/PreferencesContext'
import { radius, spacing } from '../styles/theme'
import { surfaceShadow, useCensusTheme } from '../styles/censusTheme'

export interface SelectOption { label: string; value: string }

export default function SelectField({ label, value, options, onChange, placeholder }: { label: string; value: string; options: SelectOption[]; onChange: (value: string) => void; placeholder?: string }) {
  const { t } = usePreferences()
  const { palette, isDark } = useCensusTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = options.find((item) => item.value === value)
  const filtered = useMemo(() => options.filter((item) => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [options, query])
  const close = () => { setOpen(false); setQuery('') }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <Pressable style={({ pressed }) => [styles.field, { backgroundColor: palette.surfaceRaised, borderColor: palette.border }, pressed && { borderColor: palette.primary }]} onPress={() => setOpen(true)}>
        <Text numberOfLines={1} style={[styles.value, { color: selected ? palette.text : palette.textMuted }]}>{selected?.label ?? placeholder ?? t('select')}</Text>
        <View style={[styles.chevron, { backgroundColor: palette.primarySoft }]}><ChevronDown color={palette.primary} size={17} /></View>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={close}>
          <Pressable style={[styles.modal, { backgroundColor: palette.surfaceRaised, borderColor: palette.border }, surfaceShadow(isDark, 'raised')]} onPress={() => undefined}>
            <View style={[styles.grabber, { backgroundColor: palette.borderStrong }]} />
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.eyebrow, { color: palette.primary }]}>Sélection</Text>
                <Text style={[styles.title, { color: palette.text }]}>{label}</Text>
              </View>
              <Pressable style={[styles.close, { backgroundColor: palette.surfaceSubtle }]} onPress={close}><X color={palette.textSecondary} size={19} /></Pressable>
            </View>
            <View style={[styles.searchBox, { backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }]}>
              <Search color={palette.primary} size={18} />
              <TextInput autoFocus placeholder={t('search')} placeholderTextColor={palette.textMuted} value={query} onChangeText={setQuery} selectionColor={palette.primary} style={[styles.searchInput, { color: palette.text }]} />
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={[styles.empty, { color: palette.textMuted }]}>{t('noData')}</Text>}
              renderItem={({ item }) => {
                const active = item.value === value
                return (
                  <Pressable style={({ pressed }) => [styles.option, active && { backgroundColor: palette.primarySoft }, pressed && { backgroundColor: palette.surfaceSubtle }]} onPress={() => { onChange(item.value); close() }}>
                    <Text style={[styles.optionText, { color: active ? palette.primary : palette.text }, active && styles.optionTextActive]}>{item.label}</Text>
                    {active ? <View style={[styles.check, { backgroundColor: palette.primary }]}><Check color="#FFFFFF" size={14} /></View> : null}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800' },
  field: { minHeight: 54, borderWidth: 1, borderRadius: radius.md, paddingLeft: 15, paddingRight: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { flex: 1, fontSize: 14 },
  chevron: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  modal: { maxHeight: '84%', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, paddingBottom: spacing.xl },
  grabber: { width: 48, height: 5, borderRadius: 999, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 20, fontWeight: '900', marginTop: 3 },
  close: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  searchBox: { marginHorizontal: spacing.lg, marginBottom: spacing.md, minHeight: 50, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1 },
  option: { minHeight: 54, marginHorizontal: spacing.lg, marginVertical: 3, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.md },
  optionText: { flex: 1 },
  optionTextActive: { fontWeight: '900' },
  check: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: spacing.xl, textAlign: 'center' },
})
