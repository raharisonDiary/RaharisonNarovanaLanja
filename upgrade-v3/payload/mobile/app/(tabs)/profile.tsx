import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { Camera, Globe2, LogOut, Mail, MapPin, Moon, Phone, Save, ShieldCheck, Sun, UserRound } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { messageFromError } from '../../src/api/client'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import FormField from '../../src/components/FormField'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { usePreferences, type MobileLanguage, type MobileTheme } from '../../src/preferences/PreferencesContext'
import { colors, radius, spacing } from '../../src/styles/theme'

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

  useEffect(() => { void AsyncStorage.getItem(`census.photo.${user?.id}`).then((value) => setPhoto(value ?? '')) }, [user?.id])
  useEffect(() => { if (user) { setFirstName(user.firstName); setLastName(user.lastName); setEmail(user.email); setPhone(user.phoneNumber ?? '') } }, [user])

  const exit = async () => { await logout(); router.replace('/') }
  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ quality: .7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && user) { setPhoto(result.assets[0].uri); await AsyncStorage.setItem(`census.photo.${user.id}`, result.assets[0].uri) }
  }
  const saveProfile = async () => {
    setSaving(true); setMessage(''); setError('')
    try {
      const next = await mobileApi.updateProfile({ firstName, lastName, email, phoneNumber: phone || null })
      await updateUser(next)
      setMessage(t('profileUpdated'))
    } catch (exception) { setError(messageFromError(exception)) }
    finally { setSaving(false) }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <ScreenHeader title={t('profile')} subtitle={t('accountAppearance')} />
    <View style={styles.profile}><View style={styles.avatar}>{photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <UserRound color={colors.primary} size={48} />}<Pressable style={styles.camera} onPress={() => void choose()}><Camera color="white" size={16} /></Pressable></View><Text style={styles.name}>{user?.fullName}</Text><Text style={styles.email}>{user?.email}</Text><View style={styles.role}><ShieldCheck color={colors.primary} size={15} /><Text>{user?.role}</Text></View></View>
    <View style={styles.card}><Info icon={Mail} label={t('email')} value={user?.email ?? '—'} /><Info icon={Phone} label={t('whatsapp')} value={user?.phoneNumber ?? t('notProvided')} /><Info icon={MapPin} label={t('adminArea')} value={user?.administrativeAreaId ?? t('notAssigned')} /></View>
    <View style={styles.card}><Text style={styles.cardTitle}>{t('editProfile')}</Text><FormField label={t('firstName')} value={firstName} onChangeText={setFirstName} /><FormField label={t('lastName')} value={lastName} onChangeText={setLastName} /><FormField label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><FormField label={t('whatsapp')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />{message ? <Text style={styles.success}>{message}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton title={t('save')} icon={Save} loading={saving} onPress={() => void saveProfile()} /></View>
    <View style={styles.card}><Text style={styles.cardTitle}>{t('language')}</Text><View style={styles.choices}>{([['mg', 'Malagasy'], ['fr', 'Français'], ['en', 'English']] as [MobileLanguage, string][]).map(([value, label]) => <Pressable key={value} style={[styles.choice, language === value && styles.choiceActive]} onPress={() => setLanguage(value)}><Globe2 color={language === value ? colors.primary : colors.muted} size={17} /><Text style={[styles.choiceText, language === value && styles.choiceTextActive]}>{label}</Text></Pressable>)}</View><Text style={styles.cardTitle}>{t('theme')}</Text><View style={styles.choices}>{([['light', t('light'), Sun], ['dark', t('dark'), Moon], ['system', t('system'), Globe2]] as [MobileTheme, string, typeof Sun][]).map(([value, label, Icon]) => <Pressable key={value} style={[styles.choice, theme === value && styles.choiceActive]} onPress={() => setTheme(value)}><Icon color={theme === value ? colors.primary : colors.muted} size={17} /><Text style={[styles.choiceText, theme === value && styles.choiceTextActive]}>{label}</Text></Pressable>)}</View></View>
    <PrimaryButton title={t('logout')} icon={LogOut} secondary onPress={() => void exit()} />
  </ScrollView>
}
function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <View style={styles.info}><View style={styles.infoIcon}><Icon color={colors.primary} size={19} /></View><View style={{ flex: 1 }}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View> }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 110 }, profile: { alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xl }, avatar: { position: 'relative', width: 112, height: 112, borderRadius: 35, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, photo: { width: '100%', height: '100%' }, camera: { position: 'absolute', right: 5, bottom: 5, width: 36, height: 36, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }, name: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 14 }, email: { fontSize: 12, color: colors.muted, marginTop: 4 }, role: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, borderRadius: 999, backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 6 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 14 }, cardTitle: { fontSize: 12, fontWeight: '900', color: colors.textSoft }, info: { flexDirection: 'row', alignItems: 'center', gap: 12 }, infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, infoLabel: { fontSize: 10, color: colors.muted }, infoValue: { fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 3 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }, choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, choiceText: { fontSize: 10, fontWeight: '700', color: colors.textSoft }, choiceTextActive: { color: colors.primary, fontWeight: '900' }, success: { color: colors.success, backgroundColor: colors.successSoft, padding: 10, borderRadius: 10 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 } })
