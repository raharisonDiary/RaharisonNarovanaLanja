import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Building2, Camera, Check, ChevronLeft, ChevronRight, ImagePlus, LocateFixed, Plus, RefreshCw, Save, Trash2, UserRound, UsersRound } from 'lucide-react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import SelectField from '../../src/components/SelectField'
import { enqueueBundle, getQueueItem } from '../../src/storage/database'
import { colors, radius, shadow, spacing } from '../../src/styles/theme'
import type { AdministrativeAreaDto, CampaignDto, CensusBundle, CitizenDraft, MaritalStatus, PersonSex, RelationshipToHead } from '../../src/types/api'
import { usePreferences } from '../../src/preferences/PreferencesContext'

const randomCode = (prefix: string) => `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
const childOptions = (areas: AdministrativeAreaDto[], parentId: string, type: string) => areas.filter((item) => item.parentId === parentId && item.type === type).map((item) => ({ label: item.name, value: item.id }))
const emptyCitizen = (number: number): CitizenDraft => ({ localId: `${Date.now()}-${number}`, firstName: '', lastName: '', sex: 'Female', birthDateMode: 'exact', dateOfBirth: '', birthPlace: '', relationshipToHead: number === 1 ? 'Head' : 'Child', maritalStatus: 'Single', nationality: 'Malagasy', occupation: '', childrenCount: null, hasNoNationalId: false })

export default function NewHouseholdScreen() {
  const router = useRouter()
  const { t } = usePreferences()
  const { width } = useWindowDimensions()
  const contentOpacity = useRef(new Animated.Value(0)).current
  const contentTranslate = useRef(new Animated.Value(14)).current
  const { editId, startCitizen } = useLocalSearchParams<{ editId?: string; startCitizen?: string }>()
  const [step, setStep] = useState(0)
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [localId, setLocalId] = useState(() => editId || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const [campaignId, setCampaignId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const [fokontanyId, setFokontanyId] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [dwellingPhoto, setDwellingPhoto] = useState<string | null>(null)
  const [dwellingCode, setDwellingCode] = useState(() => randomCode('HAB'))
  const [householdCode, setHouseholdCode] = useState(() => randomCode('MNG'))
  const [headFullName, setHeadFullName] = useState('')
  const [householdType, setHouseholdType] = useState('Ordinary')
  const [phone, setPhone] = useState('')
  const [persons, setPersons] = useState<CitizenDraft[]>([])
  const [citizen, setCitizen] = useState<CitizenDraft>(() => emptyCitizen(1))
  const [unknownAdult, setUnknownAdult] = useState(false)

  useEffect(() => {
    void Promise.all([mobileApi.campaigns(), mobileApi.areas()]).then(async ([campaignRows, areaRows]) => {
      setCampaigns(campaignRows); setAreas(areaRows)
      setCampaignId(campaignRows.find((item) => item.status === 'Active')?.id ?? campaignRows[0]?.id ?? '')
      setCountryId(areaRows.find((item) => item.type === 'Country' && item.name.toLowerCase().includes('madagas'))?.id ?? areaRows.find((item) => item.type === 'Country')?.id ?? '')
      if (editId) {
        const existing = await getQueueItem(editId)
        if (existing) {
          const bundle = existing.payload
          setLocalId(bundle.localId); setCampaignId(bundle.campaignId); setCountryId(bundle.location.countryId); setRegionId(bundle.location.regionId); setDistrictId(bundle.location.districtId); setCommuneId(bundle.location.communeId); setFokontanyId(bundle.location.fokontanyId)
          setLatitude(String(bundle.location.latitude)); setLongitude(String(bundle.location.longitude)); setAccuracy(bundle.location.accuracy ?? null); setAddress(bundle.dwelling.address); setDwellingPhoto(bundle.dwelling.photoUri ?? null); setDwellingCode(bundle.dwelling.referenceCode)
          setHouseholdCode(bundle.household.referenceCode); setHouseholdType(bundle.household.householdType); setHeadFullName(bundle.household.headFullName); setPhone(bundle.household.phoneNumber); setPersons(bundle.persons); setCitizen(emptyCitizen(bundle.persons.length + 1)); if (startCitizen === 'true') setStep(3)
        }
      }
    }).catch((exception) => setError(messageFromError(exception)))
  }, [editId, startCitizen])

  useEffect(() => {
    contentOpacity.setValue(0)
    contentTranslate.setValue(14)
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentTranslate, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()
  }, [contentOpacity, contentTranslate, step])

  const countries = areas.filter((item) => item.type === 'Country').map((item) => ({ label: item.name, value: item.id }))
  const regions = childOptions(areas, countryId, 'Region')
  const districts = childOptions(areas, regionId, 'District')
  const communes = childOptions(areas, districtId, 'Commune')
  const fokontany = childOptions(areas, communeId, 'Fokontany')
  const campaign = campaigns.find((item) => item.id === campaignId)
  const areaName = (id: string) => areas.find((item) => item.id === id)?.name ?? ''
  const age = useMemo(() => {
    if (citizen.birthDateMode === 'age') return citizen.ageYears ?? null
    if (citizen.birthDateMode === 'year') return citizen.birthYear ? new Date().getFullYear() - citizen.birthYear : null
    if (citizen.birthDateMode === 'exact' && citizen.dateOfBirth) { const birth = new Date(citizen.dateOfBirth); if (!Number.isNaN(birth.getTime())) { const now = new Date(); let value = now.getFullYear() - birth.getFullYear(); if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) value -= 1; return value } }
    return null
  }, [citizen.ageYears, citizen.birthDateMode, citizen.birthYear, citizen.dateOfBirth])
  const adult = age === null ? unknownAdult : age >= 18
  const totalSteps = 7

  const locate = async () => {
    const permission = await Location.requestForegroundPermissionsAsync()
    if (permission.status !== 'granted') { Alert.alert(t('permissionDenied'), t('locationPermission')); return }
    const point = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    setLatitude(String(point.coords.latitude)); setLongitude(String(point.coords.longitude)); setAccuracy(point.coords.accuracy)
  }
  const applyPickedPhoto = (asset: ImagePicker.ImagePickerAsset, forCitizen: boolean) => {
    const photoDataUrl = asset.base64
      ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
      : null
    if (forCitizen) {
      setCitizen((value) => ({ ...value, photoUri: asset.uri, photoDataUrl }))
    } else {
      setDwellingPhoto(asset.uri)
    }
  }
  const takePhoto = async (forCitizen = false) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) { Alert.alert(t('permissionDenied'), t('cameraPermission')); return }
    const result = await ImagePicker.launchCameraAsync({ quality: .7, allowsEditing: true, aspect: [3, 4], base64: true })
    if (!result.canceled) applyPickedPhoto(result.assets[0], forCitizen)
  }
  const importPhoto = async (forCitizen = false) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { Alert.alert(t('permissionDenied'), t('galleryPermission')); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .7, allowsEditing: true, aspect: [3, 4], base64: true })
    if (!result.canceled) applyPickedPhoto(result.assets[0], forCitizen)
  }
  const setCitizenValue = <K extends keyof CitizenDraft>(key: K, value: CitizenDraft[K]) => setCitizen((current) => ({ ...current, [key]: value }))
  const addCitizen = () => {
    if (!citizen.photoUri || !citizen.firstName.trim() || !citizen.lastName.trim() || !citizen.birthPlace.trim()) { setError(t('requiredCitizenFields')); return }
    const normalized = { ...citizen, ageYears: citizen.birthDateMode === 'unknown' ? (adult ? 18 : 0) : citizen.birthDateMode === 'age' ? citizen.ageYears : age, nationalId: adult && !citizen.hasNoNationalId ? citizen.nationalId : '', nationalIdIssueDate: adult && !citizen.hasNoNationalId ? citizen.nationalIdIssueDate : '', nationalIdIssuePlace: adult && !citizen.hasNoNationalId ? citizen.nationalIdIssuePlace : '', childrenCount: ['Married', 'Widowed'].includes(citizen.maritalStatus) ? citizen.childrenCount : null }
    setPersons((current) => [...current, normalized]); setCitizen(emptyCitizen(persons.length + 2)); setUnknownAdult(false); setError(''); setStep(2)
  }
  const removeCitizen = (id: string) => setPersons((current) => current.filter((item) => item.localId !== id))
  const saveLocal = async () => {
    if (!campaignId || !fokontanyId || !latitude || !longitude || !headFullName.trim()) { setError(t('completeTerritory')); return }
    setSaving(true); setError('')
    const now = new Date().toISOString()
    const bundle: CensusBundle = {
      localId, campaignId, campaignName: campaign?.name ?? '', enumerationAreaId: fokontanyId,
      location: { countryId, countryName: areaName(countryId), regionId, regionName: areaName(regionId), districtId, districtName: areaName(districtId), communeId, communeName: areaName(communeId), fokontanyId, fokontanyName: areaName(fokontanyId), latitude: Number(latitude), longitude: Number(longitude), accuracy },
      dwelling: { referenceCode: dwellingCode, address, localityName: areaName(fokontanyId), latitude: Number(latitude), longitude: Number(longitude), photoUri: dwellingPhoto },
      household: { referenceCode: householdCode, householdType, headFullName: headFullName.trim(), phoneNumber: phone }, persons,
      createdAt: editId ? (await getQueueItem(editId))?.payload.createdAt ?? now : now, updatedAt: now,
    }
    try { await enqueueBundle(bundle); router.replace({ pathname: '/confirmation', params: { code: householdCode, queued: 'true', localId } }) }
    catch (exception) { setError(messageFromError(exception)) } finally { setSaving(false) }
  }

  const canContinue = () => {
    if (step === 0) return Boolean(campaignId && countryId && regionId && districtId && communeId && fokontanyId && latitude && longitude)
    if (step === 1) return Boolean(householdCode && headFullName.trim())
    if (step === 2) return true
    if (step === 3) return Boolean(citizen.photoUri)
    if (step === 4) return Boolean(citizen.firstName.trim() && citizen.lastName.trim() && citizen.birthPlace.trim())
    if (step === 5) return citizen.birthDateMode === 'unknown' || age !== null
    if (step === 6) return adult && !citizen.hasNoNationalId ? Boolean(citizen.nationalId) : true
    return true
  }

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.top}><Pressable style={styles.back} onPress={() => step > 0 ? setStep((value) => value - 1) : router.back()}><ArrowLeft color={colors.text} size={20} /></Pressable><View style={{ flex: 1 }}><Text style={styles.title}>{editId ? t('editLocalHousehold') : t('newCensus')}</Text><Text style={styles.subtitle}>{t('step')} {step + 1} {t('outOf')} {totalSteps} · {t('localSave')}</Text></View><View style={styles.localBadge}><Save color={colors.accent} size={14} /><Text>{t('local')}</Text></View></View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: `${((step + 1) / totalSteps) * 100}%` }]} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.card, { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] }]}>
        {step === 0 && <><Section icon={LocateFixed} title={`1. ${t('zoneGps')}`} text={t('zoneGpsText')} /><SelectField label={t('campaign')} value={campaignId} onChange={setCampaignId} options={campaigns.map((item) => ({ label: item.name, value: item.id }))} /><SelectField label={t('country')} value={countryId} onChange={(value) => { setCountryId(value); setRegionId(''); setDistrictId(''); setCommuneId(''); setFokontanyId('') }} options={countries} /><SelectField label={t('region')} value={regionId} onChange={(value) => { setRegionId(value); setDistrictId(''); setCommuneId(''); setFokontanyId('') }} options={regions} /><SelectField label={t('district')} value={districtId} onChange={(value) => { setDistrictId(value); setCommuneId(''); setFokontanyId('') }} options={districts} /><SelectField label={t('commune')} value={communeId} onChange={(value) => { setCommuneId(value); setFokontanyId('') }} options={communes} /><SelectField label={t('fokontany')} value={fokontanyId} onChange={setFokontanyId} options={fokontany} /><Pressable style={styles.captureButton} onPress={() => void locate()}><LocateFixed color={colors.primary} size={22} /><View><Text style={styles.captureTitle}>{latitude ? t('capturedCoordinates') : t('captureGps')}</Text><Text style={styles.captureText}>{latitude ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)} · ±${Math.round(accuracy ?? 0)} m` : t('tapOnSite')}</Text></View></Pressable><FormField label={t('addressLandmark')} value={address} onChangeText={setAddress} placeholder={t('addressPlaceholder')} /><Pressable style={styles.photoBox} onPress={() => void takePhoto(false)}>{dwellingPhoto ? <Image source={{ uri: dwellingPhoto }} style={styles.dwellingPhoto} /> : <><Camera color={colors.primary} size={28} /><Text style={styles.captureTitle}>{t('dwellingPhotoOptional')}</Text></>}</Pressable></>}
        {step === 1 && <><Section icon={Building2} title={`2. ${t('householdInfo')}`} text={t('autoCode')} /><FormField label={t('dwellingCode')} value={dwellingCode} editable={false} /><FormField label={t('householdCode')} value={householdCode} editable={false} /><FormField label={t('householdHead')} value={headFullName} onChangeText={setHeadFullName} /><SelectField label={t('householdType')} value={householdType} onChange={setHouseholdType} options={[{ label: t('ordinaryHousehold'), value: 'Ordinary' }, { label: t('collectiveHousehold'), value: 'Collective' }, { label: t('homeless'), value: 'Homeless' }]} /><FormField label={t('householdPhone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder={t('optional')} /></>}
        {step === 2 && <><Section icon={UsersRound} title={`3. ${t('citizensHousehold')}`} text={t('citizensDraftText')} />{persons.map((person, index) => <View key={person.localId} style={styles.personRow}>{person.photoUri ? <Image source={{ uri: person.photoUri }} style={styles.personThumb} /> : <View style={styles.personThumbEmpty}><UserRound color={colors.muted} size={22} /></View>}<View style={{ flex: 1 }}><Text style={styles.personName}>{index + 1}. {person.firstName} {person.lastName}</Text><Text style={styles.personMeta}>{person.ageYears ?? t('unknownAge')} {t('years')} · {person.relationshipToHead}</Text></View><Pressable onPress={() => removeCitizen(person.localId)}><Trash2 color={colors.danger} size={20} /></Pressable></View>)}<Pressable style={styles.addCitizen} onPress={() => { setCitizen(emptyCitizen(persons.length + 1)); setStep(3) }}><Plus color={colors.primary} size={20} /><Text>{t('addCitizen')}</Text></Pressable><PrimaryButton title={t('saveLocally')} icon={Save} loading={saving} onPress={() => void saveLocal()} /></>}
        {step === 3 && <><Section icon={Camera} title={t('citizenPhoto')} text={t('citizenPhotoText')} /><View style={[styles.photoSourceGrid, width < 430 && styles.photoSourceGridSmall]}><Pressable style={[styles.photoSourceButton, styles.photoSourceCamera]} onPress={() => void takePhoto(true)}><Camera color={colors.primary} size={22} /><View style={{ flex: 1 }}><Text style={styles.photoSourceTitle}>{citizen.photoUri ? t('retakePhoto') : t('takePhoto')}</Text><Text style={styles.photoSourceText}>{t('cameraSourceHint')}</Text></View></Pressable><Pressable style={styles.photoSourceButton} onPress={() => void importPhoto(true)}><ImagePlus color={colors.accent} size={22} /><View style={{ flex: 1 }}><Text style={styles.photoSourceTitle}>{t('importPhoto')}</Text><Text style={styles.photoSourceText}>{t('gallerySourceHint')}</Text></View></Pressable></View><View style={styles.citizenPhotoBox}>{citizen.photoUri ? <><Image source={{ uri: citizen.photoUri }} style={styles.citizenPhoto} /><Pressable style={styles.retakeFloating} onPress={() => void takePhoto(true)}><RefreshCw color="white" size={18} /></Pressable></> : <><View style={styles.photoEmptyIcon}><Camera color={colors.primary} size={36} /></View><Text style={styles.photoTitle}>{t('photoRequired')}</Text><Text style={styles.captureText}>{t('faceCentered')}</Text></>}</View></>}
        {step === 4 && <><Section icon={UserRound} title={t('citizenIdentity')} text={t('identityText')} /><FormField label={t('lastName')} value={citizen.lastName} onChangeText={(value) => setCitizenValue('lastName', value)} autoCapitalize="characters" /><FormField label={t('firstNames')} value={citizen.firstName} onChangeText={(value) => setCitizenValue('firstName', value)} /><SelectField label={t('sex')} value={citizen.sex} onChange={(value) => setCitizenValue('sex', value as PersonSex)} options={[{ label: t('female'), value: 'Female' }, { label: t('male'), value: 'Male' }, { label: t('otherNotStated'), value: 'NotStated' }]} /><FormField label={t('birthPlace')} value={citizen.birthPlace} onChangeText={(value) => setCitizenValue('birthPlace', value)} /></>}
        {step === 5 && <><Section icon={UserRound} title={t('citizenBirthAge')} text={t('birthAgeText')} /><Choice label={t('knownInfo')} value={citizen.birthDateMode} options={[['exact', t('exactDate')], ['year', t('yearOnly')], ['age', t('declaredAge')], ['unknown', t('unknown')]]} onChange={(value) => setCitizenValue('birthDateMode', value as CitizenDraft['birthDateMode'])} />{citizen.birthDateMode === 'exact' && <FormField label={t('birthDate')} value={citizen.dateOfBirth ?? ''} onChangeText={(value) => setCitizenValue('dateOfBirth', value)} placeholder="AAAA-MM-JJ" />}{citizen.birthDateMode === 'year' && <FormField label={t('birthYear')} value={citizen.birthYear ? String(citizen.birthYear) : ''} onChangeText={(value) => setCitizenValue('birthYear', value ? Number(value) : null)} keyboardType="number-pad" placeholder="1985" />}{citizen.birthDateMode === 'age' && <FormField label={t('declaredAge')} value={citizen.ageYears !== null && citizen.ageYears !== undefined ? String(citizen.ageYears) : ''} onChangeText={(value) => setCitizenValue('ageYears', value ? Number(value) : null)} keyboardType="number-pad" />}{citizen.birthDateMode === 'unknown' && <Choice label={t('ageCategory')} value={unknownAdult ? 'adult' : 'minor'} options={[['minor', t('under18')], ['adult', t('adult18')]]} onChange={(value) => setUnknownAdult(value === 'adult')} />}<View style={styles.ageResult}><Text>{t('automaticFilter')}</Text><Text style={styles.ageStrong}>{adult ? t('adultLabel') : t('minorLabel')}</Text></View></>}
        {step === 6 && <><Section icon={Check} title={t('citizenSituation')} text={adult ? t('cinOptional') : t('cinMinorText')} />{adult && <><Choice label={t('nationalIdCard')} value={citizen.hasNoNationalId ? 'none' : 'has'} options={[['has', t('hasId')], ['none', t('noId')]]} onChange={(value) => setCitizenValue('hasNoNationalId', value === 'none')} />{!citizen.hasNoNationalId && <><FormField label={t('nationalId')} value={citizen.nationalId ?? ''} onChangeText={(value) => setCitizenValue('nationalId', value)} keyboardType="number-pad" /><FormField label={t('issueDate')} value={citizen.nationalIdIssueDate ?? ''} onChangeText={(value) => setCitizenValue('nationalIdIssueDate', value)} placeholder="AAAA-MM-JJ" /><FormField label={t('issuePlace')} value={citizen.nationalIdIssuePlace ?? ''} onChangeText={(value) => setCitizenValue('nationalIdIssuePlace', value)} /></>}</>}<SelectField label={t('maritalStatus')} value={citizen.maritalStatus} onChange={(value) => setCitizenValue('maritalStatus', value as MaritalStatus)} options={[{ label: t('single'), value: 'Single' }, { label: t('married'), value: 'Married' }, { label: t('widowed'), value: 'Widowed' }, { label: t('divorced'), value: 'Divorced' }, { label: t('separated'), value: 'Separated' }, { label: t('neutral'), value: 'NotStated' }]} />{['Married', 'Widowed'].includes(citizen.maritalStatus) && <FormField label={t('childrenCount')} value={citizen.childrenCount !== null && citizen.childrenCount !== undefined ? String(citizen.childrenCount) : ''} onChangeText={(value) => setCitizenValue('childrenCount', value ? Number(value) : null)} keyboardType="number-pad" />}<SelectField label={t('relationship')} value={citizen.relationshipToHead} onChange={(value) => setCitizenValue('relationshipToHead', value as RelationshipToHead)} options={[{ label: t('head'), value: 'Head' }, { label: t('spouse'), value: 'Spouse' }, { label: t('child'), value: 'Child' }, { label: t('parent'), value: 'Parent' }, { label: t('sibling'), value: 'Sibling' }, { label: t('otherRelative'), value: 'OtherRelative' }, { label: t('nonRelative'), value: 'NonRelative' }]} /><FormField label={t('occupation')} value={citizen.occupation ?? ''} onChangeText={(value) => setCitizenValue('occupation', value)} placeholder={t('occupationPlaceholder')} /><FormField label={t('personalPhone')} value={citizen.phoneNumber ?? ''} onChangeText={(value) => setCitizenValue('phoneNumber', value)} keyboardType="phone-pad" placeholder={t('optional')} /><PrimaryButton title={t('addThisCitizen')} icon={Check} onPress={addCitizen} /></>}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Animated.View>
    </ScrollView>
    {step !== 2 && <View style={styles.footer}>{step > 0 ? <Pressable style={styles.previous} onPress={() => setStep((value) => value - 1)}><ChevronLeft color={colors.textSoft} size={18} /><Text style={styles.previousText}>{t('previous')}</Text></Pressable> : <View />}{step < 6 && <View style={styles.next}><PrimaryButton title={t('continue')} icon={ChevronRight} disabled={!canContinue()} onPress={() => setStep((value) => value + 1)} /></View>}</View>}
  </KeyboardAvoidingView>
}

function Section({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) { return <View style={styles.sectionHead}><View style={styles.sectionIcon}><Icon color={colors.primary} size={21} /></View><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionText}>{text}</Text></View></View> }
function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) { return <View style={{ gap: 8 }}><Text style={styles.choiceLabel}>{label}</Text><View style={styles.choiceWrap}>{options.map(([optionValue, text]) => <Pressable key={optionValue} style={[styles.choice, value === optionValue && styles.choiceActive]} onPress={() => onChange(optionValue)}><Text style={[styles.choiceText, value === optionValue && styles.choiceTextActive]}>{text}</Text></Pressable>)}</View></View> }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 12, backgroundColor: colors.white }, back: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 18, fontWeight: '900', color: colors.text }, subtitle: { fontSize: 10, color: colors.muted, marginTop: 2 }, localBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 }, progress: { height: 4, backgroundColor: colors.border }, progressFill: { height: '100%', backgroundColor: colors.primary }, content: { padding: spacing.lg, paddingBottom: 32 }, card: { gap: spacing.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, ...shadow }, sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }, sectionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft }, sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.text }, sectionText: { fontSize: 10, color: colors.muted, marginTop: 2, lineHeight: 15 }, captureButton: { minHeight: 70, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 }, captureTitle: { fontWeight: '900', color: colors.text }, captureText: { color: colors.muted, marginTop: 3, fontSize: 10 }, photoBox: { minHeight: 120, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' }, dwellingPhoto: { width: '100%', height: 170 }, citizenPhotoBox: { minHeight: 360, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, citizenPhoto: { width: '100%', height: 430 }, photoTitle: { marginTop: 10, fontSize: 16, fontWeight: '900', color: colors.text }, personRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10 }, personThumb: { width: 48, height: 48, borderRadius: 13 }, personThumbEmpty: { width: 48, height: 48, borderRadius: 13, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, personName: { fontWeight: '900', color: colors.text }, personMeta: { fontSize: 10, color: colors.muted, marginTop: 3 }, addCitizen: { minHeight: 54, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, choiceLabel: { fontSize: 12, fontWeight: '700', color: colors.textSoft }, choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.white, paddingHorizontal: 13, paddingVertical: 10 }, choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, choiceText: { color: colors.textSoft, fontSize: 11, fontWeight: '700' }, choiceTextActive: { color: colors.primary, fontWeight: '900' }, ageResult: { borderRadius: radius.md, backgroundColor: colors.accentSoft, padding: 13 }, ageStrong: { marginTop: 3, color: colors.text, fontWeight: '900' }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: radius.sm }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border }, previous: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 12 }, previousText: { fontWeight: '800', color: colors.textSoft }, next: { minWidth: 180 }, photoSourceGrid: { flexDirection: 'row', gap: 10 }, photoSourceGridSmall: { flexDirection: 'column' }, photoSourceButton: { flex: 1, minHeight: 70, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, ...shadow }, photoSourceCamera: { backgroundColor: colors.primarySoft, borderColor: colors.primary }, photoSourceTitle: { color: colors.text, fontWeight: '900', fontSize: 13 }, photoSourceText: { color: colors.muted, fontSize: 10, marginTop: 3 }, photoEmptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft }, retakeFloating: { position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(29,45,37,.78)' } })
