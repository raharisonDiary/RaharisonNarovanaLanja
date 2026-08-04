import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Home,
  Plus,
  UserPlus,
  UsersRound,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import SelectField from '../../src/components/SelectField'
import { tr } from '../../src/i18n/text'
import { goBackOrReplace } from '../../src/navigation/goBackOrReplace'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../../src/styles/theme'
import type {
  CampaignDto,
  DwellingDto,
  HouseholdDto,
  HouseholdType,
} from '../../src/types/api'

const makeReference = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MNG-${date}-${suffix}`
}

export default function CreateHouseholdScreen() {
  const router = useRouter()
  const { language } = usePreferences()
  const params = useLocalSearchParams<{
    campaignId?: string
    dwellingId?: string
    returnToPersons?: string
  }>()

  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [dwellings, setDwellings] = useState<DwellingDto[]>([])
  const [campaignId, setCampaignId] = useState(params.campaignId ?? '')
  const [dwellingId, setDwellingId] = useState(params.dwellingId ?? '')
  const [referenceCode, setReferenceCode] = useState(makeReference())
  const [householdType, setHouseholdType] = useState<HouseholdType>('Ordinary')
  const [headFullName, setHeadFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<HouseholdDto | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [campaignRows, dwellingRows] = await Promise.all([
        mobileApi.campaigns(),
        mobileApi.dwellings(),
      ])
      setCampaigns(campaignRows)
      setDwellings(dwellingRows)

      const requestedCampaign = params.campaignId
      const defaultCampaign =
        requestedCampaign && campaignRows.some((item) => item.id === requestedCampaign)
          ? requestedCampaign
          : campaignRows.find((item) => item.status === 'Active')?.id ?? ''

      setCampaignId((current) => current || defaultCampaign)
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const activeCampaigns = campaigns.filter((item) => item.status === 'Active')
  const availableDwellings = useMemo(
    () => dwellings.filter((item) => !campaignId || item.campaignId === campaignId),
    [campaignId, dwellings],
  )
  const selectedDwelling = availableDwellings.find((item) => item.id === dwellingId)

  const changeCampaign = (value: string) => {
    setCampaignId(value)
    setDwellingId('')
  }

  const save = async () => {
    if (!campaignId) {
      setError(tr(
        language,
        'Sélectionnez une campagne active.',
        'Safidio ny fanisana mbola mandeha.',
        'Select an active campaign.',
      ))
      return
    }
    if (!dwellingId) {
      setError(tr(
        language,
        'Sélectionnez d’abord une habitation.',
        'Safidio aloha ny trano.',
        'Select a dwelling first.',
      ))
      return
    }
    if (!headFullName.trim()) {
      setError(tr(
        language,
        'Saisissez le nom du chef de ménage.',
        'Ampidiro ny anaran’ny loham-pianakaviana.',
        'Enter the household head name.',
      ))
      return
    }

    setSaving(true)
    setError('')
    try {
      const result = await mobileApi.createHousehold({
        dwellingId,
        referenceCode,
        householdType,
        headFullName: headFullName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        notes: null,
      })
      setCreated(result)
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  const openCitizen = () => {
    if (!created) return
    router.replace({
      pathname: '/persons',
      params: {
        campaignId: created.campaignId,
        householdId: created.id,
        new: '1',
      },
    } as never)
  }

  const finish = () => {
    setCreated(null)
    router.replace('/(tabs)/households')
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          onPress={() => goBackOrReplace(router, '/(tabs)/households')}
        >
          <ArrowLeft color={colors.text} size={21} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {tr(language, 'Saisie d’un ménage', 'Fampidirana tokantrano', 'Household entry')}
          </Text>
          <Text style={styles.subtitle}>
            {tr(
              language,
              'Sélectionnez une habitation, puis renseignez le ménage.',
              'Safidio ny trano ary fenoy ny mombamomba ny tokantrano.',
              'Select a dwelling, then enter the household information.',
            )}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <SectionTitle
              icon={Building2}
              number="1"
              title={tr(language, 'Habitation de rattachement', 'Trano ampifandraisina', 'Linked dwelling')}
              text={tr(
                language,
                'Le ménage doit être rattaché à une habitation créée au préalable.',
                'Tsy maintsy ampifandraisina amin’ny trano efa noforonina ny tokantrano.',
                'The household must be linked to a previously created dwelling.',
              )}
            />

            <SelectField
              label={tr(language, 'Campagne active', 'Fanisana mandeha', 'Active campaign')}
              value={campaignId}
              onChange={changeCampaign}
              options={activeCampaigns.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />

            <SelectField
              label={tr(language, 'Habitation', 'Trano', 'Dwelling')}
              value={dwellingId}
              onChange={setDwellingId}
              placeholder={tr(
                language,
                'Rechercher par référence ou fokontany',
                'Hikaroka amin’ny kaody na fokontany',
                'Search by reference or fokontany',
              )}
              options={availableDwellings.map((item) => ({
                label: `${item.referenceCode} · ${item.localityName || '—'}`,
                value: item.id,
              }))}
            />

            {selectedDwelling ? (
              <View style={styles.preview}>
                <View style={styles.previewIcon}>
                  <Home color={colors.primary} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewCode}>{selectedDwelling.referenceCode}</Text>
                  <Text style={styles.previewText}>
                    {selectedDwelling.localityName || selectedDwelling.address || '—'}
                  </Text>
                  <Text style={styles.previewCoords}>
                    {selectedDwelling.latitude.toFixed(5)}, {selectedDwelling.longitude.toFixed(5)}
                  </Text>
                </View>
              </View>
            ) : null}

            {availableDwellings.length === 0 ? (
              <View style={styles.emptyDwelling}>
                <Text style={styles.emptyTitle}>
                  {tr(language, 'Aucune habitation disponible', 'Tsy misy trano azo isafidianana', 'No dwelling available')}
                </Text>
                <Text style={styles.emptyText}>
                  {tr(
                    language,
                    'Créez d’abord une habitation dans la campagne active.',
                    'Mamoròna trano aloha ao amin’ny fanisana mandeha.',
                    'Create a dwelling in the active campaign first.',
                  )}
                </Text>
                <PrimaryButton
                  title={tr(language, 'Créer une habitation', 'Hamorona trano', 'Create dwelling')}
                  icon={Plus}
                  secondary
                  onPress={() => router.push('/dwellings')}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <SectionTitle
              icon={UsersRound}
              number="2"
              title={tr(language, 'Informations du ménage', 'Mombamomba ny tokantrano', 'Household information')}
              text={tr(
                language,
                'La référence est générée automatiquement.',
                'Mivoaka ho azy ny kaodin’ny tokantrano.',
                'The reference is generated automatically.',
              )}
            />

            <View style={styles.referenceBox}>
              <Text style={styles.referenceLabel}>
                {tr(language, 'Référence automatique', 'Kaody mandeha ho azy', 'Automatic reference')}
              </Text>
              <Text style={styles.referenceValue}>{referenceCode}</Text>
              <Pressable onPress={() => setReferenceCode(makeReference())}>
                <Text style={styles.regenerate}>
                  {tr(language, 'Régénérer', 'Hamorona indray', 'Regenerate')}
                </Text>
              </Pressable>
            </View>

            <SelectField
              label={tr(language, 'Type de ménage', 'Karazana tokantrano', 'Household type')}
              value={householdType}
              onChange={(value) => setHouseholdType(value as HouseholdType)}
              options={[
                { label: tr(language, 'Ménage ordinaire', 'Tokantrano tsotra', 'Ordinary household'), value: 'Ordinary' },
                { label: tr(language, 'Ménage collectif', 'Tokantrano iombonana', 'Collective household'), value: 'Collective' },
                { label: tr(language, 'Sans abri', 'Tsy manan-kialofana', 'Homeless'), value: 'Homeless' },
              ]}
            />

            <FormField
              label={tr(language, 'Chef de ménage', 'Loham-pianakaviana', 'Household head')}
              value={headFullName}
              onChangeText={setHeadFullName}
              placeholder={tr(language, 'Nom et prénoms', 'Anarana feno', 'Full name')}
            />

            <FormField
              label={tr(language, 'Numéro de téléphone', 'Laharan-telefaona', 'Phone number')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+261…"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              title={tr(language, 'Enregistrer le ménage', 'Hitahiry ny tokantrano', 'Save household')}
              icon={CheckCircle2}
              loading={saving}
              disabled={!dwellingId || !headFullName.trim()}
              onPress={() => void save()}
            />
          </View>
        </ScrollView>
      )}

      <Modal
        visible={Boolean(created)}
        transparent
        animationType="fade"
        onRequestClose={finish}
      >
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle2 color={colors.success} size={34} />
            </View>
            <Text style={styles.successTitle}>
              {tr(language, 'Ménage enregistré', 'Voatahiry ny tokantrano', 'Household saved')}
            </Text>
            <Text style={styles.successReference}>{created?.referenceCode}</Text>
            <Text style={styles.successText}>
              {tr(
                language,
                'Souhaitez-vous ajouter un citoyen dans ce ménage maintenant ?',
                'Te hanampy olom-pirenena ao amin’ity tokantrano ity izao ve ianao?',
                'Would you like to add a citizen to this household now?',
              )}
            </Text>
            <PrimaryButton
              title={tr(language, 'Ajouter un citoyen', 'Hanampy olom-pirenena', 'Add citizen')}
              icon={UserPlus}
              onPress={openCitizen}
            />
            <PrimaryButton
              title={tr(language, 'Plus tard', 'Aoriana', 'Later')}
              secondary
              onPress={finish}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

function SectionTitle({
  icon: Icon,
  number,
  title,
  text,
}: {
  icon: LucideIcon
  number: string
  title: string
  text: string
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Icon color={colors.primary} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{number}. {title}</Text>
        <Text style={styles.sectionText}>{text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 21, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 44 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  sectionText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  preview: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCode: { color: colors.primary, fontWeight: '900', fontSize: 13 },
  previewText: { color: colors.text, fontWeight: '800', marginTop: 3 },
  previewCoords: { color: colors.muted, fontSize: 10, marginTop: 4 },
  emptyDwelling: {
    gap: 10,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
  },
  emptyTitle: { color: colors.text, fontWeight: '900' },
  emptyText: { color: colors.textSoft, fontSize: 11, lineHeight: 17 },
  referenceBox: {
    borderRadius: radius.lg,
    padding: 15,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  referenceValue: { color: colors.primary, fontSize: 18, fontWeight: '900', marginTop: 5 },
  regenerate: { color: colors.secondary, fontSize: 11, fontWeight: '900', marginTop: 8 },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: radius.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,.58)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: 13,
    alignItems: 'stretch',
    ...shadow,
  },
  successIcon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { textAlign: 'center', color: colors.text, fontSize: 21, fontWeight: '900' },
  successReference: { textAlign: 'center', color: colors.primary, fontWeight: '900' },
  successText: { textAlign: 'center', color: colors.textSoft, lineHeight: 20, marginBottom: 5 },
})
