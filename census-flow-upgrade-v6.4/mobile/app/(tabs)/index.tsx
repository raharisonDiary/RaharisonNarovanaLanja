import { useFocusEffect, useRouter } from 'expo-router'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CloudOff,
  MapPinned,
  Plus,
  RefreshCw,
  ScanLine,
  Users,
  UsersRound,
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
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import MetricCard from '../../src/components/MetricCard'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { getQueue } from '../../src/storage/database'
import {
  colors,
  radius,
  shadow,
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const validationRate = dashboard?.totalHouseholds
    ? Math.round(
        (dashboard.validatedHouseholds / dashboard.totalHouseholds) * 100,
      )
    : 0

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader
        title={`Bonjour, ${user?.firstName ?? 'Agent'}`}
        subtitle={
          campaign
            ? `${campaign.name} · ${campaign.status}`
            : 'Aucune campagne active'
        }
        right={
          <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
            <ScanLine color={colors.primary} size={21} />
          </Pressable>
        }
      />

      <View style={styles.hero}>
        <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%">
          <Defs>
            <LinearGradient id="homeHero" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2563EB" />
              <Stop offset="0.62" stopColor="#6366F1" />
              <Stop offset="1" stopColor="#14B8A6" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#homeHero)" />
          <Circle cx="86%" cy="0" r="92" fill="rgba(255,255,255,.16)" />
          <Circle cx="100%" cy="92%" r="72" fill="rgba(20,184,166,.25)" />
        </Svg>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Ménages validés</Text>
            <Text style={styles.heroValue}>{validationRate}%</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {dashboard?.totalHouseholds ?? 0} ménages
            </Text>
          </View>
        </View>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${validationRate}%` }]} />
        </View>
        <Text style={styles.heroHint}>
          Continuez la collecte ou synchronisez les données en attente.
        </Text>
      </View>

      <View style={styles.primaryAction}>
        <PrimaryButton
          title="Commencer une collecte"
          icon={Plus}
          onPress={() => router.push('/households/new')}
        />
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
          label="Personnes"
          value={dashboard?.totalPersons ?? 0}
          icon={Users}
          tone={colors.accent}
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

      <Text style={styles.sectionTitle}>Actions utiles</Text>
      <View style={styles.quickGrid}>
        <QuickAction
          icon={RefreshCw}
          iconColor={colors.primary}
          iconBackground={colors.primarySoft}
          title="Synchroniser"
          text={`${pending} élément(s) en attente`}
          onPress={() => router.push('/(tabs)/sync')}
        />
        <QuickAction
          icon={MapPinned}
          iconColor={colors.accent}
          iconBackground={colors.accentSoft}
          title="Voir la carte"
          text="Localiser les ménages"
          onPress={() => router.push('/(tabs)/map')}
        />
        <QuickAction
          icon={BarChart3}
          iconColor={colors.secondary}
          iconBackground={colors.secondarySoft}
          title="Statistiques"
          text="Consulter les données validées"
          onPress={() => router.push('/statistics')}
        />
      </View>
    </ScrollView>
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
    <Pressable style={styles.quickCard} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: iconBackground }]}>
        <Icon color={iconColor} size={21} />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickText}>{text}</Text>
      </View>
      <ArrowRight color={colors.muted} size={17} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 112 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 205,
    ...shadow,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: { color: '#DBEAFE', fontSize: 12, fontWeight: '700' },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    marginTop: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  progress: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.20)',
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5EEAD4',
    borderRadius: 999,
  },
  heroHint: { color: '#E0E7FF', fontSize: 11, marginTop: 13, lineHeight: 17 },
  primaryAction: { marginTop: -4 },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
  },
  quickGrid: { gap: 12 },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...softShadow,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: { flex: 1 },
  quickTitle: { fontWeight: '900', color: colors.text },
  quickText: { marginTop: 3, fontSize: 11, color: colors.muted },
})
