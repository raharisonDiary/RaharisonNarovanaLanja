import * as Location from 'expo-location'
import { Stack, useRouter } from 'expo-router'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  LocateFixed,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
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
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import { useAuth } from '../src/auth/AuthContext'
import FormField from '../src/components/FormField'
import PrimaryButton from '../src/components/PrimaryButton'
import SelectField from '../src/components/SelectField'
import StatusPill from '../src/components/StatusPill'
import { tr } from '../src/i18n/text'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type {
  AdministrativeAreaDto,
  CampaignDto,
  DwellingDto,
} from '../src/types/api'
import {
  canDeleteRecord,
  canEditRecord,
  canSubmitRecord,
  canValidateRecord,
} from '../src/utils/lifecycle'
import { canValidate } from '../src/utils/permissions'

const refCode = () =>
  `HAB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

export default function DwellingsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = usePreferences()
  const [items, setItems] = useState<DwellingDto[]>([])
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DwellingDto | null>(null)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const [fokontanyId, setFokontanyId] = useState('')
  const [referenceCode, setReferenceCode] = useState(refCode())
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [rows, campaignRows, areaRows] = await Promise.all([
        mobileApi.dwellings(campaignId || undefined),
        mobileApi.campaigns(),
        mobileApi.areas(),
      ])
      setItems(rows)
      setCampaigns(campaignRows)
      setAreas(areaRows)
      if (!campaignId) {
        setCampaignId(
          campaignRows.find((item) => item.status === 'Active')?.id ??
            campaignRows[0]?.id ??
            '',
        )
      }
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [campaignId])

  const districts = areas.filter((area) => area.type === 'District')
  const communes = areas.filter(
    (area) => area.type === 'Commune' && area.parentId === districtId,
  )
  const fokontany = areas.filter(
    (area) => area.type === 'Fokontany' && area.parentId === communeId,
  )
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === 'Active',
  )
  const areaName = (id: string) =>
    areas.find((area) => area.id === id)?.name ?? '—'
  const campaignFor = (id: string) =>
    campaigns.find((campaign) => campaign.id === id)
  const campaignName = (id: string) => campaignFor(id)?.name ?? '—'
  const filtered = useMemo(
    () => items.filter((item) =>
      `${item.referenceCode} ${item.address ?? ''} ${item.localityName ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [items, search],
  )

  const reset = () => {
    setEditing(null)
    setDistrictId('')
    setCommuneId('')
    setFokontanyId('')
    setReferenceCode(refCode())
    setAddress('')
    setLatitude('')
    setLongitude('')
    setError('')
  }

  const beginCreate = () => {
    reset()
    const activeId = activeCampaigns[0]?.id ?? ''
    if (activeId) setCampaignId(activeId)
    setOpen(true)
  }

  const beginEdit = (item: DwellingDto) => {
    const fkt = areas.find((area) => area.id === item.enumerationAreaId)
    const commune = fkt?.parentId
      ? areas.find((area) => area.id === fkt.parentId)
      : undefined
    setEditing(item)
    setCampaignId(item.campaignId)
    setDistrictId(commune?.parentId ?? '')
    setCommuneId(commune?.id ?? '')
    setFokontanyId(item.enumerationAreaId)
    setReferenceCode(item.referenceCode)
    setAddress(item.address ?? '')
    setLatitude(String(item.latitude))
    setLongitude(String(item.longitude))
    setError('')
    setOpen(true)
  }

  const locate = async () => {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (permission.status !== 'granted') {
      Alert.alert(tr(
        language,
        'Permission refusée',
        'Tsy nahazo alalana',
        'Permission denied',
      ))
      return
    }
    const point = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    setLatitude(String(point.coords.latitude))
    setLongitude(String(point.coords.longitude))
  }

  const save = async () => {
    if (!campaignId || !fokontanyId || !latitude || !longitude) {
      setError(tr(
        language,
        'Choisissez la campagne, le fokontany et vérifiez le GPS.',
        'Safidio ny fanisana sy fokontany ary hamarino ny GPS.',
        'Select campaign and fokontany, then verify GPS.',
      ))
      return
    }

    setSaving(true)
    setError('')
    try {
      if (editing) {
        await mobileApi.updateDwelling(editing.id, {
          address: address || null,
          localityName: areaName(fokontanyId),
          latitude: Number(latitude),
          longitude: Number(longitude),
          occupancyStatus: editing.occupancyStatus ?? 'Occupied',
          notes: editing.notes ?? null,
        })
      } else {
        await mobileApi.createDwelling({
          campaignId,
          enumerationAreaId: fokontanyId,
          referenceCode,
          address: address || null,
          localityName: areaName(fokontanyId),
          latitude: Number(latitude),
          longitude: Number(longitude),
          notes: null,
        })
      }
      setOpen(false)
      reset()
      await load()
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (
    item: DwellingDto,
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

  const remove = (item: DwellingDto) => Alert.alert(
    tr(language, 'Supprimer cette habitation ?', 'Hamafa ity trano ity?', 'Delete this dwelling?'),
    '',
    [
      { text: tr(language, 'Annuler', 'Hanafoana', 'Cancel') },
      {
        text: tr(language, 'Supprimer', 'Hamafa', 'Delete'),
        style: 'destructive',
        onPress: () => void runAction(
          item,
          () => mobileApi.deleteDwelling(item.id),
        ),
      },
    ],
  )

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          onPress={() => goBackOrReplace(router, '/(tabs)/more')}
        >
          <ArrowLeft color={colors.text} size={21} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {tr(language, 'Habitations', 'Trano', 'Dwellings')}
          </Text>
          <Text style={styles.subtitle}>
            {tr(
              language,
              'Campagne, territoire, GPS et référence automatique.',
              'Fanisana, faritra, GPS ary kaody mandeha ho azy.',
              'Campaign, territory, GPS and automatic reference.',
            )}
          </Text>
        </View>
        <Pressable style={styles.add} onPress={beginCreate}>
          <Plus color={colors.navy} size={21} />
        </Pressable>
      </View>

      <SelectField
        label={tr(language, 'Campagne', 'Fanisana', 'Campaign')}
        value={campaignId}
        onChange={setCampaignId}
        options={campaigns.map((campaign) => ({
          label: campaign.name,
          value: campaign.id,
        }))}
      />
      <View style={styles.search}>
        <Search color={colors.muted} size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={tr(
            language,
            'Référence ou adresse…',
            'Kaody na adiresy…',
            'Reference or address…',
          )}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>
      {error && !open ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((item) => {
            const active = campaignFor(item.campaignId)?.status === 'Active'
            const editable = active && canEditRecord(item.recordStatus)
            const submittable = active && canSubmitRecord(item.recordStatus)
            const validatable =
              canValidate(user?.role) && canValidateRecord(item.recordStatus)
            const deletable = canDeleteRecord(item.recordStatus)
            const hasAction = editable || submittable || validatable || deletable

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.icon}>
                    <Building2 color={colors.primary} size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.referenceCode}</Text>
                    <Text style={styles.meta}>
                      {campaignName(item.campaignId)} · {item.localityName || areaName(item.enumerationAreaId)}
                    </Text>
                    <Text style={styles.meta}>
                      {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                    </Text>
                  </View>
                  <StatusPill value={item.recordStatus} />
                </View>
                {hasAction ? (
                  <View style={styles.actions}>
                    {editable ? (
                      <Action
                        icon={Pencil}
                        label={tr(language, 'Modifier', 'Hanova', 'Edit')}
                        disabled={workingId === item.id}
                        onPress={() => beginEdit(item)}
                      />
                    ) : null}
                    {submittable ? (
                      <Action
                        icon={Send}
                        label={tr(language, 'Soumettre', 'Handefa', 'Submit')}
                        disabled={workingId === item.id}
                        onPress={() => void runAction(
                          item,
                          () => mobileApi.submitDwelling(item.id),
                        )}
                      />
                    ) : null}
                    {validatable ? (
                      <Action
                        icon={CheckCircle2}
                        label={tr(language, 'Valider', 'Hankatoa', 'Validate')}
                        disabled={workingId === item.id}
                        onPress={() => void runAction(
                          item,
                          () => mobileApi.validateDwelling(item.id),
                        )}
                      />
                    ) : null}
                    {deletable ? (
                      <Action
                        icon={Trash2}
                        label={tr(language, 'Supprimer', 'Hamafa', 'Delete')}
                        danger
                        disabled={workingId === item.id}
                        onPress={() => remove(item)}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            )
          })}
        </ScrollView>
      )}

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <ScrollView
          style={styles.modal}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.header}>
            <Pressable style={styles.back} onPress={() => setOpen(false)}>
              <ArrowLeft color={colors.text} size={21} />
            </Pressable>
            <Text style={styles.title}>
              {editing
                ? tr(language, 'Modifier l’habitation', 'Hanova trano', 'Edit dwelling')
                : tr(language, 'Nouvelle habitation', 'Trano vaovao', 'New dwelling')}
            </Text>
          </View>
          <SelectField
            label={tr(language, 'Campagne active', 'Fanisana mandeha', 'Active campaign')}
            value={campaignId}
            onChange={setCampaignId}
            options={(editing ? campaigns : activeCampaigns).map((campaign) => ({
              label: campaign.name,
              value: campaign.id,
            }))}
          />
          <SelectField
            label={tr(language, 'District', 'Distrika', 'District')}
            value={districtId}
            onChange={(value) => {
              setDistrictId(value)
              setCommuneId('')
              setFokontanyId('')
            }}
            options={districts.map((area) => ({ label: area.name, value: area.id }))}
          />
          <SelectField
            label={tr(language, 'Commune', 'Kaominina', 'Commune')}
            value={communeId}
            onChange={(value) => {
              setCommuneId(value)
              setFokontanyId('')
            }}
            options={communes.map((area) => ({ label: area.name, value: area.id }))}
          />
          <SelectField
            label="Fokontany"
            value={fokontanyId}
            onChange={setFokontanyId}
            options={fokontany.map((area) => ({ label: area.name, value: area.id }))}
          />
          <FormField
            label={tr(language, 'Référence automatique', 'Kaody mandeha ho azy', 'Automatic reference')}
            value={referenceCode}
            editable={false}
          />
          <FormField
            label={tr(language, 'Adresse / repère', 'Adiresy / famantarana', 'Address / landmark')}
            value={address}
            onChangeText={setAddress}
          />
          <View style={styles.gps}>
            <LocateFixed color={colors.primary} size={23} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsTitle}>
                {latitude && longitude
                  ? `${latitude}, ${longitude}`
                  : tr(language, 'GPS non vérifié', 'GPS mbola tsy voamarina', 'GPS not verified')}
              </Text>
            </View>
            <Pressable style={styles.gpsButton} onPress={() => void locate()}>
              <Text style={styles.gpsButtonText}>
                {tr(language, 'Vérifier', 'Hamarino', 'Verify')}
              </Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            title={tr(language, 'Enregistrer', 'Hitahiry', 'Save')}
            loading={saving}
            onPress={() => void save()}
          />
        </ScrollView>
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
  icon: typeof Pencil
  label: string
  onPress: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      style={[styles.action, disabled && styles.actionDisabled]}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon color={danger ? colors.danger : colors.primary} size={16} />
      <Text style={[styles.actionText, danger && { color: colors.danger }]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  add: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 },
  searchInput: { flex: 1, color: colors.text },
  list: { gap: 12, paddingBottom: 44 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  row: { flexDirection: 'row', gap: 11, padding: spacing.lg, alignItems: 'flex-start' },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.border },
  action: { minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionDisabled: { opacity: 0.45 },
  actionText: { color: colors.textSoft, fontSize: 10, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { padding: spacing.lg, gap: 14, paddingBottom: 44 },
  gps: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: colors.primarySoft, borderRadius: radius.md },
  gpsTitle: { color: colors.text, fontWeight: '800', fontSize: 11 },
  gpsButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  gpsButtonText: { color: colors.navy, fontWeight: '900', fontSize: 10 },
  error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 },
})
