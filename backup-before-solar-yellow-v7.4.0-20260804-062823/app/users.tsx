import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, Mail, MessageCircle, Plus, Power, Search, Users } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
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
import type { AdministrativeAreaDto, ProvisionedUserResponse, UserDto } from '../src/types/api'

function descendants(areas: AdministrativeAreaDto[], rootId?: string | null) {
  if (!rootId) return areas
  const allowed = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const area of areas) {
      if (area.parentId && allowed.has(area.parentId) && !allowed.has(area.id)) {
        allowed.add(area.id)
        changed = true
      }
    }
  }
  return areas.filter((area) => allowed.has(area.id))
}

function deliveryLabel(language: 'fr' | 'mg' | 'en', status: string) {
  if (status === 'Sent') return tr(language, 'Envoyé', 'Nalefa', 'Sent')
  if (status === 'NotConfigured') return tr(language, 'Non configuré', 'Tsy voarindra', 'Not configured')
  return tr(language, 'Échec', 'Tsy nahomby', 'Failed')
}

export default function UsersScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = usePreferences()
  const [items, setItems] = useState<UserDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsApp, setWhatsApp] = useState('')
  const [areaId, setAreaId] = useState('')
  const [created, setCreated] = useState<ProvisionedUserResponse | null>(null)
  const targetRole = user?.role === 'RegionalSupervisor' ? 'Enumerator' : 'RegionalSupervisor'

  const load = async () => {
    setLoading(true)
    try {
      const [users, areaRows] = await Promise.all([
        mobileApi.managedUsers(search),
        mobileApi.areas(),
      ])
      setItems(users)
      setAreas(areaRows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const possibleAreas = useMemo(() => {
    const rows = descendants(
      areas,
      user?.role === 'RegionalSupervisor' ? user.administrativeAreaId : null,
    )
    return targetRole === 'RegionalSupervisor'
      ? rows.filter((area) => area.type === 'Region')
      : rows.filter((area) => ['Commune', 'Fokontany', 'EnumerationArea'].includes(area.type))
  }, [areas, targetRole, user?.administrativeAreaId, user?.role])

  const filtered = useMemo(
    () => items.filter((item) =>
      `${item.fullName} ${item.email} ${item.phoneNumber ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [items, search],
  )

  const create = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || whatsApp.trim().length < 8 || !areaId) {
      setError(tr(language, 'Complétez les informations obligatoires.', 'Fenoy ireo saha ilaina.', 'Complete required information.'))
      return
    }

    setSaving(true)
    setError('')
    try {
      const result = await mobileApi.provisionUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        whatsAppNumber: whatsApp.trim(),
        role: targetRole,
        administrativeAreaId: areaId,
      })
      setCreated(result)
      setOpen(false)
      setFirstName('')
      setLastName('')
      setEmail('')
      setWhatsApp('')
      setAreaId('')
      await load()
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setSaving(false)
    }
  }

  return <View style={styles.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}>
      <Pressable style={styles.back} onPress={() => goBackOrReplace(router, '/(tabs)/more')}><ArrowLeft color={colors.text} size={21} /></Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{tr(language, 'Utilisateurs', 'Mpampiasa', 'Users')}</Text>
        <Text style={styles.subtitle}>{targetRole === 'Enumerator' ? tr(language, 'Créer et superviser les agents.', 'Mamorona sy manara-maso mpanao fanisana.', 'Create and supervise enumerators.') : tr(language, 'Créer les chefs de région.', 'Mamorona lehiben’ny faritra.', 'Create regional supervisors.')}</Text>
      </View>
      <Pressable style={styles.add} onPress={() => setOpen(true)}><Plus color="#fff" size={21} /></Pressable>
    </View>

    <View style={styles.search}><Search color={colors.muted} size={18} /><TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => void load()} placeholder={tr(language, 'Nom, e-mail ou WhatsApp…', 'Anarana, mailaka na WhatsApp…', 'Name, email or WhatsApp…')} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>

    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : <ScrollView contentContainerStyle={styles.list}>
      {filtered.map((item) => <View key={item.id} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}><Text style={styles.initials}>{item.firstName[0]}{item.lastName[0]}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.fullName}</Text><Text style={styles.meta}>{item.email}</Text><Text style={styles.meta}>{item.phoneNumber || '—'} · {item.role}</Text></View>
          <StatusPill value={item.isActive ? tr(language, 'Actif', 'Miasa', 'Active') : tr(language, 'Inactif', 'Tsy miasa', 'Inactive')} />
        </View>
        <Pressable style={styles.statusAction} onPress={() => void mobileApi.setUserStatus(item.id, !item.isActive).then(load)}><Power color={item.isActive ? colors.danger : colors.success} size={17} /><Text style={{ color: item.isActive ? colors.danger : colors.success, fontWeight: '800', fontSize: 11 }}>{item.isActive ? tr(language, 'Désactiver', 'Atsahatra', 'Disable') : tr(language, 'Activer', 'Alefa', 'Enable')}</Text></Pressable>
      </View>)}
    </ScrollView>}

    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => setOpen(false)}><ArrowLeft color={colors.text} size={21} /></Pressable>
          <Text style={styles.title}>{targetRole === 'Enumerator' ? tr(language, 'Nouvel agent', 'Mpanao fanisana vaovao', 'New enumerator') : tr(language, 'Nouveau chef de région', 'Lehiben’ny faritra vaovao', 'New regional supervisor')}</Text>
        </View>
        <View style={styles.notice}><Mail color={colors.primary} size={21} /><Text style={styles.noticeText}>{tr(language, 'Un seul bouton crée le compte et envoie automatiquement les identifiants par e-mail et WhatsApp.', 'Bokotra iray no mamorona kaonty sy mandefa ny fidirana amin’ny mailaka sy WhatsApp.', 'One button creates the account and automatically sends credentials by email and WhatsApp.')}</Text></View>
        <FormField label={tr(language, 'Prénom', 'Fanampin’anarana', 'First name')} value={firstName} onChangeText={setFirstName} />
        <FormField label={tr(language, 'Nom', 'Anarana', 'Last name')} value={lastName} onChangeText={setLastName} />
        <FormField label={tr(language, 'Adresse e-mail réelle', 'Mailaka tena izy', 'Real email address')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <FormField label={tr(language, 'Numéro WhatsApp', 'Laharana WhatsApp', 'WhatsApp number')} value={whatsApp} onChangeText={setWhatsApp} keyboardType="phone-pad" />
        <SelectField label={tr(language, 'Affectation', 'Toerana iasana', 'Assignment')} value={areaId} onChange={setAreaId} options={possibleAreas.map((area) => ({ label: `${area.name} · ${area.type}`, value: area.id }))} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title={tr(language, 'Créer et envoyer les identifiants', 'Hamorona sy handefa ny fidirana', 'Create and send credentials')} icon={Mail} loading={saving} onPress={() => void create()} />
      </ScrollView>
    </Modal>

    <Modal visible={Boolean(created)} transparent animationType="fade" onRequestClose={() => setCreated(null)}>
      <View style={styles.overlay}>
        <View style={styles.credentials}>{created && <>
          <Users color={created.allNotificationsSent ? colors.success : colors.warning} size={38} />
          <Text style={styles.credentialsTitle}>{tr(language, 'Compte créé', 'Vita ny kaonty', 'Account created')}</Text>
          <Text style={styles.resultText}>{created.allNotificationsSent
            ? tr(language, 'Les identifiants ont été envoyés automatiquement sur les deux canaux.', 'Nalefa ho azy tamin’ny fomba roa ny fidirana.', 'Credentials were sent automatically through both channels.')
            : tr(language, 'Le compte est créé, mais un canal n’a pas confirmé l’envoi. Vérifiez la configuration.', 'Vita ny kaonty fa misy fandefasana iray tsy voamarina. Jereo ny fikirakirana.', 'The account was created, but one channel did not confirm delivery. Check configuration.')}</Text>
          <Text style={styles.credential}>{tr(language, 'Identifiant', 'Fidirana', 'Login')}: {created.generatedEmail}</Text>
          <View style={styles.deliveryRow}><Mail color={colors.primary} size={19} /><Text style={styles.deliveryName}>E-mail</Text><Text style={styles.deliveryStatus}>{deliveryLabel(language, created.emailNotificationStatus)}</Text></View>
          <View style={styles.deliveryRow}><MessageCircle color={colors.accent} size={19} /><Text style={styles.deliveryName}>WhatsApp</Text><Text style={styles.deliveryStatus}>{deliveryLabel(language, created.whatsAppNotificationStatus)}</Text></View>
          {created.temporaryPasswordFallback ? <Text style={styles.fallbackPassword}>{tr(language, 'Mot de passe de secours', 'Teny miafina vonjimaika', 'Fallback password')}: {created.temporaryPasswordFallback}</Text> : null}
          <PrimaryButton title={tr(language, 'Terminer', 'Hamarana', 'Done')} onPress={() => setCreated(null)} />
        </>}</View>
      </View>
    </Modal>
  </View>
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
  avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.primary, fontWeight: '900' },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  statusAction: { minHeight: 44, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 7 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalContent: { padding: spacing.lg, gap: 14, paddingBottom: 44 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 13 },
  noticeText: { flex: 1, color: colors.textSoft, fontSize: 11, fontWeight: '700' },
  error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,25,18,.55)', justifyContent: 'center', padding: spacing.lg },
  credentials: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, gap: 14, alignItems: 'stretch' },
  credentialsTitle: { color: colors.text, fontWeight: '900', fontSize: 20, textAlign: 'center' },
  resultText: { color: colors.muted, textAlign: 'center', fontSize: 12 },
  credential: { color: colors.text, backgroundColor: colors.background, padding: 12, borderRadius: 12 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.background, borderRadius: 12, padding: 12 },
  deliveryName: { flex: 1, color: colors.text, fontWeight: '800' },
  deliveryStatus: { color: colors.textSoft, fontWeight: '800', fontSize: 11 },
  fallbackPassword: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: 12, fontWeight: '900' },
})
