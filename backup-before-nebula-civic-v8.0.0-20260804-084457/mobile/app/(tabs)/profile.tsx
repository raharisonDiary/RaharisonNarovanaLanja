import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import {
  Camera,
  Check,
  ChevronRight,
  Globe2,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import { AuroraBackground, AuroraCard, GradientSurface } from '../../src/components/AuroraSurface'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { usePreferences, type MobileLanguage, type MobileTheme } from '../../src/preferences/PreferencesContext'
import { radius, spacing } from '../../src/styles/theme'
import { surfaceShadow, useCensusTheme } from '../../src/styles/censusTheme'

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const { t, language, setLanguage, theme, setTheme } = usePreferences()
  const { palette, isDark } = useCensusTheme()
  const { width } = useWindowDimensions()
  const router = useRouter()
  const wide = width >= 860

  const [photo, setPhoto] = useState('')
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phoneNumber ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void AsyncStorage.getItem(`census.photo.${user?.id}`).then((value) => setPhoto(value ?? ''))
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setPhone(user.phoneNumber ?? '')
  }, [user])

  const exit = async () => {
    await logout()
    router.replace('/')
  }

  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.75, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && user) {
      const uri = result.assets[0].uri
      setPhoto(uri)
      await AsyncStorage.setItem(`census.photo.${user.id}`, uri)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const next = await mobileApi.updateProfile({ firstName, lastName, email, phoneNumber: phone || null })
      await updateUser(next)
      setMessage(t('profileUpdated'))
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  const contactRows = [
    { icon: Mail, label: t('email'), value: user?.email ?? '—' },
    { icon: Phone, label: t('whatsapp'), value: user?.phoneNumber ?? t('notProvided') },
    { icon: MapPin, label: t('adminArea'), value: user?.administrativeAreaId ?? t('notAssigned') },
  ]

  return (
    <AuroraBackground>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, wide && styles.contentWide]} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Compte personnel" title={t('profile')} subtitle={t('accountAppearance')} />

        <GradientSurface variant="hero" style={styles.profileHero}>
          <View style={[styles.heroInner, wide && styles.heroInnerWide]}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <UserRound color="#FFFFFF" size={48} />}
              </View>
              <Pressable accessibilityLabel="Modifier la photo" style={[styles.camera, { backgroundColor: palette.accent }]} onPress={() => void choose()}>
                <Camera color="#FFFFFF" size={17} />
              </Pressable>
            </View>

            <View style={[styles.profileCopy, wide && styles.profileCopyWide]}>
              <Text style={styles.heroEyebrow}>PROFIL SÉCURISÉ</Text>
              <Text style={styles.name}>{user?.fullName || `${firstName} ${lastName}`.trim() || 'Utilisateur'}</Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              <View style={styles.role}>
                <ShieldCheck color="#8FF0DF" size={16} />
                <Text style={styles.roleText}>{user?.role ?? 'Census Flow'}</Text>
              </View>
            </View>
          </View>
        </GradientSurface>

        <View style={[styles.grid, wide && styles.gridWide]}>
          <View style={[styles.column, wide && styles.columnWide]}>
            <AuroraCard style={styles.card}>
              <SectionHeading title="Coordonnées" subtitle="Informations liées à votre compte" icon={Mail} tone={palette.primary} soft={palette.primarySoft} />
              <View style={styles.infoList}>
                {contactRows.map((item) => <Info key={item.label} {...item} />)}
              </View>
            </AuroraCard>

            <AuroraCard style={styles.card}>
              <SectionHeading title="Préférences" subtitle="Langue et apparence de l’application" icon={Globe2} tone={palette.secondary} soft={palette.secondarySoft} />

              <Text style={[styles.groupLabel, { color: palette.textSecondary }]}>{t('language')}</Text>
              <View style={styles.choices}>
                {([['mg', 'Malagasy'], ['fr', 'Français'], ['en', 'English']] as [MobileLanguage, string][]).map(([value, label]) => (
                  <PreferenceChoice key={value} label={label} selected={language === value} icon={Globe2} onPress={() => setLanguage(value)} />
                ))}
              </View>

              <Text style={[styles.groupLabel, { color: palette.textSecondary }]}>{t('theme')}</Text>
              <View style={styles.choices}>
                {([['light', t('light'), Sun], ['dark', t('dark'), Moon], ['system', t('system'), Globe2]] as [MobileTheme, string, typeof Sun][]).map(([value, label, Icon]) => (
                  <PreferenceChoice key={value} label={label} selected={theme === value} icon={Icon} onPress={() => setTheme(value)} />
                ))}
              </View>
            </AuroraCard>
          </View>

          <View style={[styles.column, wide && styles.columnWide]}>
            <AuroraCard style={styles.card}>
              <SectionHeading title={t('editProfile')} subtitle="Mettez à jour vos informations personnelles" icon={UserRound} tone={palette.accent} soft={palette.accentSoft} />
              <FormField label={t('firstName')} value={firstName} onChangeText={setFirstName} />
              <FormField label={t('lastName')} value={lastName} onChangeText={setLastName} />
              <FormField label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <FormField label={t('whatsapp')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              {message ? <View style={[styles.feedback, { backgroundColor: palette.successSoft, borderColor: palette.success }]}><Check color={palette.success} size={16} /><Text style={[styles.feedbackText, { color: palette.success }]}>{message}</Text></View> : null}
              {error ? <View style={[styles.feedback, { backgroundColor: palette.dangerSoft, borderColor: palette.danger }]}><Text style={[styles.feedbackText, { color: palette.danger }]}>{error}</Text></View> : null}

              <PrimaryButton title={t('save')} icon={Save} loading={saving} onPress={() => void saveProfile()} />
            </AuroraCard>

            <Pressable onPress={() => void exit()} style={({ pressed }) => [styles.logout, { backgroundColor: palette.surface, borderColor: palette.border }, surfaceShadow(isDark), pressed && { opacity: 0.82 }]}>
              <View style={[styles.logoutIcon, { backgroundColor: palette.dangerSoft }]}><LogOut color={palette.danger} size={19} /></View>
              <View style={styles.logoutTextWrap}>
                <Text style={[styles.logoutTitle, { color: palette.danger }]}>{t('logout')}</Text>
                <Text style={[styles.logoutHint, { color: palette.textMuted }]}>Fermer votre session sur cet appareil</Text>
              </View>
              <ChevronRight color={palette.textMuted} size={18} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AuroraBackground>
  )
}

function SectionHeading({ title, subtitle, icon: Icon, tone, soft }: { title: string; subtitle: string; icon: typeof Mail; tone: string; soft: string }) {
  const { palette } = useCensusTheme()
  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.sectionIcon, { backgroundColor: soft }]}><Icon color={tone} size={20} /></View>
      <View style={styles.sectionHeadingText}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.cardHint, { color: palette.textMuted }]}>{subtitle}</Text>
      </View>
    </View>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  const { palette } = useCensusTheme()
  return (
    <View style={[styles.info, { backgroundColor: palette.surfaceSubtle, borderColor: palette.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: palette.primarySoft }]}><Icon color={palette.primary} size={19} /></View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: palette.textMuted }]}>{label}</Text>
        <Text numberOfLines={2} style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
      </View>
      <ChevronRight color={palette.textMuted} size={17} />
    </View>
  )
}

function PreferenceChoice({ label, selected, icon: Icon, onPress }: { label: string; selected: boolean; icon: typeof Sun; onPress: () => void }) {
  const { palette } = useCensusTheme()
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.choice, { backgroundColor: selected ? palette.primarySoft : palette.surfaceSubtle, borderColor: selected ? palette.primaryBorder : palette.border }, pressed && { opacity: 0.82 }]}>
      <View style={[styles.choiceIcon, { backgroundColor: selected ? palette.primary : palette.surfaceStrong }]}><Icon color={selected ? palette.inverseText : palette.textSecondary} size={16} /></View>
      <Text style={[styles.choiceText, { color: selected ? palette.primary : palette.textSecondary }]}>{label}</Text>
      {selected ? <Check color={palette.primary} size={15} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 72 },
  contentWide: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.xl },
  profileHero: { minHeight: 190, borderRadius: radius.xl },
  heroInner: { minHeight: 190, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 15 },
  heroInnerWide: { flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 38, gap: 24 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.72)' },
  photo: { width: '100%', height: '100%' },
  camera: { position: 'absolute', right: -7, bottom: -6, width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  profileCopy: { alignItems: 'center' },
  profileCopyWide: { alignItems: 'flex-start' },
  heroEyebrow: { color: '#9DD9FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  name: { fontSize: 24, lineHeight: 30, fontWeight: '900', color: '#FFFFFF', marginTop: 5, textAlign: 'center' },
  heroEmail: { fontSize: 12, color: '#DCE8FF', marginTop: 4 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11, borderRadius: radius.pill, backgroundColor: 'rgba(4,14,35,0.30)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 11, paddingVertical: 7 },
  roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  grid: { gap: spacing.lg },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { gap: spacing.lg },
  columnWide: { flex: 1 },
  card: { padding: spacing.lg, gap: 15 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 2 },
  sectionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionHeadingText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardHint: { fontSize: 10, marginTop: 3, lineHeight: 15 },
  infoList: { gap: 9 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9 },
  infoIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, minWidth: 0 },
  infoLabel: { fontSize: 9, fontWeight: '700' },
  infoValue: { fontSize: 12, fontWeight: '900', marginTop: 3, lineHeight: 17 },
  groupLabel: { fontSize: 11, fontWeight: '900', marginTop: 3 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minWidth: 118, flexGrow: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 9 },
  choiceIcon: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  choiceText: { flex: 1, fontSize: 11, fontWeight: '900' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: radius.md, padding: 12 },
  feedbackText: { flex: 1, fontSize: 11, fontWeight: '800' },
  logout: { minHeight: 68, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  logoutTextWrap: { flex: 1 },
  logoutTitle: { fontSize: 13, fontWeight: '900' },
  logoutHint: { fontSize: 9, marginTop: 3 },
})
