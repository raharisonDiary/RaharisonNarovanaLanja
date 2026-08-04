import { useRouter } from 'expo-router'
import {
  BarChart3, Building2, ClipboardList, FileBarChart, MapPinned,
  ScrollText, Settings, UserRound, Users, UsersRound,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthContext'
import ScreenHeader from '../../src/components/ScreenHeader'
import { tr } from '../../src/i18n/text'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import { colors, radius, softShadow, spacing } from '../../src/styles/theme'
import { canProvisionUsers, canSeeAudit } from '../../src/utils/permissions'

type Item = { label: string; path: string; icon: LucideIcon; visible?: boolean }

export default function MoreScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = usePreferences()
  const manager = user?.role !== 'Enumerator'
  const items: Item[] = [
    { label: tr(language, 'Habitations', 'Trano', 'Dwellings'), path: '/dwellings', icon: Building2 },
    { label: tr(language, 'Citoyens', 'Olom-pirenena', 'Citizens'), path: '/persons', icon: UserRound },
    { label: tr(language, 'Campagnes', 'Fanisana', 'Campaigns'), path: '/campaigns', icon: ClipboardList, visible: manager },
    { label: tr(language, 'Territoires', 'Faritra', 'Territories'), path: '/territories', icon: MapPinned, visible: manager },
    { label: tr(language, 'Statistiques', 'Antontanisa', 'Statistics'), path: '/statistics', icon: BarChart3, visible: manager },
    { label: tr(language, 'Rapports', 'Tatitra', 'Reports'), path: '/reports', icon: FileBarChart, visible: manager },
    { label: tr(language, 'Utilisateurs', 'Mpampiasa', 'Users'), path: '/users', icon: Users, visible: canProvisionUsers(user?.role) },
    { label: tr(language, 'Journal d’audit', 'Tatitry ny fanaraha-maso', 'Audit log'), path: '/audit', icon: ScrollText, visible: canSeeAudit(user?.role) },
    { label: tr(language, 'Profil et réglages', 'Mombamomba sy fikirakirana', 'Profile and settings'), path: '/profile', icon: Settings },
    { label: tr(language, 'Ménages', 'Tokantrano', 'Households'), path: '/households', icon: UsersRound },
  ].filter((item) => item.visible !== false)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader
        title={tr(language, 'Tous les modules', 'Ireo fizarana rehetra', 'All modules')}
        subtitle={tr(language, 'Les mêmes fonctions que sur le web, adaptées au mobile.', 'Mitovy amin’ny web fa natao ho an’ny finday.', 'The same web features, adapted for mobile.')}
      />
      <View style={styles.grid}>
        {items.map(({ label, path, icon: Icon }) => (
          <Pressable key={path} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push(path as never)}>
            <View style={styles.icon}><Icon color={colors.primary} size={24} /></View>
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 116 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    position: 'relative',
    overflow: 'hidden',
    width: '48%',
    minHeight: 142,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...softShadow,
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.88 },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMist,
  },
  label: { color: colors.text, fontWeight: '900', fontSize: 14, lineHeight: 19 },
})
