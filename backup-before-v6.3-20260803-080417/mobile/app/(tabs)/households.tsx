import { useFocusEffect, useRouter } from 'expo-router'
import { CheckCircle2, Cloud, Eye, Pencil, Plus, Search, Send, Trash2, UsersRound, WifiOff } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import SelectField from '../../src/components/SelectField'
import StatusPill from '../../src/components/StatusPill'
import { tr } from '../../src/i18n/text'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import { deleteQueueItem, getQueue, type QueueItem } from '../../src/storage/database'
import { colors, radius, shadow, spacing } from '../../src/styles/theme'
import type { CampaignDto, HouseholdDto, HouseholdType } from '../../src/types/api'
import { canValidate } from '../../src/utils/permissions'

type Row = { key: string; source: 'local' | 'server'; referenceCode: string; headFullName: string; phone: string; campaignId: string; status: string; local?: QueueItem; server?: HouseholdDto }

export default function HouseholdsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { t, language } = usePreferences()
  const [serverItems, setServerItems] = useState<HouseholdDto[]>([])
  const [localItems, setLocalItems] = useState<QueueItem[]>([])
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<HouseholdDto | null>(null)
  const [householdType, setHouseholdType] = useState<HouseholdType>('Ordinary')
  const [headName, setHeadName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [remote, local, campaignRows] = await Promise.all([mobileApi.households(campaignId || undefined).catch(() => []), getQueue(), mobileApi.campaigns().catch(() => [])])
      setServerItems(remote); setLocalItems(local); setCampaigns(campaignRows)
    } finally { setLoading(false) }
  }, [campaignId])
  useFocusEffect(useCallback(() => { void load() }, [load]))

  const rows = useMemo<Row[]>(() => {
    const local = localItems.map((item) => ({ key: `local-${item.id}`, source: 'local' as const, referenceCode: item.payload.household.referenceCode, headFullName: item.payload.household.headFullName, phone: item.payload.household.phoneNumber, campaignId: item.payload.campaignId, status: item.status, local: item }))
    const server = serverItems.map((item) => ({ key: `server-${item.id}`, source: 'server' as const, referenceCode: item.referenceCode, headFullName: item.headFullName ?? t('unknownHead'), phone: item.phoneNumber ?? '', campaignId: item.campaignId, status: item.recordStatus, server: item }))
    return [...local, ...server].filter((item) => (!campaignId || item.campaignId === campaignId) && `${item.referenceCode} ${item.headFullName} ${item.phone}`.toLowerCase().includes(search.toLowerCase()))
  }, [campaignId, localItems, search, serverItems, t])

  const removeLocal = (item: QueueItem) => Alert.alert(t('deleteDraftQuestion'), t('deleteDraftText'), [{ text: t('cancel'), style: 'cancel' }, { text: t('delete'), style: 'destructive', onPress: () => void deleteQueueItem(item.id).then(load) }])
  const removeServer = (item: HouseholdDto) => Alert.alert(tr(language, 'Supprimer ce ménage ?', 'Hamafa ity tokantrano ity?', 'Delete this household?'), '', [{ text: t('cancel') }, { text: t('delete'), style: 'destructive', onPress: () => void mobileApi.deleteHousehold(item.id).then(load) }])
  const beginEdit = (item: HouseholdDto) => { setEditing(item); setHouseholdType(item.householdType); setHeadName(item.headFullName ?? ''); setPhone(item.phoneNumber ?? ''); setError('') }
  const saveEdit = async () => {
    if (!editing) return
    setSaving(true); setError('')
    try { await mobileApi.updateHousehold(editing.id, { householdType, headFullName: headName || null, phoneNumber: phone || null, notes: editing.notes ?? null }); setEditing(null); await load() }
    catch (exception) { setError(messageFromError(exception)) }
    finally { setSaving(false) }
  }

  return <View style={styles.screen}>
    <View style={styles.header}><ScreenHeader title={t('households')} subtitle={`${rows.length} ${t('resultCount')} · ${t('localAndSynced')}`} /><View style={styles.search}><Search color={colors.muted} size={18} /><TextInput style={styles.searchInput} placeholder={t('searchHouseholds')} placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} /></View><SelectField label={t('campaign')} value={campaignId} onChange={setCampaignId} options={[{ label: t('all'), value: '' }, ...campaigns.map((item) => ({ label: item.name, value: item.id }))]} /></View>
    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : <ScrollView contentContainerStyle={styles.list}>{rows.length === 0 ? <View style={styles.empty}><UsersRound color={colors.muted} size={38} /><Text style={styles.emptyText}>{t('noHousehold')}</Text></View> : rows.map((item) => {
      const local = item.local
      const server = item.server
      return <View key={item.key} style={styles.card}><View style={styles.cardHead}>{item.source === 'local' ? <WifiOff color={colors.warning} size={18} /> : <Cloud color={colors.success} size={18} />}<View style={{ flex: 1 }}><Text style={styles.code}>{item.referenceCode}</Text><Text style={styles.name}>{item.headFullName}</Text><Text style={styles.meta}>{item.source === 'local' && local ? `${local.payload.location.fokontanyName} · ${local.payload.persons.length} ${t('citizenCount')}` : item.phone || t('synced')}</Text></View><StatusPill value={item.source === 'local' ? t('pendingSync') : item.status} /></View><View style={styles.actions}>{local ? <><Action icon={Eye} label={t('details')} onPress={() => router.push(`/households/${local.id}` as never)} /><Action icon={Pencil} label={t('edit')} onPress={() => router.push({ pathname: '/households/new', params: { editId: local.id } })} /><Action icon={Trash2} label={t('delete')} danger onPress={() => removeLocal(local)} /></> : server ? <><Action icon={Pencil} label={t('edit')} onPress={() => beginEdit(server)} /><Action icon={Send} label={tr(language, 'Soumettre', 'Handefa', 'Submit')} onPress={() => void mobileApi.submitHousehold(server.id).then(load)} />{canValidate(user?.role) && <Action icon={CheckCircle2} label={tr(language, 'Valider', 'Hankatoa', 'Validate')} onPress={() => void mobileApi.validateHousehold(server.id).then(load)} />}<Action icon={Trash2} label={t('delete')} danger onPress={() => removeServer(server)} /></> : null}</View></View>
    })}</ScrollView>}
    <View style={styles.fab}><PrimaryButton title={t('newHousehold')} icon={Plus} onPress={() => router.push('/households/new')} /></View>

    <Modal visible={Boolean(editing)} transparent animationType="fade" onRequestClose={() => setEditing(null)}><View style={styles.overlay}><View style={styles.modalCard}><Text style={styles.modalTitle}>{tr(language, 'Modifier le ménage', 'Hanova tokantrano', 'Edit household')}</Text><SelectField label={tr(language, 'Type de ménage', 'Karazana tokantrano', 'Household type')} value={householdType} onChange={(value) => setHouseholdType(value as HouseholdType)} options={[{ label: tr(language, 'Ordinaire', 'Tsotra', 'Ordinary'), value: 'Ordinary' }, { label: tr(language, 'Collectif', 'Iombonana', 'Collective'), value: 'Collective' }, { label: tr(language, 'Sans abri', 'Tsy manan-kialofana', 'Homeless'), value: 'Homeless' }]} /><FormField label={tr(language, 'Chef de ménage', 'Loham-pianakaviana', 'Household head')} value={headName} onChangeText={setHeadName} /><FormField label={tr(language, 'Téléphone', 'Finday', 'Phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton title={t('save')} loading={saving} onPress={() => void saveEdit()} /><Pressable onPress={() => setEditing(null)}><Text style={styles.cancel}>{t('cancel')}</Text></Pressable></View></View></Modal>
  </View>
}

function Action({ icon: Icon, label, onPress, danger = false }: { icon: typeof Eye; label: string; onPress: () => void; danger?: boolean }) { return <Pressable style={styles.action} onPress={onPress}><Icon color={danger ? colors.danger : colors.primary} size={16} /><Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text></Pressable> }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, header: { padding: spacing.lg, gap: spacing.md }, search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 }, searchInput: { flex: 1, color: colors.text }, list: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: 12 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', ...shadow }, cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: spacing.lg }, code: { fontSize: 11, fontWeight: '900', color: colors.primary }, name: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 }, meta: { fontSize: 11, color: colors.muted, marginTop: 5 }, actions: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.border }, action: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10 }, actionText: { fontSize: 10, color: colors.textSoft, fontWeight: '700' }, empty: { alignItems: 'center', gap: 10, paddingTop: 80 }, emptyText: { color: colors.muted }, fab: { position: 'absolute', left: 16, right: 16, bottom: 12 }, overlay: { flex: 1, backgroundColor: 'rgba(10,25,18,.55)', justifyContent: 'center', padding: spacing.lg }, modalCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, gap: 14 }, modalTitle: { color: colors.text, fontWeight: '900', fontSize: 20 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 }, cancel: { color: colors.muted, textAlign: 'center', padding: 10 } })
