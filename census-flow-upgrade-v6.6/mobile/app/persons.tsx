import * as ImagePicker from 'expo-image-picker'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
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
  BirthDatePrecision,
  CampaignDto,
  HouseholdDto,
  MaritalStatus,
  PersonDto,
  PersonSex,
  RelationshipToHead,
} from '../src/types/api'
import {
  canDeleteRecord,
  canEditRecord,
  canSubmitRecord,
  canValidateRecord,
} from '../src/utils/lifecycle'
import { canValidate } from '../src/utils/permissions'

type BirthMode = 'exact' | 'year' | 'age' | 'unknown'

interface CitizenForm {
  householdId: string
  photoDataUrl: string
  firstName: string
  lastName: string
  sex: PersonSex
  birthMode: BirthMode
  dateOfBirth: string
  birthYear: string
  declaredAge: string
  unknownAdult: boolean
  birthPlace: string
  relationshipToHead: RelationshipToHead
  hasNationalId: boolean
  nationalId: string
  nationalIdIssueDate: string
  nationalIdIssuePlace: string
  maritalStatus: MaritalStatus
  childrenCount: string
  occupation: string
  phoneNumber: string
  nationality: string
}

const TOTAL_STEPS = 6

const emptyForm = (householdId = ''): CitizenForm => ({
  householdId,
  photoDataUrl: '',
  firstName: '',
  lastName: '',
  sex: 'Female',
  birthMode: 'exact',
  dateOfBirth: '',
  birthYear: '',
  declaredAge: '',
  unknownAdult: false,
  birthPlace: '',
  relationshipToHead: 'Head',
  hasNationalId: true,
  nationalId: '',
  nationalIdIssueDate: '',
  nationalIdIssuePlace: '',
  maritalStatus: 'Single',
  childrenCount: '',
  occupation: '',
  phoneNumber: '',
  nationality: 'Malagasy',
})

function ageFromDate(date: string): number | null {
  const birth = new Date(`${date}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const anniversary = new Date(
    now.getFullYear(),
    birth.getMonth(),
    birth.getDate(),
  )
  if (now < anniversary) age -= 1
  return age
}

export default function PersonsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    campaignId?: string
    householdId?: string
    new?: string
  }>()
  const initialRouteHandled = useRef(false)
  const { width } = useWindowDimensions()
  const { user } = useAuth()
  const { language } = usePreferences()

  const [items, setItems] = useState<PersonDto[]>([])
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [households, setHouseholds] = useState<HouseholdDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [householdFilter, setHouseholdFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editing, setEditing] = useState<PersonDto | null>(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CitizenForm>(() => emptyForm())
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')

  const required = (label: string) => `${label} *`
  const optional = (label: string) =>
    `${label} (${tr(language, 'facultatif', 'tsy voatery', 'optional')})`

  const load = async () => {
    setLoading(true)
    try {
      const [personRows, campaignRows, householdRows] = await Promise.all([
        mobileApi.persons({
          campaignId: campaignId || undefined,
          householdId: householdFilter || undefined,
        }),
        mobileApi.campaigns(),
        mobileApi.households(campaignId || undefined),
      ])
      setItems(personRows)
      setCampaigns(campaignRows)
      setHouseholds(householdRows)

      if (!campaignId) {
        setCampaignId(
          params.campaignId &&
            campaignRows.some((item) => item.id === params.campaignId)
            ? params.campaignId
            : campaignRows.find((item) => item.status === 'Active')?.id ??
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
  }, [campaignId, householdFilter])

  useEffect(() => {
    if (params.campaignId && params.campaignId !== campaignId) {
      setCampaignId(params.campaignId)
      return
    }

    if (
      params.new === '1' &&
      params.householdId &&
      !initialRouteHandled.current &&
      households.some((item) => item.id === params.householdId)
    ) {
      initialRouteHandled.current = true
      openCreate(params.householdId)
    }
  }, [campaignId, households, params.campaignId, params.householdId, params.new])

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.fullName} ${item.nationalId ?? ''} ${item.occupation ?? ''}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
      ),
    [items, search],
  )

  const computedAge = useMemo(() => {
    if (form.birthMode === 'exact') {
      return form.dateOfBirth ? ageFromDate(form.dateOfBirth) : null
    }
    if (form.birthMode === 'year') {
      const year = Number(form.birthYear)
      return year >= 1890 && year <= new Date().getFullYear()
        ? new Date().getFullYear() - year
        : null
    }
    if (form.birthMode === 'age') {
      const value = Number(form.declaredAge)
      return form.declaredAge !== '' && Number.isFinite(value) ? value : null
    }
    return form.unknownAdult ? 18 : 0
  }, [
    form.birthMode,
    form.birthYear,
    form.dateOfBirth,
    form.declaredAge,
    form.unknownAdult,
  ])

  const adult = (computedAge ?? 0) >= 18
  const selectedHousehold = households.find(
    (item) => item.id === form.householdId,
  )

  const resetWizard = () => {
    setEditing(null)
    setStep(0)
    setForm(emptyForm())
    setError('')
  }

  const closeWizard = () => {
    setWizardOpen(false)
    resetWizard()
  }

  const openCreate = (householdId = '') => {
    setEditing(null)
    setStep(0)
    setForm(emptyForm(householdId))
    setError('')
    setWizardOpen(true)
  }

  const openEdit = (person: PersonDto) => {
    const precisionToMode: Record<BirthDatePrecision, BirthMode> = {
      Exact: 'exact',
      YearOnly: 'year',
      DeclaredAge: 'age',
      Unknown: 'unknown',
    }

    setEditing(person)
    setStep(0)
    setForm({
      householdId: person.householdId,
      photoDataUrl: person.photoDataUrl ?? '',
      firstName: person.firstName,
      lastName: person.lastName,
      sex: person.sex,
      birthMode: precisionToMode[person.birthDatePrecision] ?? 'exact',
      dateOfBirth: person.dateOfBirth ?? '',
      birthYear:
        person.birthDatePrecision === 'YearOnly' && person.dateOfBirth
          ? person.dateOfBirth.slice(0, 4)
          : '',
      declaredAge: person.ageYears?.toString() ?? '',
      unknownAdult: (person.ageYears ?? 0) >= 18,
      birthPlace: person.birthPlace ?? '',
      relationshipToHead: person.relationshipToHead,
      hasNationalId: Boolean(person.nationalId),
      nationalId: person.nationalId ?? '',
      nationalIdIssueDate: person.nationalIdIssueDate ?? '',
      nationalIdIssuePlace: person.nationalIdIssuePlace ?? '',
      maritalStatus: person.maritalStatus,
      childrenCount: person.childrenCount?.toString() ?? '',
      occupation: person.occupation ?? '',
      phoneNumber: person.phoneNumber ?? '',
      nationality: person.nationality ?? 'Malagasy',
    })
    setError('')
    setWizardOpen(true)
  }

  const setValue = <K extends keyof CitizenForm>(
    key: K,
    value: CitizenForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const applyPhoto = (asset: ImagePicker.ImagePickerAsset) => {
    setValue(
      'photoDataUrl',
      asset.base64
        ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri,
    )
  }

  const camera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        tr(language, 'Permission refusée', 'Tsy nahazo alalana', 'Permission denied'),
        tr(
          language,
          'Autorisez la caméra pour prendre la photo du citoyen.',
          'Omeo alalana ny fakantsary mba haka sary.',
          'Allow camera access to take the citizen photo.',
        ),
      )
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.65,
      allowsEditing: true,
      aspect: [3, 4],
      base64: true,
    })
    if (!result.canceled) applyPhoto(result.assets[0])
  }

  const gallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        tr(language, 'Permission refusée', 'Tsy nahazo alalana', 'Permission denied'),
        tr(
          language,
          'Autorisez l’accès aux images pour importer une photo.',
          'Omeo alalana ny fidirana amin’ny sary.',
          'Allow photo access to import an image.',
        ),
      )
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.65,
      allowsEditing: true,
      aspect: [3, 4],
      base64: true,
    })
    if (!result.canceled) applyPhoto(result.assets[0])
  }

  const canContinue = () => {
    if (step === 0) return Boolean(form.householdId && form.photoDataUrl)
    if (step === 1) {
      return Boolean(
        form.lastName.trim() &&
          form.firstName.trim() &&
          form.birthPlace.trim(),
      )
    }
    if (step === 2) {
      return computedAge !== null && computedAge >= 0 && computedAge <= 130
    }
    if (step === 3) {
      return !adult || !form.hasNationalId || Boolean(form.nationalId.trim())
    }
    if (step === 4) {
      return ['Married', 'Widowed'].includes(form.maritalStatus)
        ? form.childrenCount !== '' && Number(form.childrenCount) >= 0
        : true
    }
    return Boolean(form.occupation.trim())
  }

  const nextStep = () => {
    if (!canContinue()) return
    setError('')
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1))
  }

  const previousStep = () => {
    setError('')
    setStep((current) => Math.max(0, current - 1))
  }

  const toPayload = () => {
    const precision: Record<BirthMode, BirthDatePrecision> = {
      exact: 'Exact',
      year: 'YearOnly',
      age: 'DeclaredAge',
      unknown: 'Unknown',
    }

    const dateOfBirth =
      form.birthMode === 'exact'
        ? form.dateOfBirth || null
        : form.birthMode === 'year' && form.birthYear
          ? `${form.birthYear}-01-01`
          : null

    const householdPersons = items.filter(
      (item) => item.householdId === form.householdId,
    )
    const personNumber =
      editing?.personNumber ??
      Math.max(0, ...householdPersons.map((item) => item.personNumber)) + 1

    return {
      householdId: form.householdId,
      personNumber,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      sex: form.sex,
      dateOfBirth,
      ageYears: computedAge,
      birthDatePrecision: precision[form.birthMode],
      birthPlace: form.birthPlace.trim(),
      relationshipToHead: form.relationshipToHead,
      maritalStatus: form.maritalStatus,
      childrenCount: ['Married', 'Widowed'].includes(form.maritalStatus)
        ? Number(form.childrenCount || 0)
        : null,
      nationality: form.nationality.trim() || null,
      occupation: form.occupation.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      nationalId:
        adult && form.hasNationalId
          ? form.nationalId.trim() || null
          : null,
      nationalIdIssueDate:
        adult && form.hasNationalId
          ? form.nationalIdIssueDate || null
          : null,
      nationalIdIssuePlace:
        adult && form.hasNationalId
          ? form.nationalIdIssuePlace.trim() || null
          : null,
      photoDataUrl: form.photoDataUrl || null,
      notes: null,
    }
  }

  const save = async () => {
    if (!canContinue()) return

    setSaving(true)
    setError('')
    try {
      const payload = toPayload()
      if (editing) {
        await mobileApi.updatePerson(editing.id, payload)
        await load()
        closeWizard()
        return
      }

      await mobileApi.createPerson(payload)
      await load()

      const currentHouseholdId = form.householdId
      Alert.alert(
        tr(
          language,
          'Citoyen enregistré',
          'Voatahiry ilay olona',
          'Citizen saved',
        ),
        tr(
          language,
          'Souhaitez-vous ajouter immédiatement une autre personne dans le même ménage ?',
          'Hanampy olona hafa ao amin’io tokantrano io avy hatrany ve ianao?',
          'Would you like to add another person to the same household now?',
        ),
        [
          {
            text: tr(language, 'Non, terminer', 'Tsia, vita', 'No, finish'),
            style: 'cancel',
            onPress: closeWizard,
          },
          {
            text: tr(language, 'Oui, ajouter', 'Eny, hanampy', 'Yes, add'),
            onPress: () => {
              setEditing(null)
              setForm(emptyForm(currentHouseholdId))
              setStep(0)
              setError('')
            },
          },
        ],
      )
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (
    item: PersonDto,
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

  const remove = (item: PersonDto) => {
    Alert.alert(
      tr(
        language,
        'Supprimer ce citoyen ?',
        'Hamafa ity olona ity?',
        'Delete this citizen?',
      ),
      '',
      [
        { text: tr(language, 'Annuler', 'Hanafoana', 'Cancel') },
        {
          text: tr(language, 'Supprimer', 'Hamafa', 'Delete'),
          style: 'destructive',
          onPress: () =>
            void runAction(item, () => mobileApi.deletePerson(item.id)),
        },
      ],
    )
  }

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
            {tr(language, 'Citoyens', 'Olom-pirenena', 'Citizens')}
          </Text>
          <Text style={styles.subtitle}>
            {tr(
              language,
              'Saisie guidée, photo, recherche et validation.',
              'Fanontaniana tsikelikely, sary ary fanamarinana.',
              'Guided entry, photo, search and validation.',
            )}
          </Text>
        </View>
        <Pressable style={styles.add} onPress={() => openCreate()}>
          <Plus color="#FFFFFF" size={21} />
        </Pressable>
      </View>

      <SelectField
        label={tr(language, 'Campagne', 'Fanisana', 'Campaign')}
        value={campaignId}
        onChange={(value) => {
          setCampaignId(value)
          setHouseholdFilter('')
        }}
        options={campaigns.map((campaign) => ({
          label: campaign.name,
          value: campaign.id,
        }))}
      />

      <SelectField
        label={tr(
          language,
          'Ménage (filtre)',
          'Tokantrano (sivana)',
          'Household filter',
        )}
        value={householdFilter}
        onChange={setHouseholdFilter}
        options={[
          {
            label: tr(
              language,
              'Tous les ménages',
              'Tokantrano rehetra',
              'All households',
            ),
            value: '',
          },
          ...households.map((household) => ({
            label: `${household.referenceCode} · ${household.headFullName ?? ''}`,
            value: household.id,
          })),
        ]}
      />

      <View style={styles.search}>
        <Search color={colors.muted} size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={tr(
            language,
            'Nom, CIN ou profession…',
            'Anarana, CIN na asa…',
            'Name, ID or occupation…',
          )}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      {error && !wizardOpen ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((item) => {
            const household = households.find(
              (row) => row.id === item.householdId,
            )
            const active =
              campaigns.find((row) => row.id === household?.campaignId)
                ?.status === 'Active'
            const editable = active && canEditRecord(item.recordStatus)
            const submittable = active && canSubmitRecord(item.recordStatus)
            const validatable =
              canValidate(user?.role) && canValidateRecord(item.recordStatus)
            const deletable = canDeleteRecord(item.recordStatus)

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.row}>
                  {item.photoDataUrl ? (
                    <Image
                      source={{ uri: item.photoDataUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <UserRound color={colors.primary} size={23} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.fullName}</Text>
                    <Text style={styles.meta}>
                      {item.ageYears ?? '—'} · {item.sex} ·{' '}
                      {item.occupation || '—'}
                    </Text>
                    <Text style={styles.meta}>
                      {item.nationalId ||
                        tr(
                          language,
                          'Sans CIN',
                          'Tsy manana CIN',
                          'No national ID',
                        )}
                    </Text>
                  </View>
                  <StatusPill value={item.recordStatus} />
                </View>

                {editable || submittable || validatable || deletable ? (
                  <View style={styles.actions}>
                    {editable ? (
                      <Action
                        icon={Pencil}
                        label={tr(language, 'Modifier', 'Hanova', 'Edit')}
                        disabled={workingId === item.id}
                        onPress={() => openEdit(item)}
                      />
                    ) : null}
                    {submittable ? (
                      <Action
                        icon={Send}
                        label={tr(language, 'Soumettre', 'Handefa', 'Submit')}
                        disabled={workingId === item.id}
                        onPress={() =>
                          void runAction(item, () =>
                            mobileApi.submitPerson(item.id),
                          )
                        }
                      />
                    ) : null}
                    {validatable ? (
                      <Action
                        icon={CheckCircle2}
                        label={tr(language, 'Valider', 'Hankatoa', 'Validate')}
                        disabled={workingId === item.id}
                        onPress={() =>
                          void runAction(item, () =>
                            mobileApi.validatePerson(item.id),
                          )
                        }
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
        visible={wizardOpen}
        animationType="slide"
        onRequestClose={closeWizard}
      >
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Pressable style={styles.back} onPress={closeWizard}>
              <X color={colors.text} size={21} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {editing
                  ? tr(
                      language,
                      'Modifier le citoyen',
                      'Hanova olona',
                      'Edit citizen',
                    )
                  : tr(
                      language,
                      'Ajouter un citoyen',
                      'Hanampy olona',
                      'Add citizen',
                    )}
              </Text>
              <Text style={styles.subtitle}>
                {tr(language, 'Question', 'Fanontaniana', 'Question')} {step + 1}{' '}
                {tr(language, 'sur', 'amin’ny', 'of')} {TOTAL_STEPS}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  index <= step && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.requiredLegend}>
              *{' '}
              {tr(
                language,
                'Champ obligatoire',
                'Saha tsy maintsy fenoina',
                'Required field',
              )}
            </Text>

            {step === 0 ? (
              <WizardSection
                icon={Camera}
                title={`1. ${tr(
                  language,
                  'Ménage et photo',
                  'Tokantrano sy sary',
                  'Household and photo',
                )}`}
                text={tr(
                  language,
                  'Sélectionnez le ménage puis prenez ou importez une photo nette.',
                  'Safidio ny tokantrano ary makà na ampidiro sary mazava.',
                  'Select the household, then take or import a clear photo.',
                )}
              >
                {editing ? (
                  <View style={styles.readOnlyCard}>
                    <UsersRound color={colors.primary} size={22} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readOnlyLabel}>
                        {required(
                          tr(language, 'Ménage', 'Tokantrano', 'Household'),
                        )}
                      </Text>
                      <Text style={styles.readOnlyValue}>
                        {selectedHousehold
                          ? `${selectedHousehold.referenceCode} · ${selectedHousehold.headFullName ?? ''}`
                          : form.householdId}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <SelectField
                      label={required(
                        tr(language, 'Ménage', 'Tokantrano', 'Household'),
                      )}
                      value={form.householdId}
                      onChange={(value) => setValue('householdId', value)}
                      placeholder={tr(
                        language,
                        'Rechercher un ménage',
                        'Hikaroka tokantrano',
                        'Search for a household',
                      )}
                      options={households.map((household) => ({
                        label: `${household.referenceCode} · ${household.headFullName ?? ''}`,
                        value: household.id,
                      }))}
                    />
                    <Pressable
                      style={styles.createHouseholdButton}
                      onPress={() => {
                        setWizardOpen(false)
                        router.push({
                          pathname: '/households/create',
                          params: {
                            campaignId,
                            returnToPersons: '1',
                          },
                        } as never)
                      }}
                    >
                      <Plus color={colors.primary} size={18} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.createHouseholdTitle}>
                          {tr(
                            language,
                            'Créer un nouveau ménage',
                            'Hamorona tokantrano vaovao',
                            'Create a new household',
                          )}
                        </Text>
                        <Text style={styles.createHouseholdText}>
                          {tr(
                            language,
                            'À utiliser si le ménage n’existe pas encore.',
                            'Ampiasao raha mbola tsy misy ilay tokantrano.',
                            'Use this when the household does not exist yet.',
                          )}
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}

                <View style={styles.photoBox}>
                  {form.photoDataUrl ? (
                    <>
                      <Image
                        source={{ uri: form.photoDataUrl }}
                        style={styles.photo}
                      />
                      <Pressable
                        style={styles.removePhoto}
                        onPress={() => setValue('photoDataUrl', '')}
                      >
                        <Trash2 color={colors.danger} size={17} />
                        <Text style={styles.removePhotoText}>
                          {tr(
                            language,
                            'Supprimer la photo',
                            'Hamafa ny sary',
                            'Remove photo',
                          )}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <UserRound color={colors.primary} size={54} />
                      <Text style={styles.photoRequiredText}>
                        {required(
                          tr(
                            language,
                            'Photo du citoyen',
                            'Sarin’ilay olona',
                            'Citizen photo',
                          ),
                        )}
                      </Text>
                      <Text style={styles.photoHint}>
                        {tr(
                          language,
                          'Visage centré et lumière suffisante.',
                          'Ataovy eo afovoany ny tarehy ary ampy hazavana.',
                          'Center the face with sufficient light.',
                        )}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.photoActions,
                      width < 440 && styles.photoActionsSmall,
                    ]}
                  >
                    <Pressable
                      style={[styles.photoButton, styles.photoButtonPrimary]}
                      onPress={() => void camera()}
                    >
                      <Camera color={colors.primary} size={19} />
                      <Text style={styles.photoText}>
                        {tr(
                          language,
                          form.photoDataUrl ? 'Reprendre' : 'Prendre une photo',
                          form.photoDataUrl ? 'Haka indray' : 'Haka sary',
                          form.photoDataUrl ? 'Retake' : 'Take photo',
                        )}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.photoButton}
                      onPress={() => void gallery()}
                    >
                      <ImagePlus color={colors.accent} size={19} />
                      <Text style={styles.photoText}>
                        {tr(
                          language,
                          'Importer une image',
                          'Hampiditra sary',
                          'Import image',
                        )}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </WizardSection>
            ) : null}

            {step === 1 ? (
              <WizardSection
                icon={UserRound}
                title={`2. ${tr(
                  language,
                  'Identité du citoyen',
                  'Mombamomba ilay olona',
                  'Citizen identity',
                )}`}
                text={tr(
                  language,
                  'Répondez aux questions d’identité. Les champs marqués d’un astérisque sont obligatoires.',
                  'Fenoy ny mombamomba. Tsy maintsy fenoina ireo misy kintana.',
                  'Answer the identity questions. Fields marked with an asterisk are required.',
                )}
              >
                <FormField
                  label={required(tr(language, 'Nom', 'Anarana', 'Last name'))}
                  value={form.lastName}
                  onChangeText={(value) => setValue('lastName', value)}
                  autoCapitalize="characters"
                />
                <FormField
                  label={required(
                    tr(language, 'Prénoms', 'Fanampin’anarana', 'First names'),
                  )}
                  value={form.firstName}
                  onChangeText={(value) => setValue('firstName', value)}
                />
                <SelectField
                  label={required(tr(language, 'Sexe', 'Lahy/Vavy', 'Sex'))}
                  value={form.sex}
                  onChange={(value) => setValue('sex', value as PersonSex)}
                  options={[
                    {
                      label: tr(language, 'Féminin', 'Vavy', 'Female'),
                      value: 'Female',
                    },
                    {
                      label: tr(language, 'Masculin', 'Lahy', 'Male'),
                      value: 'Male',
                    },
                    {
                      label: tr(
                        language,
                        'Non déclaré',
                        'Tsy voalaza',
                        'Not stated',
                      ),
                      value: 'NotStated',
                    },
                  ]}
                />
                <FormField
                  label={required(
                    tr(
                      language,
                      'Lieu de naissance',
                      'Toerana nahaterahana',
                      'Place of birth',
                    ),
                  )}
                  value={form.birthPlace}
                  onChangeText={(value) => setValue('birthPlace', value)}
                />
              </WizardSection>
            ) : null}

            {step === 2 ? (
              <WizardSection
                icon={UserRound}
                title={`3. ${tr(
                  language,
                  'Naissance et âge',
                  'Fahaterahana sy taona',
                  'Birth and age',
                )}`}
                text={tr(
                  language,
                  'Choisissez la précision réellement connue. Une date complète n’est pas obligatoire.',
                  'Safidio izay tena fantatra. Tsy voatery ho feno ny daty.',
                  'Choose the information that is actually known. A complete date is not required.',
                )}
              >
                <Choice
                  label={required(
                    tr(
                      language,
                      'Information connue',
                      'Mombamomba fantatra',
                      'Known information',
                    ),
                  )}
                  value={form.birthMode}
                  options={[
                    [
                      'exact',
                      tr(language, 'Date exacte', 'Daty marina', 'Exact date'),
                    ],
                    [
                      'year',
                      tr(language, 'Année seulement', 'Taona ihany', 'Year only'),
                    ],
                    [
                      'age',
                      tr(language, 'Âge déclaré', 'Taona voalaza', 'Declared age'),
                    ],
                    [
                      'unknown',
                      tr(language, 'Inconnu', 'Tsy fantatra', 'Unknown'),
                    ],
                  ]}
                  onChange={(value) => setValue('birthMode', value as BirthMode)}
                />

                {form.birthMode === 'exact' ? (
                  <FormField
                    label={required(
                      tr(
                        language,
                        'Date de naissance',
                        'Daty nahaterahana',
                        'Date of birth',
                      ),
                    )}
                    value={form.dateOfBirth}
                    onChangeText={(value) => setValue('dateOfBirth', value)}
                    placeholder="AAAA-MM-JJ"
                  />
                ) : null}

                {form.birthMode === 'year' ? (
                  <FormField
                    label={required(
                      tr(
                        language,
                        'Année de naissance',
                        'Taona nahaterahana',
                        'Year of birth',
                      ),
                    )}
                    value={form.birthYear}
                    onChangeText={(value) => setValue('birthYear', value)}
                    keyboardType="number-pad"
                    placeholder="1985"
                    maxLength={4}
                  />
                ) : null}

                {form.birthMode === 'age' ? (
                  <FormField
                    label={required(
                      tr(
                        language,
                        'Âge déclaré',
                        'Taona voalaza',
                        'Declared age',
                      ),
                    )}
                    value={form.declaredAge}
                    onChangeText={(value) => setValue('declaredAge', value)}
                    keyboardType="number-pad"
                    placeholder="35"
                    maxLength={3}
                  />
                ) : null}

                {form.birthMode === 'unknown' ? (
                  <Choice
                    label={required(
                      tr(
                        language,
                        'Catégorie d’âge',
                        'Sokajin-taona',
                        'Age category',
                      ),
                    )}
                    value={form.unknownAdult ? 'adult' : 'minor'}
                    options={[
                      [
                        'minor',
                        tr(
                          language,
                          'Moins de 18 ans',
                          'Latsaky ny 18 taona',
                          'Under 18',
                        ),
                      ],
                      [
                        'adult',
                        tr(
                          language,
                          '18 ans ou plus',
                          '18 taona no ho miakatra',
                          '18 or older',
                        ),
                      ],
                    ]}
                    onChange={(value) =>
                      setValue('unknownAdult', value === 'adult')
                    }
                  />
                ) : null}

                <View style={styles.ageResult}>
                  <Text style={styles.ageLabel}>
                    {tr(
                      language,
                      'Filtrage automatique',
                      'Sivana mandeha ho azy',
                      'Automatic filtering',
                    )}
                  </Text>
                  <Text style={styles.ageStrong}>
                    {adult
                      ? tr(
                          language,
                          'Adulte — 18 ans ou plus',
                          'Olon-dehibe — 18 taona no ho miakatra',
                          'Adult — 18 or older',
                        )
                      : tr(
                          language,
                          'Mineur — moins de 18 ans',
                          'Zaza tsy ampy taona',
                          'Minor — under 18',
                        )}
                  </Text>
                  <Text style={styles.ageValue}>
                    {computedAge ?? '—'}{' '}
                    {tr(language, 'ans', 'taona', 'years')}
                  </Text>
                </View>
              </WizardSection>
            ) : null}

            {step === 3 ? (
              <WizardSection
                icon={Check}
                title={`4. ${tr(
                  language,
                  'Carte d’identité nationale',
                  'Kara-panondrom-pirenena',
                  'National identity card',
                )}`}
                text={
                  adult
                    ? tr(
                        language,
                        'Un majeur peut être enregistré même s’il ne possède pas de CIN.',
                        'Azo soratana ny olon-dehibe na dia tsy manana CIN aza.',
                        'An adult can be registered even without a national ID.',
                      )
                    : tr(
                        language,
                        'Aucune question CIN n’est demandée pour une personne mineure.',
                        'Tsy misy fanontaniana CIN ho an’ny zaza tsy ampy taona.',
                        'No national ID questions are required for a minor.',
                      )
                }
              >
                {adult ? (
                  <>
                    <Choice
                      label={required(
                        tr(
                          language,
                          'Le citoyen possède-t-il une CIN ?',
                          'Manana CIN ve ilay olona?',
                          'Does the citizen have a national ID?',
                        ),
                      )}
                      value={form.hasNationalId ? 'has' : 'none'}
                      options={[
                        [
                          'has',
                          tr(language, 'Oui', 'Eny', 'Yes'),
                        ],
                        [
                          'none',
                          tr(language, 'Non', 'Tsia', 'No'),
                        ],
                      ]}
                      onChange={(value) =>
                        setValue('hasNationalId', value === 'has')
                      }
                    />

                    {form.hasNationalId ? (
                      <>
                        <FormField
                          label={required(
                            tr(
                              language,
                              'Numéro CIN',
                              'Laharan’ny CIN',
                              'National ID number',
                            ),
                          )}
                          value={form.nationalId}
                          onChangeText={(value) =>
                            setValue('nationalId', value)
                          }
                          keyboardType="number-pad"
                        />
                        <FormField
                          label={optional(
                            tr(
                              language,
                              'Date de délivrance',
                              'Daty namoahana',
                              'Issue date',
                            ),
                          )}
                          value={form.nationalIdIssueDate}
                          onChangeText={(value) =>
                            setValue('nationalIdIssueDate', value)
                          }
                          placeholder="AAAA-MM-JJ"
                        />
                        <FormField
                          label={optional(
                            tr(
                              language,
                              'Lieu de délivrance',
                              'Toerana namoahana',
                              'Issue place',
                            ),
                          )}
                          value={form.nationalIdIssuePlace}
                          onChangeText={(value) =>
                            setValue('nationalIdIssuePlace', value)
                          }
                        />
                      </>
                    ) : (
                      <View style={styles.informationCard}>
                        <Text style={styles.informationText}>
                          {tr(
                            language,
                            'Les champs CIN resteront vides. L’enregistrement peut continuer.',
                            'Avela ho banga ny saha CIN ary afaka manohy.',
                            'National ID fields will remain empty. Registration can continue.',
                          )}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.informationCard}>
                    <Text style={styles.informationText}>
                      {tr(
                        language,
                        'Cette étape est automatiquement validée pour un mineur.',
                        'Voamarina ho azy ity dingana ity ho an’ny zaza tsy ampy taona.',
                        'This step is automatically validated for a minor.',
                      )}
                    </Text>
                  </View>
                )}
              </WizardSection>
            ) : null}

            {step === 4 ? (
              <WizardSection
                icon={UsersRound}
                title={`5. ${tr(
                  language,
                  'Situation familiale',
                  'Toe-panambadiana',
                  'Family situation',
                )}`}
                text={tr(
                  language,
                  'Le nombre d’enfants est demandé uniquement pour une personne mariée ou veuve.',
                  'Ny isan’ny zanaka dia anontaniana amin’ny manambady na maty vady ihany.',
                  'The number of children is requested only for married or widowed people.',
                )}
              >
                <SelectField
                  label={required(
                    tr(
                      language,
                      'Situation familiale',
                      'Toe-panambadiana',
                      'Marital status',
                    ),
                  )}
                  value={form.maritalStatus}
                  onChange={(value) =>
                    setValue('maritalStatus', value as MaritalStatus)
                  }
                  options={[
                    {
                      label: tr(language, 'Célibataire', 'Tsy manambady', 'Single'),
                      value: 'Single',
                    },
                    {
                      label: tr(language, 'Marié(e)', 'Manambady', 'Married'),
                      value: 'Married',
                    },
                    {
                      label: tr(language, 'Veuf / veuve', 'Maty vady', 'Widowed'),
                      value: 'Widowed',
                    },
                    {
                      label: tr(language, 'Divorcé(e)', 'Nisaraka ara-dalàna', 'Divorced'),
                      value: 'Divorced',
                    },
                    {
                      label: tr(language, 'Séparé(e)', 'Misaraka', 'Separated'),
                      value: 'Separated',
                    },
                    {
                      label: tr(language, 'Neutre / non déclaré', 'Tsy voalaza', 'Not stated'),
                      value: 'NotStated',
                    },
                  ]}
                />

                {['Married', 'Widowed'].includes(form.maritalStatus) ? (
                  <FormField
                    label={required(
                      tr(
                        language,
                        'Nombre d’enfants',
                        'Isan’ny zanaka',
                        'Number of children',
                      ),
                    )}
                    value={form.childrenCount}
                    onChangeText={(value) => setValue('childrenCount', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                ) : null}

                <SelectField
                  label={required(
                    tr(
                      language,
                      'Lien avec le chef de ménage',
                      'Fifandraisana amin’ny loham-pianakaviana',
                      'Relationship to household head',
                    ),
                  )}
                  value={form.relationshipToHead}
                  onChange={(value) =>
                    setValue(
                      'relationshipToHead',
                      value as RelationshipToHead,
                    )
                  }
                  options={[
                    {
                      label: tr(language, 'Chef de ménage', 'Loham-pianakaviana', 'Household head'),
                      value: 'Head',
                    },
                    {
                      label: tr(language, 'Conjoint(e)', 'Vady', 'Spouse'),
                      value: 'Spouse',
                    },
                    {
                      label: tr(language, 'Enfant', 'Zanaka', 'Child'),
                      value: 'Child',
                    },
                    {
                      label: tr(language, 'Parent', 'Ray/Reny', 'Parent'),
                      value: 'Parent',
                    },
                    {
                      label: tr(language, 'Frère / sœur', 'Rahalahy / anabavy', 'Sibling'),
                      value: 'Sibling',
                    },
                    {
                      label: tr(language, 'Autre parent', 'Havana hafa', 'Other relative'),
                      value: 'OtherRelative',
                    },
                    {
                      label: tr(language, 'Sans lien familial', 'Tsy havana', 'Non-relative'),
                      value: 'NonRelative',
                    },
                  ]}
                />
              </WizardSection>
            ) : null}

            {step === 5 ? (
              <WizardSection
                icon={CheckCircle2}
                title={`6. ${tr(
                  language,
                  'Profession et vérification',
                  'Asa sy fanamarinana',
                  'Occupation and review',
                )}`}
                text={tr(
                  language,
                  'Renseignez la profession, puis vérifiez les informations avant l’enregistrement.',
                  'Fenoy ny asa ary hamarino ny mombamomba alohan’ny hitahirizana.',
                  'Enter the occupation, then review the information before saving.',
                )}
              >
                <FormField
                  label={required(
                    tr(
                      language,
                      'Profession / activité',
                      'Asa / fivelomana',
                      'Occupation / activity',
                    ),
                  )}
                  value={form.occupation}
                  onChangeText={(value) => setValue('occupation', value)}
                  placeholder={tr(
                    language,
                    'Étudiant, enseignant, agriculteur…',
                    'Mpianatra, mpampianatra, tantsaha…',
                    'Student, teacher, farmer…',
                  )}
                />
                <FormField
                  label={optional(
                    tr(
                      language,
                      'Téléphone personnel',
                      'Finday manokana',
                      'Personal phone',
                    ),
                  )}
                  value={form.phoneNumber}
                  onChangeText={(value) => setValue('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
                <FormField
                  label={optional(
                    tr(language, 'Nationalité', 'Zom-pirenena', 'Nationality'),
                  )}
                  value={form.nationality}
                  onChangeText={(value) => setValue('nationality', value)}
                />

                <View style={styles.reviewCard}>
                  {form.photoDataUrl ? (
                    <Image
                      source={{ uri: form.photoDataUrl }}
                      style={styles.reviewPhoto}
                    />
                  ) : null}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.reviewName}>
                      {form.firstName} {form.lastName}
                    </Text>
                    <Text style={styles.reviewLine}>
                      {computedAge ?? '—'} {tr(language, 'ans', 'taona', 'years')} ·{' '}
                      {adult
                        ? tr(language, 'Majeur', 'Olon-dehibe', 'Adult')
                        : tr(language, 'Mineur', 'Zaza tsy ampy taona', 'Minor')}
                    </Text>
                    <Text style={styles.reviewLine}>
                      {form.occupation || '—'}
                    </Text>
                    <Text style={styles.reviewLine}>
                      {selectedHousehold?.referenceCode ?? form.householdId}
                    </Text>
                  </View>
                </View>
              </WizardSection>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.wizardFooter}>
            <Pressable
              style={[styles.previousButton, step === 0 && styles.buttonDisabled]}
              disabled={step === 0 || saving}
              onPress={previousStep}
            >
              <ChevronLeft color={colors.textSoft} size={18} />
              <Text style={styles.previousText}>
                {tr(language, 'Précédent', 'Teo aloha', 'Previous')}
              </Text>
            </Pressable>

            <View style={styles.nextButton}>
              {step < TOTAL_STEPS - 1 ? (
                <PrimaryButton
                  title={tr(language, 'Continuer', 'Hanohy', 'Continue')}
                  icon={ChevronRight}
                  disabled={!canContinue()}
                  onPress={nextStep}
                />
              ) : (
                <PrimaryButton
                  title={tr(
                    language,
                    'Enregistrer le citoyen',
                    'Hitahiry ilay olona',
                    'Save citizen',
                  )}
                  icon={Check}
                  loading={saving}
                  disabled={!canContinue()}
                  onPress={() => void save()}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

function WizardSection({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon
  title: string
  text: string
  children: ReactNode
}) {
  return (
    <View style={styles.wizardCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Icon color={colors.primary} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionText}>{text}</Text>
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: [string, string][]
  onChange: (value: string) => void
}) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map(([optionValue, text]) => (
          <Pressable
            key={optionValue}
            style={[
              styles.choice,
              value === optionValue && styles.choiceActive,
            ]}
            onPress={() => onChange(optionValue)}
          >
            <Text
              style={[
                styles.choiceText,
                value === optionValue && styles.choiceTextActive,
              ]}
            >
              {text}
            </Text>
          </Pressable>
        ))}
      </View>
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
      style={[styles.action, disabled && styles.buttonDisabled]}
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  add: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
  },
  searchInput: { flex: 1, color: colors.text },
  list: { gap: 12, paddingBottom: 44 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow,
  },
  row: {
    flexDirection: 'row',
    gap: 11,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  avatar: { width: 52, height: 62, borderRadius: 14 },
  avatarFallback: {
    width: 52,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: { color: colors.textSoft, fontSize: 10, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
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
  progressTrack: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressSegmentActive: { backgroundColor: colors.primary },
  modalContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  requiredLegend: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  wizardCard: {
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
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
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  sectionText: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  sectionBody: { gap: spacing.lg },
  readOnlyCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  readOnlyLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  readOnlyValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  createHouseholdButton: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  createHouseholdTitle: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  createHouseholdText: { color: colors.muted, fontSize: 9, marginTop: 3 },
  photoBox: {
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  photo: { width: 170, height: 220, borderRadius: 22 },
  photoPlaceholder: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  photoRequiredText: { color: colors.text, fontWeight: '900', fontSize: 14 },
  photoHint: { color: colors.muted, fontSize: 10, textAlign: 'center' },
  photoActions: { flexDirection: 'row', gap: 10, width: '100%' },
  photoActionsSmall: { flexDirection: 'column' },
  photoButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  photoButtonPrimary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  photoText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  removePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.dangerSoft,
  },
  removePhotoText: { color: colors.danger, fontWeight: '800', fontSize: 10 },
  choiceGroup: { gap: 8 },
  choiceLabel: { fontSize: 12, fontWeight: '700', color: colors.textSoft },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  choiceActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  choiceText: { color: colors.textSoft, fontSize: 11, fontWeight: '700' },
  choiceTextActive: { color: colors.primary, fontWeight: '900' },
  ageResult: {
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ageLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  ageStrong: { marginTop: 4, color: colors.text, fontWeight: '900' },
  ageValue: { marginTop: 3, color: colors.accent, fontWeight: '900' },
  informationCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  informationText: { color: colors.textSoft, fontSize: 11, lineHeight: 17 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  reviewPhoto: { width: 64, height: 82, borderRadius: 15 },
  reviewName: { color: colors.text, fontWeight: '900', fontSize: 16 },
  reviewLine: { color: colors.muted, fontSize: 10 },
  wizardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previousButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  previousText: { fontWeight: '800', color: colors.textSoft, fontSize: 11 },
  nextButton: { flex: 1 },
  buttonDisabled: { opacity: 0.45 },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: radius.sm,
  },
})
