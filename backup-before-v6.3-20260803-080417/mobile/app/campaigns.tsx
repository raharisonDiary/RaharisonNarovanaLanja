import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, CalendarClock, Plus, Search } from 'lucide-react-native'
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
import type { AdministrativeAreaDto, AdministrativeAreaType, CampaignDto, CampaignStatus } from '../src/types/api'
import { canManageCampaigns } from '../src/utils/permissions'

const makeCode = (name: string) => `${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'CENSUS'}-${new Date().getFullYear()}`.toUpperCase()
const children = (areas: AdministrativeAreaDto[], parentId: string, type: AdministrativeAreaType) => areas.filter((area) => area.parentId === parentId && area.type === type)

export default function CampaignsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = usePreferences()
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [scopeType, setScopeType] = useState<'Country' | 'Region' | 'District' | 'Commune'>('Country')
  const [countryId, setCountryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const [launchMode, setLaunchMode] = useState<'Draft' | 'Scheduled' | 'Active'>('Scheduled')

  const load = async () => {
    setLoading(true)
    try {
      const [campaignRows, areaRows] = await Promise.all([mobileApi.campaigns(), mobileApi.areas()])
      setCampaigns(campaignRows)
      setAreas(areaRows)
      if (!countryId) setCountryId(areaRows.find((item) => item.type === 'Country' && item.name.toLowerCase().includes('madagas'))?.id ?? '')
    } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const countries = areas.filter((a) => a.type === 'Country')
  const regions = children(areas, countryId, 'Region')
  const districts = children(areas, regionId, 'District')
  const communes = children(areas, districtId, 'Commune')
  const scopeId = scopeType === 'Country' ? countryId : scopeType === 'Region' ? regionId : scopeType === 'District' ? districtId : communeId
  const areaName = (id: string) => areas.find((item) => item.id === id)?.name ?? '—'
  const filtered = useMemo(() => campaigns.filter((item) => `${item.name} ${item.code} ${areaName(item.scopeAdministrativeAreaId)}`.toLowerCase().includes(search.toLowerCase())), [campaigns, search, areas])

  const reset = () => {
    setName(''); setCode(''); setDescription(''); setStartDate(''); setEndDate(''); setScopeType('Country'); setRegionId(''); setDistrictId(''); setCommuneId(''); setLaunchMode('Scheduled'); setError('')
  }
  const create = async () => {
    if (!name.trim() || !startDate || !endDate || !scopeId) { setError(tr(language, 'Complétez tous les champs obligatoires.', 'Fenoy ireo saha ilaina.', 'Complete all required fields.')); return }
    if (endDate < startDate) { setError(tr(language, 'La date de fin doit suivre la date de début.', 'Ny daty fiafarana dia tsy maintsy aorian’ny fanombohana.', 'The end date must follow the start date.')); return }
    setSaving(true); setError('')
    try {
      const created = await mobileApi.createCampaign({ code: code.trim() || makeCode(name), name: name.trim(), description: description.trim() || null, startDate, endDate, scopeAdministrativeAreaId: scopeId })
      if (launchMode !== 'Draft') await mobileApi.changeCampaignStatus(created.id, launchMode)
      setOpen(false); reset(); await load()
    } catch (exception) { setError(messageFromError(exception)) }
    finally { setSaving(false) }
  }
  const changeStatus = async (id: string, status: CampaignStatus) => {
    try { await mobileApi.changeCampaignStatus(id, status); await load() }
    catch (exception) { setError(messageFromError(exception)) }
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => goBackOrReplace(router, '/(tabs)/more')}><ArrowLeft color={colors.text} size={21} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.title}>{tr(language, 'Campagnes', 'Fanisana', 'Campaigns')}</Text><Text style={styles.subtitle}>{tr(language, 'Créer, programmer et suivre les campagnes.', 'Mamorona sy manara-maso fanisana.', 'Create, schedule and monitor campaigns.')}</Text></View>
        {canManageCampaigns(user?.role) && <Pressable style={styles.add} onPress={() => setOpen(true)}><Plus color="#fff" size={21} /></Pressable>}
      </View>
      <View style={styles.search}><Search color={colors.muted} size={18} /><TextInput value={search} onChangeText={setSearch} placeholder={tr(language, 'Rechercher une campagne…', 'Hikaroka fanisana…', 'Search campaigns…')} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((item) => <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}><View style={styles.icon}><CalendarClock color={colors.primary} size={21} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.meta}>{item.code} · {areaName(item.scopeAdministrativeAreaId)}</Text><Text style={styles.meta}>{item.startDate} — {item.endDate}</Text></View><StatusPill value={item.status} /></View>
            {canManageCampaigns(user?.role) && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statuses}>{(['Draft','Scheduled','Active','Suspended','Closed'] as CampaignStatus[]).map((status) => <Pressable key={status} style={[styles.statusButton, item.status === status && styles.statusButtonActive]} onPress={() => void changeStatus(item.id, status)}><Text style={[styles.statusText, item.status === status && styles.statusTextActive]}>{status}</Text></Pressable>)}</ScrollView>}
          </View>)}
        </ScrollView>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <ScrollView style={styles.modalScreen} contentContainerStyle={styles.modalContent}>
          <View style={styles.header}><Pressable style={styles.back} onPress={() => setOpen(false)}><ArrowLeft color={colors.text} size={21} /></Pressable><Text style={styles.title}>{tr(language, 'Nouvelle campagne', 'Fanisana vaovao', 'New campaign')}</Text></View>
          <FormField label={tr(language, 'Nom de la campagne', 'Anaran’ny fanisana', 'Campaign name')} value={name} onChangeText={setName} />
          <FormField label={tr(language, 'Code (automatique si vide)', 'Kaody (mandeha ho azy)', 'Code (automatic if empty)')} value={code} onChangeText={setCode} autoCapitalize="characters" />
          <FormField label={tr(language, 'Date de début (AAAA-MM-JJ)', 'Daty fanombohana', 'Start date (YYYY-MM-DD)')} value={startDate} onChangeText={setStartDate} placeholder="2026-08-10" />
          <FormField label={tr(language, 'Date de fin (AAAA-MM-JJ)', 'Daty fiafarana', 'End date (YYYY-MM-DD)')} value={endDate} onChangeText={setEndDate} placeholder="2026-09-10" />
          <SelectField label={tr(language, 'Portée', 'Faritra iasana', 'Scope')} value={scopeType} onChange={(value) => { setScopeType(value as typeof scopeType); setRegionId(''); setDistrictId(''); setCommuneId('') }} options={[{ label: tr(language, 'Tout le pays', 'Firenena manontolo', 'Whole country'), value: 'Country' }, { label: tr(language, 'Une région', 'Faritra iray', 'One region'), value: 'Region' }, { label: tr(language, 'Un district', 'Distrika iray', 'One district'), value: 'District' }, { label: tr(language, 'Une commune', 'Kaominina iray', 'One commune'), value: 'Commune' }]} />
          <SelectField label={tr(language, 'Pays', 'Firenena', 'Country')} value={countryId} onChange={(value) => { setCountryId(value); setRegionId(''); setDistrictId(''); setCommuneId('') }} options={countries.map((a) => ({ label: a.name, value: a.id }))} />
          {scopeType !== 'Country' && <SelectField label={tr(language, 'Région', 'Faritra', 'Region')} value={regionId} onChange={(value) => { setRegionId(value); setDistrictId(''); setCommuneId('') }} options={regions.map((a) => ({ label: a.name, value: a.id }))} />}
          {['District','Commune'].includes(scopeType) && <SelectField label={tr(language, 'District', 'Distrika', 'District')} value={districtId} onChange={(value) => { setDistrictId(value); setCommuneId('') }} options={districts.map((a) => ({ label: a.name, value: a.id }))} />}
          {scopeType === 'Commune' && <SelectField label={tr(language, 'Commune', 'Kaominina', 'Commune')} value={communeId} onChange={setCommuneId} options={communes.map((a) => ({ label: a.name, value: a.id }))} />}
          <SelectField label={tr(language, 'Mode de lancement', 'Fomba fanombohana', 'Launch mode')} value={launchMode} onChange={(value) => setLaunchMode(value as typeof launchMode)} options={[{ label: tr(language, 'Démarrer immédiatement', 'Hanomboka avy hatrany', 'Start immediately'), value: 'Active' }, { label: tr(language, 'Programmer selon les dates', 'Handamina amin’ny daty', 'Schedule by dates'), value: 'Scheduled' }, { label: tr(language, 'Laisser en attente', 'Avela hiandry', 'Keep pending'), value: 'Draft' }]} />
          <FormField label={tr(language, 'Description', 'Fanazavana', 'Description')} value={description} onChangeText={setDescription} multiline />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title={tr(language, 'Créer la campagne', 'Hamorona fanisana', 'Create campaign')} loading={saving} onPress={() => void create()} />
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 14 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  add: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 }, searchInput: { flex: 1, color: colors.text },
  list: { paddingVertical: spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 12, ...shadow },
  cardTop: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' }, icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontSize: 15, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  statuses: { gap: 7 }, statusButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, statusButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary }, statusText: { fontSize: 9, color: colors.textSoft, fontWeight: '800' }, statusTextActive: { color: '#fff' },
  modalScreen: { flex: 1, backgroundColor: colors.background }, modalContent: { padding: spacing.lg, gap: 14, paddingBottom: 44 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 },
})
