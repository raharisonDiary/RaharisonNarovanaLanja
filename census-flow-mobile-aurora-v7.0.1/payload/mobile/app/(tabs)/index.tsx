import { useFocusEffect, useRouter } from 'expo-router'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CloudOff,
  Home,
  MapPinned,
  Plus,
  RefreshCw,
  ScanLine,
  TrendingUp,
  UserRoundPlus,
  Users,
  UsersRound,
  Wifi,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  type ColorValue,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import {
  AuroraBackground,
  AuroraCard,
  GradientSurface,
} from '../../src/components/AuroraSurface'
import MetricCard from '../../src/components/MetricCard'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { getQueue } from '../../src/storage/database'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
  spacing,
} from '../../src/styles/theme'
import type { CampaignDto, DashboardDto } from '../../src/types/api'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<CampaignDto | null>(null)
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null)
  const [pending, setPending] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const campaigns = await mobileApi.campaigns()
      const active =
        campaigns.find((item) => item.status === 'Active') ??
        campaigns[0] ??
        null
      setCampaign(active)
      if (active) setDashboard(await mobileApi.dashboard(active.id))
      setPending((await getQueue()).length)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  if (loading) {
    return (
      <AuroraBackground>
        <View style={styles.center}>
          <View style={styles.loadingMark}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.loadingText}>Préparation du tableau de bord…</Text>
        </View>
      </AuroraBackground>
    )
  }

  const validationRate = dashboard?.totalHouseholds
    ? Math.round(
        (dashboard.validatedHouseholds / dashboard.totalHouseholds) * 100,
      )
    : 0

  const initials = `${user?.firstName?.[0] ?? 'A'}${
    user?.lastName?.[0] ?? ''
  }`.toUpperCase()

  return (
    <AuroraBackground>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <ScreenHeader
            eyebrow="Tableau de bord"
            title={`Bonjour, ${user?.firstName ?? 'Agent'} 👋`}
            subtitle={user?.role ?? 'Agent recenseur'}
          />
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => router.push('/scan')}>
              <ScanLine color={colors.primary} size={20} />
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => router.push('/profile')}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={styles.onlineDot} />
            </Pressable>
          </View>
        </View>

        <GradientSurface variant="hero" style={styles.campaignCard}>
          <View style={styles.campaignTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.campaignStatusRow}>
                <View style={styles.campaignStatus}>
                  <View style={styles.campaignStatusDot} />
                  <Text style={styles.campaignStatusText}>
                    {campaign?.status ?? 'Inactive'}
                  </Text>
                </View>
                <Bell color="#DBEAFE" size={18} />
              </View>
              <Text style={styles.campaignEyebrow}>CAMPAGNE ACTIVE</Text>
              <Text style={styles.campaignTitle} numberOfLines={2}>
                {campaign?.name ?? 'Aucune campagne active'}
              </Text>
            </View>
          </View>

          <View style={styles.campaignProgressRow}>
            <View>
              <Text style={styles.campaignProgressValue}>{validationRate}%</Text>
              <Text style={styles.campaignProgressLabel}>Ménages validés</Text>
            </View>
            <View style={styles.campaignTotalPill}>
              <UsersRound color="#FFFFFF" size={15} />
              <Text style={styles.campaignTotalText}>
                {dashboard?.totalHouseholds ?? 0} ménages
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(3, validationRate)}%` },
              ]}
            />
          </View>

          <View style={styles.campaignFooter}>
            <Text style={styles.campaignHint}>
              Continuez la collecte ou synchronisez les données en attente.
            </Text>
            <ArrowRight color="#FFFFFF" size={17} />
          </View>
        </GradientSurface>

        <View style={styles.syncRow}>
          <AuroraCard style={styles.syncCard}>
            <View style={[styles.syncIcon, { backgroundColor: colors.primarySoft }]}>
              <RefreshCw color={colors.primary} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncLabel}>Dernière synchronisation</Text>
              <Text style={styles.syncValue}>Aujourd’hui</Text>
            </View>
          </AuroraCard>
          <AuroraCard style={styles.syncCard}>
            <View style={[styles.syncIcon, { backgroundColor: colors.accentSoft }]}>
              <Wifi color={colors.accentDark} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncLabel}>État de la synchronisation</Text>
              <Text style={styles.syncValue}>{pending === 0 ? 'À jour' : `${pending} en attente`}</Text>
            </View>
          </AuroraCard>
        </View>

        <View style={styles.primaryAction}>
          <PrimaryButton
            title="Commencer une collecte"
            icon={Plus}
            onPress={() => router.push('/households/new')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <Text style={styles.sectionSubtitle}>Accédez aux tâches principales</Text>
          </View>
          <View style={styles.sectionBadge}>
            <TrendingUp color={colors.success} size={14} />
            <Text style={styles.sectionBadgeText}>Aujourd’hui</Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction
            icon={Home}
            iconColor={colors.primary}
            iconBackground={colors.primarySoft}
            title="Nouveau ménage"
            text="Créer une collecte guidée"
            onPress={() => router.push('/households/new')}
          />
          <QuickAction
            icon={UserRoundPlus}
            iconColor={colors.secondary}
            iconBackground={colors.secondarySoft}
            title="Ajouter un citoyen"
            text="Ouvrir le questionnaire"
            onPress={() => router.push('/persons')}
          />
          <QuickAction
            icon={RefreshCw}
            iconColor={colors.accentDark}
            iconBackground={colors.accentSoft}
            title="Synchroniser"
            text={`${pending} élément(s) en attente`}
            onPress={() => router.push('/(tabs)/sync')}
          />
          <QuickAction
            icon={MapPinned}
            iconColor={colors.warningDark}
            iconBackground={colors.warningSoft}
            title="Voir la carte"
            text="Localiser les ménages"
            onPress={() => router.push('/(tabs)/map')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Résumé de la campagne</Text>
            <Text style={styles.sectionSubtitle}>Données disponibles en temps réel</Text>
          </View>
          <Pressable style={styles.statsLink} onPress={() => router.push('/statistics')}>
            <BarChart3 color={colors.primary} size={16} />
            <Text style={styles.statsLinkText}>Détails</Text>
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <MetricCard
            label="Habitations"
            value={dashboard?.totalDwellings ?? 0}
            icon={Building2}
            tone={colors.primary}
            softTone={colors.primarySoft}
          />
          <MetricCard
            label="Ménages"
            value={dashboard?.totalHouseholds ?? 0}
            icon={UsersRound}
            tone={colors.secondary}
            softTone={colors.secondarySoft}
          />
          <MetricCard
            label="Citoyens"
            value={dashboard?.totalPersons ?? 0}
            icon={Users}
            tone={colors.accentDark}
            softTone={colors.accentSoft}
          />
          <MetricCard
            label="À synchroniser"
            value={pending}
            icon={CloudOff}
            tone={colors.warning}
            softTone={colors.warningSoft}
          />
        </View>

        <AuroraCard style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle2 color={colors.successDark} size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Collecte sécurisée</Text>
            <Text style={styles.successText}>
              Vos données locales restent disponibles même sans connexion.
            </Text>
          </View>
        </AuroraCard>
      </ScrollView>
    </AuroraBackground>
  )
}

function QuickAction({
  icon: Icon,
  iconColor,
  iconBackground,
  title,
  text,
  onPress,
}: {
  icon: typeof RefreshCw
  iconColor: string
  iconBackground: ColorValue
  title: string
  text: string
  onPress: () => void
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickCard, pressed && styles.quickPressed]}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: iconBackground }]}>
        <Icon color={iconColor} size={22} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickText}>{text}</Text>
      <View style={styles.quickArrow}>
        <ArrowRight color={colors.primary} size={15} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 116,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: 13,
  },
  loadingMark: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  loadingText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...softShadow,
  },
  avatarButton: {
    position: 'relative',
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 999,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  campaignCard: {
    minHeight: 252,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...floatingShadow,
  },
  campaignTop: { flexDirection: 'row', alignItems: 'flex-start' },
  campaignStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campaignStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.18)',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  campaignStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#5EEAD4',
  },
  campaignStatusText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  campaignEyebrow: {
    color: '#BFDBFE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.25,
    marginTop: 16,
  },
  campaignTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.55,
    marginTop: 5,
  },
  campaignProgressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  campaignProgressValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  campaignProgressLabel: { color: '#DBEAFE', fontSize: 10, fontWeight: '700' },
  campaignTotalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,.15)',
  },
  campaignTotalText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.20)',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#5EEAD4' },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },
  campaignHint: { flex: 1, color: '#E0E7FF', fontSize: 10, lineHeight: 15 },
  syncRow: { flexDirection: 'row', gap: 10 },
  syncCard: {
    flex: 1,
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    ...softShadow,
  },
  syncIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncLabel: { color: colors.muted, fontSize: 8, lineHeight: 11 },
  syncValue: { color: colors.text, fontSize: 11, fontWeight: '900', marginTop: 3 },
  primaryAction: { marginTop: -2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  sectionSubtitle: { fontSize: 10, color: colors.muted, marginTop: 3 },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  sectionBadgeText: { color: colors.successDark, fontSize: 9, fontWeight: '900' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickCard: {
    position: 'relative',
    overflow: 'hidden',
    width: '48%',
    minHeight: 142,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 14,
    ...softShadow,
  },
  quickPressed: { transform: [{ scale: 0.985 }], opacity: 0.93 },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: { color: colors.text, fontSize: 13, fontWeight: '900', marginTop: 11 },
  quickText: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4, paddingRight: 18 },
  quickArrow: {
    position: 'absolute',
    right: 11,
    bottom: 11,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  statsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.primarySoft,
  },
  statsLinkText: { color: colors.primary, fontSize: 9, fontWeight: '900' },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: spacing.lg,
    backgroundColor: colors.successSoft,
    borderColor: '#BBF7D0',
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  successText: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
})
