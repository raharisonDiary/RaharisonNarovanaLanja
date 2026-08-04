import { useFocusEffect, useRouter } from 'expo-router'
import {
  CheckCircle2,
  Cloud,
  Eye,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  UsersRound,
  WifiOff,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
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
import {
  deleteQueueItem,
  getQueue,
  type QueueItem,
} from '../../src/storage/database'
import { colors, radius, shadow, softShadow, spacing } from '../../src/styles/theme'
import type { CampaignDto, HouseholdDto, HouseholdType } from '../../src/types/api'
import {
  canDeleteRecord,
  canEditRecord,
  canSubmitRecord,
  canValidateRecord,
} from '../../src/utils/lifecycle'
import { canValidate } from '../../src/utils/permissions'

type Row = {
  key: string
  source: 'local' | 'server'
  referenceCode: string
  headFullName: string
  phone: string
  campaignId: string
  status: string
  local?: QueueItem
  server?: HouseholdDto
}

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
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [remote, local, campaignRows] = await Promise.all([
        mobileApi.households(campaignId || undefined).catch(() => []),
        getQueue(),
        mobileApi.campaigns().catch(() => []),
      ])
      setServerItems(remote)
      setLocalItems(local)
      setCampaigns(campaignRows)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useFocusEffect(useCallback(() => {
    void load()
  }, [load]))

  const rows = useMemo<Row[]>(() => {
    const local = localItems.map((item) => ({
      key: `local-${item.id}`,
      source: 'local' as const,
      referenceCode: item.payload.household.referenceCode,
      headFullName: item.payload.household.headFullName,
      phone: item.payload.household.phoneNumber,
      campaignId: item.payload.campaignId,
      status: item.status,
      local: item,
    }))
    const server = serverItems.map((item) => ({
      key: `server-${item.id}`,
      source: 'server' as const,
      referenceCode: item.referenceCode,
      headFullName: item.headFullName ?? t('unknownHead'),
      phone: item.phoneNumber ?? '',
      campaignId: item.campaignId,
      status: item.recordStatus,
      server: item,
    }))
    return [...local, ...server].filter((item) =>
      (!campaignId || item.campaignId === campaignId) &&
      `${item.referenceCode} ${item.headFullName} ${item.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  }, [campaignId, localItems, search, serverItems, t])

  const removeLocal = (item: QueueItem) => Alert.alert(
    t('deleteDraftQuestion'),
    t('deleteDraftText'),
    [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => void deleteQueueItem(item.id).then(load),
      },
    ],
  )

  const runServerAction = async (
    item: HouseholdDto,
    action: () => Promise<unknown>,
  ) => {
    setWorkingId(item.id)
    setError('')
    try {
      await action()
      await load()
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setWorkingId('')
    }
  }

  const removeServer = (item: HouseholdDto) => Alert.alert(
    tr(language, 'Supprimer ce ménage ?', 'Hamafa ity tokantrano ity?', 'Delete this household?'),
    '',
    [
      { text: t('cancel') },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => void runServerAction(item, () => mobileApi.deleteHousehold(item.id)),
      },
    ],
  )

  const beginEdit = (item: HouseholdDto) => {
    setEditing(item)
    setHouseholdType(item.householdType)
    setHeadName(item.headFullName ?? '')
    setPhone(item.phoneNumber ?? '')
    setError('')
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      await mobileApi.updateHousehold(editing.id, {
        householdType,
        headFullName: headName || null,
        phoneNumber: phone || null,
        notes: editing.notes ?? null,
      })
      setEditing(null)
      await load()
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  const openServerCitizen = (item: HouseholdDto) => {
    router.push({
      pathname: '/persons',
      params: {
        campaignId: item.campaignId,
        householdId: item.id,
        new: '1',
      },
    } as never)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ScreenHeader
          title={t('households')}
          subtitle={`${rows.length} ${t('resultCount')} · ${t('localAndSynced')}`}
        />
        <View style={styles.search}>
          <Search color={colors.muted} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchHouseholds')}
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <SelectField
          label={t('campaign')}
          value={campaignId}
          onChange={setCampaignId}
          options={[
            { label: t('all'), value: '' },
            ...campaigns.map((item) => ({ label: item.name, value: item.id })),
          ]}
        />
      </View>

      {error && !editing ? (
        <Text style={[styles.error, { marginHorizontal: spacing.lg }]}>{error}</Text>
      ) : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <UsersRound color={colors.muted} size={38} />
              <Text style={styles.emptyText}>{t('noHousehold')}</Text>
              <Text style={styles.emptyHint}>
                {tr(
                  language,
                  'Utilisez « Saisir un ménage » pour rattacher un ménage à une habitation existante.',
                  'Tsindrio « Hampiditra tokantrano » hampifandraisana azy amin’ny trano efa misy.',
                  'Use “Enter household” to link a household to an existing dwelling.',
                )}
              </Text>
            </View>
          ) : rows.map((item) => {
            const local = item.local
            const server = item.server
            const campaignActive = server
              ? campaigns.find((campaign) => campaign.id === server.campaignId)?.status === 'Active'
              : false
            const editable = Boolean(server && campaignActive && canEditRecord(server.recordStatus))
            const submittable = Boolean(server && campaignActive && canSubmitRecord(server.recordStatus))
            const validatable = Boolean(server && canValidate(user?.role) && canValidateRecord(server.recordStatus))
            const deletable = Boolean(server && canDeleteRecord(server.recordStatus))

            return (
              <View key={item.key} style={styles.card}>
                <View style={styles.cardHead}>
                  {item.source === 'local'
                    ? <WifiOff color={colors.warning} size={18} />
                    : <Cloud color={colors.success} size={18} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.code}>{item.referenceCode}</Text>
                    <Text style={styles.name}>{item.headFullName}</Text>
                    <Text style={styles.meta}>
                      {item.source === 'local' && local
                        ? `${local.payload.location.fokontanyName} · ${local.payload.persons.length} ${t('citizenCount')}`
                        : item.phone || t('synced')}
                    </Text>
                  </View>
                  <StatusPill value={item.source === 'local' ? t('pendingSync') : item.status} />
                </View>

                {local ? (
                  <View style={styles.actions}>
                    <Action
                      icon={Eye}
                      label={t('details')}
                      onPress={() => router.push(`/households/${local.id}` as never)}
                    />
                    <Action
                      icon={UserPlus}
                      label={t('addCitizen')}
                      onPress={() => router.push({
                        pathname: '/households/new',
                        params: { editId: local.id, startCitizen: 'true' },
                      })}
                    />
                    <Action
                      icon={Pencil}
                      label={t('edit')}
                      onPress={() => router.push({
                        pathname: '/households/new',
                        params: { editId: local.id },
                      })}
                    />
                    <Action
                      icon={Trash2}
                      label={t('delete')}
                      danger
                      onPress={() => removeLocal(local)}
                    />
                  </View>
                ) : server ? (
                  <View style={styles.actions}>
                    {campaignActive ? (
                      <Action
                        icon={UserPlus}
                        label={t('addCitizen')}
                        disabled={workingId === server.id}
                        onPress={() => openServerCitizen(server)}
                      />
                    ) : null}
                    {editable ? (
                      <Action
                        icon={Pencil}
                        label={t('edit')}
                        disabled={workingId === server.id}
                        onPress={() => beginEdit(server)}
                      />
                    ) : null}
                    {submittable ? (
                      <Action
                        icon={Send}
                        label={tr(language, 'Soumettre', 'Handefa', 'Submit')}
                        disabled={workingId === server.id}
                        onPress={() => void runServerAction(server, () => mobileApi.submitHousehold(server.id))}
                      />
                    ) : null}
                    {validatable ? (
                      <Action
                        icon={CheckCircle2}
                        label={tr(language, 'Valider', 'Hankatoa', 'Validate')}
                        disabled={workingId === server.id}
                        onPress={() => void runServerAction(server, () => mobileApi.validateHousehold(server.id))}
                      />
                    ) : null}
                    {deletable ? (
                      <Action
                        icon={Trash2}
                        label={t('delete')}
                        danger
                        disabled={workingId === server.id}
                        onPress={() => removeServer(server)}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            )
          })}
        </ScrollView>
      )}

      <View style={styles.fabGroup}>
        <PrimaryButton
          title={tr(language, 'Saisir un ménage', 'Hampiditra tokantrano', 'Enter household')}
          icon={Plus}
          onPress={() => router.push({
            pathname: '/households/create',
            params: campaignId ? { campaignId } : {},
          } as never)}
        />
        <PrimaryButton
          title={tr(language, 'Collecte complète hors ligne', 'Fanangonana feno tsy misy réseau', 'Full offline collection')}
          icon={WifiOff}
          secondary
          onPress={() => router.push('/households/new')}
        />
      </View>

      <Modal
        visible={Boolean(editing)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {tr(language, 'Modifier le ménage', 'Hanova tokantrano', 'Edit household')}
            </Text>
            <SelectField
              label={tr(language, 'Type de ménage', 'Karazana tokantrano', 'Household type')}
              value={householdType}
              onChange={(value) => setHouseholdType(value as HouseholdType)}
              options={[
                { label: tr(language, 'Ordinaire', 'Tsotra', 'Ordinary'), value: 'Ordinary' },
                { label: tr(language, 'Collectif', 'Iombonana', 'Collective'), value: 'Collective' },
                { label: tr(language, 'Sans abri', 'Tsy manan-kialofana', 'Homeless'), value: 'Homeless' },
              ]}
            />
            <FormField
              label={tr(language, 'Chef de ménage', 'Loham-pianakaviana', 'Household head')}
              value={headName}
              onChangeText={setHeadName}
            />
            <FormField
              label={tr(language, 'Téléphone', 'Finday', 'Phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              title={t('save')}
              loading={saving}
              onPress={() => void saveEdit()}
            />
            <Pressable onPress={() => setEditing(null)}>
              <Text style={styles.cancel}>{t('cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function Action({
  icon: Icon,
  label,
  onPress,
  danger = false,
  disabled = false,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      style={[styles.action, disabled && { opacity: 0.45 }]}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon color={danger ? colors.danger : colors.primary} size={16} />
      <Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
    ...softShadow,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 236, gap: 12 },
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    ...softShadow,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  code: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.35,
  },
  name: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: 4 },
  meta: { fontSize: 10, color: colors.muted, marginTop: 5, lineHeight: 15 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 4,
  },
  action: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  actionText: { fontSize: 10, color: colors.textSoft, fontWeight: '800' },
  empty: {
    alignItems: 'center',
    gap: 10,
    marginTop: 30,
    paddingVertical: 46,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BFDBFE',
    backgroundColor: colors.primarySoft,
  },
  emptyText: { color: colors.text, fontWeight: '900', fontSize: 16 },
  emptyHint: { color: colors.muted, textAlign: 'center', lineHeight: 18, fontSize: 11 },
  fabGroup: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 94,
    gap: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8,26,51,.64)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  modalTitle: { color: colors.text, fontWeight: '900', fontSize: 21, letterSpacing: -0.4 },
  error: {
    color: colors.dangerDark,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 11,
    borderRadius: radius.md,
  },
  cancel: { color: colors.muted, textAlign: 'center', padding: 10, fontWeight: '800' },
})
