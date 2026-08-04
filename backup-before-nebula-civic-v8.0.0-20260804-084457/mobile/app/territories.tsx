import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, MapPinned, Plus, Search } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import { useAuth } from '../src/auth/AuthContext'
import FormField from '../src/components/FormField'
import PrimaryButton from '../src/components/PrimaryButton'
import SelectField from '../src/components/SelectField'
import StatusPill from '../src/components/StatusPill'
import { tr } from '../src/i18n/text'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type { AdministrativeAreaDto, AdministrativeAreaType } from '../src/types/api'
import { canCreateTerritories } from '../src/utils/permissions'

export default function TerritoriesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = usePreferences()
  const [items, setItems] = useState<AdministrativeAreaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<AdministrativeAreaType>('Fokontany')
  const [parentId, setParentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const load = async () => { setLoading(true); try { setItems(await mobileApi.areas({ includeInactive: true })) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const parentTypes: Record<AdministrativeAreaType, AdministrativeAreaType | null> = { Country: null, Region: 'Country', District: 'Region', Commune: 'District', Fokontany: 'Commune', EnumerationArea: 'Fokontany' }
  const parentOptions = items.filter((item) => item.type === parentTypes[type])
  const filtered = useMemo(() => items.filter((item) => (!typeFilter || item.type === typeFilter) && `${item.code} ${item.name} ${item.type}`.toLowerCase().includes(search.toLowerCase())).slice(0, 300), [items, search, typeFilter])
  const create = async () => {
    if (!code.trim() || !name.trim() || (parentTypes[type] && !parentId)) { setError(tr(language, 'Complétez les champs obligatoires.', 'Fenoy ireo saha ilaina.', 'Complete required fields.')); return }
    setSaving(true); setError('')
    try { await mobileApi.createArea({ code: code.trim(), name: name.trim(), type, parentId: parentId || null }); setOpen(false); setCode(''); setName(''); setParentId(''); await load() }
    catch (exception) { setError(messageFromError(exception)) }
    finally { setSaving(false) }
  }
  return <View style={styles.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}><Pressable style={styles.back} onPress={() => goBackOrReplace(router, '/(tabs)/more')}><ArrowLeft color={colors.text} size={21} /></Pressable><View style={{ flex: 1 }}><Text style={styles.title}>{tr(language, 'Territoires', 'Faritra', 'Territories')}</Text><Text style={styles.subtitle}>{tr(language, '21 190 zones importées, recherche rapide et ajout manuel.', 'Faritra 21 190, fikarohana sy fanampiana.', '21,190 imported areas, fast search and manual creation.')}</Text></View>{canCreateTerritories(user?.role) && <Pressable style={styles.add} onPress={() => setOpen(true)}><Plus color={colors.navy} size={21} /></Pressable>}</View>
    <SelectField label={tr(language, 'Niveau', 'Sokajy', 'Level')} value={typeFilter} onChange={setTypeFilter} options={[{ label: tr(language, 'Tous les niveaux', 'Sokajy rehetra', 'All levels'), value: '' }, ...(['Country','Region','District','Commune','Fokontany','EnumerationArea'] as AdministrativeAreaType[]).map((value) => ({ label: value, value }))]} />
    <View style={styles.search}><Search color={colors.muted} size={18} /><TextInput value={search} onChangeText={setSearch} placeholder={tr(language, 'Code ou nom…', 'Kaody na anarana…', 'Code or name…')} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : <ScrollView contentContainerStyle={styles.list}>{filtered.map((item) => <View key={item.id} style={styles.card}><View style={styles.icon}><MapPinned color={colors.primary} size={20} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.meta}>{item.code} · {item.type}</Text></View><StatusPill value={item.isActive === false ? tr(language, 'Inactif', 'Tsy miasa', 'Inactive') : tr(language, 'Actif', 'Miasa', 'Active')} /></View>)}{filtered.length === 300 && <Text style={styles.limit}>{tr(language, 'Affichage limité à 300 résultats. Affinez la recherche.', 'Vokatra 300 ihany. Hamafiso ny fikarohana.', 'Limited to 300 results. Refine your search.')}</Text>}</ScrollView>}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}><ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}><View style={styles.header}><Pressable style={styles.back} onPress={() => setOpen(false)}><ArrowLeft color={colors.text} size={21} /></Pressable><Text style={styles.title}>{tr(language, 'Nouvelle zone', 'Faritra vaovao', 'New area')}</Text></View><FormField label={tr(language, 'Code', 'Kaody', 'Code')} value={code} onChangeText={setCode} autoCapitalize="characters" /><FormField label={tr(language, 'Nom', 'Anarana', 'Name')} value={name} onChangeText={setName} /><SelectField label={tr(language, 'Type', 'Karazana', 'Type')} value={type} onChange={(value) => { setType(value as AdministrativeAreaType); setParentId('') }} options={(['Country','Region','District','Commune','Fokontany','EnumerationArea'] as AdministrativeAreaType[]).map((value) => ({ label: value, value }))} />{parentTypes[type] && <SelectField label={tr(language, 'Zone parente', 'Faritra ambony', 'Parent area')} value={parentId} onChange={setParentId} options={parentOptions.map((item) => ({ label: item.name, value: item.id }))} />}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton title={tr(language, 'Créer', 'Hamorona', 'Create')} loading={saving} onPress={() => void create()} /></ScrollView></Modal>
  </View>
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }, back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }, add: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 }, search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 }, searchInput: { flex: 1, color: colors.text }, list: { gap: 10, paddingBottom: 44 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, ...shadow }, icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 10, marginTop: 3 }, limit: { color: colors.muted, textAlign: 'center', padding: 14 }, modal: { flex: 1, backgroundColor: colors.background }, modalContent: { padding: spacing.lg, gap: 14, paddingBottom: 44 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 } })
