import type { LucideIcon } from 'lucide-react-native'
import {
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  Home,
  Languages,
  LogOut,
  MapPinned,
  Menu,
  Moon,
  RefreshCw,
  ScrollText,
  Settings,
  Sun,
  UserRound,
  Users,
  UsersRound,
  X,
} from 'lucide-react-native'
import { usePathname, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useAuth } from '../auth/AuthContext'
import { tr } from '../i18n/text'
import { usePreferences, type MobileTheme } from '../preferences/PreferencesContext'
import { useCensusTheme, type CensusPalette } from '../styles/censusTheme'
import { canProvisionUsers, canSeeAudit } from '../utils/permissions'
import Brand from './Brand'

export { useCensusTheme as useResolvedCensusTheme } from '../styles/censusTheme'

type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  visible?: boolean
  activePrefixes: string[]
}

function NavRow({ item, active, palette, onPress }: { item: NavigationItem; active: boolean; palette: CensusPalette; onPress: () => void }) {
  const Icon = item.icon
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        active && { backgroundColor: 'rgba(120,169,255,0.16)' },
        pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
      ]}
    >
      <View style={[styles.navIcon, { backgroundColor: active ? palette.sidebarAccent : 'rgba(255,255,255,0.07)', borderColor: active ? palette.sidebarAccent : 'rgba(255,255,255,0.10)' }]}>
        <Icon color={active ? '#07111F' : palette.sidebarMuted} size={19} strokeWidth={active ? 2.6 : 2.1} />
      </View>
      <Text numberOfLines={1} style={[styles.navLabel, { color: active ? '#FFFFFF' : palette.sidebarText }]}>{item.label}</Text>
      <ChevronRight color={active ? palette.sidebarAccent : '#62738B'} size={15} />
    </Pressable>
  )
}

function ThemeChooser({ palette }: { palette: CensusPalette }) {
  const { theme, setTheme, language, setLanguage } = usePreferences()
  const themes: Array<{ value: MobileTheme; label: string; icon: LucideIcon }> = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Auto', icon: Settings },
  ]

  return (
    <View style={[styles.preferences, { backgroundColor: palette.sidebarSecondary, borderColor: 'rgba(255,255,255,0.10)' }]}>
      <Text style={[styles.preferenceTitle, { color: palette.sidebarText }]}>Apparence</Text>
      <View style={styles.themeRow}>
        {themes.map(({ value, label, icon: Icon }) => {
          const selected = theme === value
          return (
            <Pressable
              key={value}
              onPress={() => setTheme(value)}
              style={({ pressed }) => [
                styles.themeButton,
                {
                  backgroundColor: selected ? palette.sidebarAccent : 'rgba(255,255,255,0.05)',
                  borderColor: selected ? palette.sidebarAccent : 'rgba(255,255,255,0.10)',
                },
                pressed && { opacity: 0.82 },
              ]}
            >
              <Icon color={selected ? '#07111F' : palette.sidebarMuted} size={14} />
              <Text style={[styles.themeText, { color: selected ? '#07111F' : palette.sidebarMuted }]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>

      <View style={[styles.languageRow, { borderTopColor: 'rgba(255,255,255,0.10)' }]}>
        <Languages color={palette.sidebarMuted} size={17} />
        {(['fr', 'mg', 'en'] as const).map((value) => {
          const selected = language === value
          return (
            <Pressable key={value} onPress={() => setLanguage(value)} style={[styles.languageButton, selected && { backgroundColor: 'rgba(120,169,255,0.16)' }]}>
              <Text style={[styles.languageText, { color: selected ? palette.sidebarAccent : palette.sidebarMuted }]}>{value.toUpperCase()}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function SidebarBody({ palette, close }: { palette: CensusPalette; close?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { language } = usePreferences()
  const manager = user?.role !== 'Enumerator'

  const navigation = useMemo<NavigationItem[]>(() => [
    { label: tr(language, 'Tableau de bord', 'Fandraisana', 'Dashboard'), path: '/(tabs)', icon: Home, activePrefixes: ['/', '/(tabs)'] },
    { label: tr(language, 'Ménages', 'Tokantrano', 'Households'), path: '/(tabs)/households', icon: UsersRound, activePrefixes: ['/households'] },
    { label: tr(language, 'Habitations', 'Trano', 'Dwellings'), path: '/dwellings', icon: Building2, activePrefixes: ['/dwellings'] },
    { label: tr(language, 'Citoyens', 'Olom-pirenena', 'Citizens'), path: '/persons', icon: UserRound, activePrefixes: ['/persons'] },
    { label: tr(language, 'Carte', 'Sarintany', 'Map'), path: '/(tabs)/map', icon: MapPinned, activePrefixes: ['/map'] },
    { label: tr(language, 'Synchronisation', 'Fampifanarahana', 'Synchronization'), path: '/(tabs)/sync', icon: RefreshCw, activePrefixes: ['/sync'] },
    { label: tr(language, 'Campagnes', 'Fanisana', 'Campaigns'), path: '/campaigns', icon: ClipboardList, activePrefixes: ['/campaigns'], visible: manager },
    { label: tr(language, 'Territoires', 'Faritra', 'Territories'), path: '/territories', icon: MapPinned, activePrefixes: ['/territories'], visible: manager },
    { label: tr(language, 'Statistiques', 'Antontanisa', 'Statistics'), path: '/statistics', icon: BarChart3, activePrefixes: ['/statistics'], visible: manager },
    { label: tr(language, 'Rapports', 'Tatitra', 'Reports'), path: '/reports', icon: FileBarChart, activePrefixes: ['/reports'], visible: manager },
    { label: tr(language, 'Utilisateurs', 'Mpampiasa', 'Users'), path: '/users', icon: Users, activePrefixes: ['/users'], visible: canProvisionUsers(user?.role) },
    { label: tr(language, 'Journal d’audit', 'Tatitry ny fanaraha-maso', 'Audit log'), path: '/audit', icon: ScrollText, activePrefixes: ['/audit'], visible: canSeeAudit(user?.role) },
    { label: tr(language, 'Profil et réglages', 'Mombamomba', 'Profile and settings'), path: '/(tabs)/profile', icon: Settings, activePrefixes: ['/profile'] },
  ].filter((item) => item.visible !== false), [language, manager, user?.role])

  const navigate = (path: string) => {
    close?.()
    router.push(path as never)
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.trim() || user?.email?.[0] || 'U'

  return (
    <SafeAreaView style={[styles.sidebar, { backgroundColor: palette.sidebar, borderColor: 'rgba(255,255,255,0.08)' }]}>
      <View style={[styles.brandArea, { borderBottomColor: 'rgba(255,255,255,0.08)' }]}>
        <View style={styles.brandCopy}>
          <Brand compact inverse />
          <View>
            <Text style={[styles.brandTitle, { color: palette.sidebarText }]}>Census Flow</Text>
            <Text style={[styles.brandSubtitle, { color: palette.sidebarMuted }]}>Collecte et pilotage</Text>
          </View>
        </View>
        {close ? <Pressable onPress={close} style={styles.closeButton}><X color={palette.sidebarText} size={20} /></Pressable> : null}
      </View>

      <View style={[styles.userCard, { backgroundColor: palette.sidebarSecondary, borderColor: 'rgba(255,255,255,0.10)' }]}>
        <View style={[styles.avatar, { backgroundColor: palette.sidebarAccent }]}><Text style={styles.avatarText}>{initials.toUpperCase()}</Text></View>
        <View style={styles.userTextWrap}>
          <Text numberOfLines={1} style={[styles.userName, { color: palette.sidebarText }]}>{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Utilisateur'}</Text>
          <Text numberOfLines={1} style={[styles.userRole, { color: palette.sidebarMuted }]}>{user?.role ?? 'Census Flow'}</Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: '#6F829C' }]}>NAVIGATION</Text>
      <ScrollView contentContainerStyle={styles.navigation} showsVerticalScrollIndicator={false}>
        {navigation.map((item) => {
          const active = item.activePrefixes.some((prefix) => prefix === '/' ? pathname === '/' : pathname.startsWith(prefix))
          return <NavRow key={`${item.path}-${item.label}`} item={item} active={active} palette={palette} onPress={() => navigate(item.path)} />
        })}
      </ScrollView>

      <ThemeChooser palette={palette} />

      <Pressable onPress={() => void logout()} style={({ pressed }) => [styles.logout, { borderColor: 'rgba(255,135,145,0.26)', backgroundColor: 'rgba(255,135,145,0.08)' }, pressed && { opacity: 0.76 }]}>
        <LogOut color="#FF9AA3" size={18} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default function CensusSidebarShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions()
  const [open, setOpen] = useState(false)
  const { palette, isDark } = useCensusTheme()
  const { setTheme } = usePreferences()
  const desktop = width >= 980

  return (
    <View style={[styles.shell, { backgroundColor: palette.page }]}>
      {desktop ? <View style={styles.desktopSidebar}><SidebarBody palette={palette} /></View> : null}

      <View style={[styles.main, { backgroundColor: palette.page }]}>
        {!desktop ? (
          <View style={[styles.mobileTopbar, { backgroundColor: palette.topbar, borderBottomColor: 'rgba(255,255,255,0.08)' }]}>
            <Pressable onPress={() => setOpen(true)} style={styles.menuButton}><Menu color="#FFFFFF" size={22} /></Pressable>
            <View style={styles.mobileTitleWrap}>
              <Text style={styles.mobileTitle}>Census Flow</Text>
              <Text style={styles.mobileSubtitle}>Collecte et pilotage</Text>
            </View>
            <Pressable accessibilityLabel="Basculer le thème" onPress={() => setTheme(isDark ? 'light' : 'dark')} style={styles.modeIndicator}>
              {isDark ? <Sun color="#9CC3FF" size={17} /> : <Moon color="#9CC3FF" size={17} />}
            </Pressable>
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>

      {!desktop ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={[styles.overlay, { backgroundColor: palette.overlay }]} onPress={() => setOpen(false)} />
            <View style={[styles.drawer, { backgroundColor: palette.sidebar }, Platform.OS === 'web' ? ({ boxShadow: '14px 0 42px rgba(0,0,0,0.38)' } as never) : { shadowColor: '#000000' }]}>
              <SidebarBody palette={palette} close={() => setOpen(false)} />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row' },
  desktopSidebar: { width: 292, flexShrink: 0 },
  main: { flex: 1, minWidth: 0 },
  content: { flex: 1 },
  sidebar: { flex: 1, borderRightWidth: 1, paddingHorizontal: 14, paddingBottom: Platform.OS === 'ios' ? 10 : 14 },
  brandArea: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingHorizontal: 4 },
  brandCopy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTitle: { fontSize: 14, fontWeight: '900' },
  brandSubtitle: { fontSize: 9, marginTop: 2, fontWeight: '700' },
  closeButton: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
  userCard: { marginTop: 14, padding: 12, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#07111F', fontSize: 16, fontWeight: '900' },
  userTextWrap: { flex: 1, minWidth: 0 },
  userName: { fontWeight: '900', fontSize: 13 },
  userRole: { fontSize: 10, marginTop: 3, fontWeight: '700' },
  sectionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 17, marginBottom: 7, paddingHorizontal: 8 },
  navigation: { gap: 5, paddingBottom: 12 },
  navRow: { minHeight: 50, borderRadius: 14, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  navIcon: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 12.5, fontWeight: '800' },
  preferences: { borderWidth: 1, borderRadius: 18, padding: 10, marginTop: 3 },
  preferenceTitle: { fontSize: 11, fontWeight: '900', marginBottom: 8, paddingHorizontal: 2 },
  themeRow: { flexDirection: 'row', gap: 6 },
  themeButton: { flex: 1, minHeight: 36, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  themeText: { fontSize: 9, fontWeight: '900' },
  languageRow: { marginTop: 10, paddingTop: 9, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  languageButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  languageText: { fontSize: 10, fontWeight: '900' },
  logout: { minHeight: 46, marginTop: 10, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: '#FF9AA3', fontSize: 12, fontWeight: '900' },
  mobileTopbar: { minHeight: 66, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 11, zIndex: 10 },
  menuButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(120,169,255,0.16)', borderWidth: 1, borderColor: 'rgba(120,169,255,0.24)' },
  mobileTitleWrap: { flex: 1 },
  mobileTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  mobileSubtitle: { color: '#9FB0C8', fontSize: 10, marginTop: 2, fontWeight: '700' },
  modeIndicator: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  modalRoot: { flex: 1, flexDirection: 'row' },
  overlay: { ...StyleSheet.absoluteFill },
  drawer: { width: '88%', maxWidth: 350, elevation: 24, shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.35, shadowRadius: 30 },
})
