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
import { useRouter, useSegments } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
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
import { motion, nativeDriver, runRouteEnter } from '../animations/motion'
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
  routeKeys: string[]
}

function getRouteKey(segments: readonly string[]) {
  return segments.join('/')
}

function isItemActive(item: NavigationItem, routeKey: string) {
  return item.routeKeys.some((key) => routeKey === key || routeKey.startsWith(`${key}/`))
}

function NavRow({
  item,
  active,
  palette,
  onPress,
}: {
  item: NavigationItem
  active: boolean
  palette: CensusPalette
  onPress: () => void
}) {
  const Icon = item.icon

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        active && [styles.navRowActive, { backgroundColor: palette.sidebarAccent, borderColor: palette.sidebarAccent }],
        pressed && styles.navRowPressed,
      ]}
    >
      <View
        style={[
          styles.navIcon,
          {
            backgroundColor: active
              ? 'rgba(7,17,31,0.10)'
              : 'rgba(255,255,255,0.07)',
            borderColor: active
              ? 'rgba(7,17,31,0.14)'
              : 'rgba(255,255,255,0.10)',
          },
        ]}
      >
        <Icon
          color={active ? palette.inverseText : palette.sidebarMuted}
          size={19}
          strokeWidth={active ? 2.6 : 2.1}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.navLabel,
          { color: active ? palette.inverseText : palette.sidebarText },
        ]}
      >
        {item.label}
      </Text>
      <ChevronRight
        color={active ? palette.inverseText : palette.sidebarMuted}
        size={15}
      />
    </Pressable>
  )
}

function ThemeChooser({ palette }: { palette: CensusPalette }) {
  const { theme, setTheme, language, setLanguage } = usePreferences()
  const themes: Array<{
    value: MobileTheme
    label: string
    icon: LucideIcon
  }> = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Auto', icon: Settings },
  ]

  return (
    <View
      style={[
        styles.preferences,
        {
          backgroundColor: palette.sidebarSecondary,
          borderColor: 'rgba(255,255,255,0.10)',
        },
      ]}
    >
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
                  backgroundColor: selected
                    ? palette.sidebarAccent
                    : 'rgba(255,255,255,0.05)',
                  borderColor: selected
                    ? palette.sidebarAccent
                    : 'rgba(255,255,255,0.10)',
                },
                pressed && { opacity: 0.82 },
              ]}
            >
              <Icon
                color={selected ? palette.inverseText : palette.sidebarMuted}
                size={14}
              />
              <Text
                style={[
                  styles.themeText,
                  { color: selected ? palette.inverseText : palette.sidebarMuted },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View
        style={[
          styles.languageRow,
          { borderTopColor: 'rgba(255,255,255,0.10)' },
        ]}
      >
        <Languages color={palette.sidebarMuted} size={17} />
        {(['fr', 'mg', 'en'] as const).map((value) => {
          const selected = language === value
          return (
            <Pressable
              key={value}
              onPress={() => setLanguage(value)}
              style={[
                styles.languageButton,
                selected && styles.languageButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.languageText,
                  {
                    color: selected
                      ? palette.sidebarAccent
                      : palette.sidebarMuted,
                  },
                ]}
              >
                {value.toUpperCase()}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function SidebarBody({
  palette,
  close,
}: {
  palette: CensusPalette
  close?: () => void
}) {
  const segments = useSegments()
  const routeKey = getRouteKey(segments as string[])
  const router = useRouter()
  const { user, logout } = useAuth()
  const { language } = usePreferences()
  const manager = user?.role !== 'Enumerator'

  const navigation = useMemo<NavigationItem[]>(
    () =>
      [
        {
          label: tr(language, 'Tableau de bord', 'Fandraisana', 'Dashboard'),
          path: '/(tabs)',
          icon: Home,
          routeKeys: ['(tabs)'],
        },
        {
          label: tr(language, 'Ménages', 'Tokantrano', 'Households'),
          path: '/(tabs)/households',
          icon: UsersRound,
          routeKeys: ['(tabs)/households', 'households'],
        },
        {
          label: tr(language, 'Habitations', 'Trano', 'Dwellings'),
          path: '/dwellings',
          icon: Building2,
          routeKeys: ['dwellings'],
        },
        {
          label: tr(language, 'Citoyens', 'Olom-pirenena', 'Citizens'),
          path: '/persons',
          icon: UserRound,
          routeKeys: ['persons'],
        },
        {
          label: tr(language, 'Carte', 'Sarintany', 'Map'),
          path: '/(tabs)/map',
          icon: MapPinned,
          routeKeys: ['(tabs)/map'],
        },
        {
          label: tr(
            language,
            'Synchronisation',
            'Fampifanarahana',
            'Synchronization',
          ),
          path: '/(tabs)/sync',
          icon: RefreshCw,
          routeKeys: ['(tabs)/sync'],
        },
        {
          label: tr(language, 'Campagnes', 'Fanisana', 'Campaigns'),
          path: '/campaigns',
          icon: ClipboardList,
          routeKeys: ['campaigns'],
          visible: manager,
        },
        {
          label: tr(language, 'Territoires', 'Faritra', 'Territories'),
          path: '/territories',
          icon: MapPinned,
          routeKeys: ['territories'],
          visible: manager,
        },
        {
          label: tr(language, 'Statistiques', 'Antontanisa', 'Statistics'),
          path: '/statistics',
          icon: BarChart3,
          routeKeys: ['statistics'],
          visible: manager,
        },
        {
          label: tr(language, 'Rapports', 'Tatitra', 'Reports'),
          path: '/reports',
          icon: FileBarChart,
          routeKeys: ['reports'],
          visible: manager,
        },
        {
          label: tr(language, 'Utilisateurs', 'Mpampiasa', 'Users'),
          path: '/users',
          icon: Users,
          routeKeys: ['users'],
          visible: canProvisionUsers(user?.role),
        },
        {
          label: tr(
            language,
            'Journal d’audit',
            'Tatitry ny fanaraha-maso',
            'Audit log',
          ),
          path: '/audit',
          icon: ScrollText,
          routeKeys: ['audit'],
          visible: canSeeAudit(user?.role),
        },
        {
          label: tr(
            language,
            'Profil et réglages',
            'Mombamomba',
            'Profile and settings',
          ),
          path: '/(tabs)/profile',
          icon: Settings,
          routeKeys: ['(tabs)/profile'],
        },
      ].filter((item) => item.visible !== false),
    [language, manager, user?.role],
  )

  const navigate = (item: NavigationItem) => {
    if (isItemActive(item, routeKey)) {
      close?.()
      return
    }

    close?.()
    const delay = close ? 100 : 0
    setTimeout(() => router.replace(item.path as never), delay)
  }

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.trim() ||
    user?.email?.[0] ||
    'U'

  return (
    <SafeAreaView
      style={[
        styles.sidebar,
        {
          backgroundColor: palette.sidebar,
          borderColor: 'rgba(255,255,255,0.08)',
        },
      ]}
    >
      <View
        style={[
          styles.brandArea,
          { borderBottomColor: 'rgba(255,255,255,0.08)' },
        ]}
      >
        <View style={styles.brandCopy}>
          <Brand compact inverse />
          <View>
            <Text style={[styles.brandTitle, { color: palette.sidebarText }]}>Census Flow</Text>
            <Text style={[styles.brandSubtitle, { color: palette.sidebarMuted }]}>Collecte et pilotage</Text>
          </View>
        </View>
        {close ? (
          <Pressable onPress={close} style={styles.closeButton}>
            <X color={palette.sidebarText} size={20} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.sidebarScroll}
        contentContainerStyle={styles.sidebarScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: palette.sidebarSecondary,
              borderColor: 'rgba(255,255,255,0.10)',
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: palette.sidebarAccent }]}>
            <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
          </View>
          <View style={styles.userTextWrap}>
            <Text
              numberOfLines={1}
              style={[styles.userName, { color: palette.sidebarText }]}
            >
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
                user?.email ||
                'Utilisateur'}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.userRole, { color: palette.sidebarMuted }]}
            >
              {user?.role ?? 'Census Flow'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.sidebarMuted }]}>NAVIGATION</Text>
        <View style={styles.navigation}>
          {navigation.map((item) => (
            <NavRow
              key={`${item.path}-${item.label}`}
              item={item}
              active={isItemActive(item, routeKey)}
              palette={palette}
              onPress={() => navigate(item)}
            />
          ))}
        </View>

        <ThemeChooser palette={palette} />

        <Pressable
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.logout,
            {
              borderColor: 'rgba(255,135,145,0.26)',
              backgroundColor: 'rgba(255,135,145,0.08)',
            },
            pressed && { opacity: 0.76 },
          ]}
        >
          <LogOut color="#FF9AA3" size={18} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}


export default function CensusSidebarShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { width } = useWindowDimensions()
  const [open, setOpen] = useState(false)
  const { palette, isDark } = useCensusTheme()
  const { setTheme } = usePreferences()
  const desktop = width >= 980
  const shellSegments = useSegments() as unknown as string[]
  const shellRouteKey = getRouteKey(shellSegments)
  const routeOpacity = useRef(new Animated.Value(1)).current
  const routeTranslateY = useRef(new Animated.Value(0)).current
  const routeScale = useRef(new Animated.Value(1)).current
  const drawerX = useRef(new Animated.Value(-360)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    runRouteEnter(routeOpacity, routeTranslateY, routeScale)
  }, [shellRouteKey, routeOpacity, routeScale, routeTranslateY])

  useEffect(() => {
    if (!open) return
    drawerX.setValue(-360)
    overlayOpacity.setValue(0)
    Animated.parallel([
      Animated.spring(drawerX, {
        toValue: 0,
        ...motion.spring,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: motion.fast,
        useNativeDriver: nativeDriver,
      }),
    ]).start()
  }, [drawerX, open, overlayOpacity])

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: -360,
        duration: motion.fast,
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: motion.fast,
        useNativeDriver: nativeDriver,
      }),
    ]).start(() => setOpen(false))
  }

  return (
    <View style={[styles.shell, { backgroundColor: palette.page }]}>
      {desktop ? (
        <View style={styles.desktopSidebar}>
          <SidebarBody palette={palette} />
        </View>
      ) : null}

      <View style={[styles.main, { backgroundColor: palette.page }]}>
        {!desktop ? (
          <View
            style={[
              styles.mobileTopbar,
              {
                backgroundColor: palette.topbar,
                borderBottomColor: 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            <Pressable onPress={() => setOpen(true)} style={styles.menuButton}>
              <Menu color={palette.inverseText} size={22} />
            </Pressable>
            <View style={styles.mobileTitleWrap}>
              <Text style={styles.mobileTitle}>Census Flow</Text>
              <Text style={styles.mobileSubtitle}>Collecte et pilotage</Text>
            </View>
            <Pressable
              accessibilityLabel="Basculer le thème"
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
              style={styles.modeIndicator}
            >
              {isDark ? (
                <Sun color={palette.sidebarAccent} size={17} />
              ) : (
                <Moon color={palette.sidebarAccent} size={17} />
              )}
            </Pressable>
          </View>
        ) : null}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: routeOpacity,
              transform: [{ translateY: routeTranslateY }, { scale: routeScale }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>

      {!desktop ? (
        <Modal
          visible={open}
          transparent
          animationType="none"
          onRequestClose={closeDrawer}
        >
          <View style={styles.modalRoot}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles.overlay, { opacity: overlayOpacity }]}
            >
              <Pressable
                style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]}
                onPress={closeDrawer}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.drawer,
                { backgroundColor: palette.sidebar, transform: [{ translateX: drawerX }] },
                Platform.OS === 'web'
                  ? ({ boxShadow: '14px 0 42px rgba(0,0,0,0.38)' } as never)
                  : { shadowColor: '#000000' },
              ]}
            >
              <SidebarBody palette={palette} close={closeDrawer} />
            </Animated.View>
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
  sidebar: {
    flex: 1,
    borderRightWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  brandArea: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  brandCopy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTitle: { fontSize: 14, fontWeight: '900' },
  brandSubtitle: { fontSize: 9, marginTop: 2, fontWeight: '700' },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  sidebarScroll: { flex: 1 },
  sidebarScrollContent: { paddingBottom: 8 },
  userCard: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#07111F', fontSize: 16, fontWeight: '900' },
  userTextWrap: { flex: 1, minWidth: 0 },
  userName: { fontWeight: '900', fontSize: 13 },
  userRole: { fontSize: 10, marginTop: 3, fontWeight: '700' },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 17,
    marginBottom: 7,
    paddingHorizontal: 8,
  },
  navigation: { gap: 5, paddingBottom: 12 },
  navRow: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navRowActive: { borderWidth: 1 },
  navRowPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  navIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { flex: 1, fontSize: 12.5, fontWeight: '800' },
  preferences: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    marginTop: 3,
  },
  preferenceTitle: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  themeRow: { flexDirection: 'row', gap: 6 },
  themeButton: {
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  themeText: { fontSize: 9, fontWeight: '900' },
  languageRow: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  languageButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  languageButtonActive: { backgroundColor: 'rgba(244,180,0,0.18)' },
  languageText: { fontSize: 10, fontWeight: '900' },
  logout: {
    minHeight: 46,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FF9AA3', fontSize: 12, fontWeight: '900' },
  mobileTopbar: {
    minHeight: 66,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 11,
    zIndex: 10,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4B400',
    borderWidth: 1,
    borderColor: '#FFD34E',
  },
  mobileTitleWrap: { flex: 1 },
  mobileTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  mobileSubtitle: {
    color: '#9FB0C8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
  modeIndicator: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(244,180,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoot: { flex: 1, flexDirection: 'row' },
  overlay: { ...StyleSheet.absoluteFill },
  drawer: {
    width: '88%',
    maxWidth: 350,
    elevation: 24,
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
  },
})
