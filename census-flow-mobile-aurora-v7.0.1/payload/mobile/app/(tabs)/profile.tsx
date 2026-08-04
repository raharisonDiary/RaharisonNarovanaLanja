import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import {
  Camera,
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
  View,
} from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import {
  AuroraBackground,
  AuroraCard,
  GradientSurface,
} from '../../src/components/AuroraSurface'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import {
  usePreferences,
  type MobileLanguage,
  type MobileTheme,
} from '../../src/preferences/PreferencesContext'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
  spacing,
} from '../../src/styles/theme'

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const { t, language, setLanguage, theme, setTheme } = usePreferences()
  const router = useRouter()
  const [photo, setPhoto] = useState('')
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phoneNumber ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void AsyncStorage.getItem(`census.photo.${user?.id}`).then((value) =>
      setPhoto(value ?? ''),
    )
  }, [user?.id])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setPhone(user.phoneNumber ?? '')
    }
  }, [user])

  const exit = async () => {
    await logout()
    router.replace('/')
  }

  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (!result.canceled && user) {
      setPhoto(result.assets[0].uri)
      await AsyncStorage.setItem(
        `census.photo.${user.id}`,
        result.assets[0].uri,
      )
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const next = await mobileApi.updateProfile({
        firstName,
        lastName,
        email,
        phoneNumber: phone || null,
      })
      await updateUser(next)
      setMessage(t('profileUpdated'))
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuroraBackground>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Compte personnel"
          title={t('profile')}
          subtitle={t('accountAppearance')}
        />

        <GradientSurface variant="hero" style={styles.profileHero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <UserRound color="#FFFFFF" size={48} />
              )}
            </View>
            <Pressable style={styles.camera} onPress={() => void choose()}>
              <Camera color="#FFFFFF" size={16} />
            </Pressable>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user?.fullName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.role}>
              <ShieldCheck color="#5EEAD4" size={15} />
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
        </GradientSurface>

        <AuroraCard style={styles.card}>
          <Text style={styles.cardTitle}>Coordonnées</Text>
          <Info icon={Mail} label={t('email')} value={user?.email ?? '—'} />
          <Info
            icon={Phone}
            label={t('whatsapp')}
            value={user?.phoneNumber ?? t('notProvided')}
          />
          <Info
            icon={MapPin}
            label={t('adminArea')}
            value={user?.administrativeAreaId ?? t('notAssigned')}
          />
        </AuroraCard>

        <AuroraCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{t('editProfile')}</Text>
              <Text style={styles.cardHint}>Mettez à jour vos informations personnelles</Text>
            </View>
            <View style={styles.cardHeaderIcon}>
              <UserRound color={colors.primary} size={19} />
            </View>
          </View>
          <FormField
            label={t('firstName')}
            value={firstName}
            onChangeText={setFirstName}
          />
          <FormField
            label={t('lastName')}
            value={lastName}
            onChangeText={setLastName}
          />
          <FormField
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label={t('whatsapp')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            title={t('save')}
            icon={Save}
            loading={saving}
            onPress={() => void saveProfile()}
          />
        </AuroraCard>

        <AuroraCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Préférences</Text>
              <Text style={styles.cardHint}>Langue et apparence de l’application</Text>
            </View>
            <View style={styles.cardHeaderIcon}>
              <Globe2 color={colors.secondary} size={19} />
            </View>
          </View>

          <Text style={styles.groupLabel}>{t('language')}</Text>
          <View style={styles.choices}>
            {(
              [
                ['mg', 'Malagasy'],
                ['fr', 'Français'],
                ['en', 'English'],
              ] as [MobileLanguage, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                style={[styles.choice, language === value && styles.choiceActive]}
                onPress={() => setLanguage(value)}
              >
                <Globe2
                  color={language === value ? colors.primary : colors.muted}
                  size={17}
                />
                <Text
                  style={[
                    styles.choiceText,
                    language === value && styles.choiceTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.groupLabel}>{t('theme')}</Text>
          <View style={styles.choices}>
            {(
              [
                ['light', t('light'), Sun],
                ['dark', t('dark'), Moon],
                ['system', t('system'), Globe2],
              ] as [MobileTheme, string, typeof Sun][]
            ).map(([value, label, Icon]) => (
              <Pressable
                key={value}
                style={[styles.choice, theme === value && styles.choiceActive]}
                onPress={() => setTheme(value)}
              >
                <Icon
                  color={theme === value ? colors.primary : colors.muted}
                  size={17}
                />
                <Text
                  style={[
                    styles.choiceText,
                    theme === value && styles.choiceTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </AuroraCard>

        <PrimaryButton
          title={t('logout')}
          icon={LogOut}
          secondary
          onPress={() => void exit()}
        />
      </ScrollView>
    </AuroraBackground>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <View style={styles.info}>
      <View style={styles.infoIcon}>
        <Icon color={colors.primary} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <ChevronRight color={colors.muted} size={17} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 116 },
  profileHero: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...floatingShadow,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,.16)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,.68)',
  },
  photo: { width: '100%', height: '100%' },
  camera: {
    position: 'absolute',
    right: -6,
    bottom: -5,
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileCopy: { alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginTop: 14 },
  email: { fontSize: 11, color: '#DBEAFE', marginTop: 4 },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  card: {
    padding: spacing.lg,
    gap: 14,
    ...softShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: colors.text },
  cardHint: { fontSize: 9, color: colors.muted, marginTop: 3 },
  groupLabel: { fontSize: 11, fontWeight: '900', color: colors.textSoft, marginTop: 3 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceSoft,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 9, color: colors.muted },
  infoValue: { fontSize: 11, fontWeight: '900', color: colors.text, marginTop: 3 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  choiceActive: { borderColor: '#BFDBFE', backgroundColor: colors.primarySoft },
  choiceText: { fontSize: 10, fontWeight: '800', color: colors.textSoft },
  choiceTextActive: { color: colors.primary, fontWeight: '900' },
  success: {
    color: colors.successDark,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 11,
    borderRadius: radius.md,
  },
  error: {
    color: colors.dangerDark,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 11,
    borderRadius: radius.md,
  },
})
