import { Redirect, Stack, useRouter } from 'expo-router'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Home,
  Users,
  UsersRound,
} from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  type ColorValue,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import { useAuth } from '../src/auth/AuthContext'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import { usePreferences } from '../src/preferences/PreferencesContext'
import {
  colors,
  radius,
  shadow,
  softShadow,
  spacing,
} from '../src/styles/theme'
import type {
  AdministrativeAreaDto,
  AnalyticsDto,
  CampaignDto,
} from '../src/types/api'

const format = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

export default function StatisticsScreen() {
  const router = useRouter()
  const { t } = usePreferences()
  const { user, loading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [search, setSearch] = useState('')
  const [data, setData] = useState<AnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setError('')
    setLoading(true)

    void Promise.all([mobileApi.campaigns(), mobileApi.areas()])
      .then(([campaignRows, areaRows]) => {
        setCampaigns(campaignRows)
        setAreas(areaRows)
      })
      .catch((loadError: unknown) => setError(messageFromError(loadError)))
      .finally(() => setLoading(false))
  }, [user])

  const visibleAreas = useMemo(() => {
    const query = search.trim().toLowerCase()
    return areas.filter((area) => {
      const supported = ['Country', 'Region', 'District', 'Commune'].includes(
        area.type,
      )
      return supported && area.name.toLowerCase().includes(query)
    })
  }, [areas, search])

  const refresh = async (nextCampaignId: string, nextAreaId?: string) => {
    if (!nextCampaignId) {
      setData(null)
      return
    }

    setError('')
    setLoading(true)
    try {
      setData(await mobileApi.analytics(nextCampaignId, nextAreaId))
    } catch (refreshError: unknown) {
      setData(null)
      setError(messageFromError(refreshError))
    } finally {
      setLoading(false)
    }
  }

  const showEmpty = !loading && campaignId.length > 0 && data === null && !error

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (!user) return <Redirect href="/login" />

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            style={styles.back}
            onPress={() => goBackOrReplace(router, '/(tabs)/more')}
          >
            <ArrowLeft color={colors.text} size={21} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('validatedStats')}</Text>
            <Text style={styles.subtitle}>{t('validatedStatsText')}</Text>
          </View>
        </View>

        <View style={styles.filterCard}>
          <View style={styles.filterTitleRow}>
            <View style={styles.filterIcon}>
              <BarChart3 color={colors.primary} size={19} />
            </View>
            <View>
              <Text style={styles.label}>{t('campaign')}</Text>
              <Text style={styles.filterHint}>Affinez la zone dâ€™analyse</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {campaigns.map((campaign) => (
              <Pressable
                key={campaign.id}
                style={[
                  styles.chip,
                  campaignId === campaign.id && styles.chipActive,
                ]}
                onPress={() => {
                  setCampaignId(campaign.id)
                  setAreaId('')
                  void refresh(campaign.id)
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    campaignId === campaign.id && styles.chipTextActive,
                  ]}
                >
                  {campaign.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('search')}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {visibleAreas.slice(0, 60).map((area) => (
              <Pressable
                key={area.id}
                disabled={!campaignId}
                style={[
                  styles.chip,
                  !campaignId && styles.chipDisabled,
                  areaId === area.id && styles.areaChipActive,
                ]}
                onPress={() => {
                  setAreaId(area.id)
                  void refresh(campaignId, area.id)
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    areaId === area.id && styles.chipTextActive,
                  ]}
                >
                  {area.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Chargement impossible</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {data ? (
          <View style={styles.results}>
            <View style={styles.analyticsHero}>
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <LinearGradient id="statsHero" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#2563EB" />
                    <Stop offset="0.62" stopColor="#6366F1" />
                    <Stop offset="1" stopColor="#14B8A6" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#statsHero)" />
                <Circle cx="86%" cy="4" r="88" fill="rgba(255,255,255,.16)" />
                <Circle cx="105%" cy="102%" r="80" fill="rgba(20,184,166,.28)" />
              </Svg>
              <Text style={styles.heroEyebrow}>DONNÃ‰ES VALIDÃ‰ES</Text>
              <Text style={styles.heroTitle}>{data.campaignName}</Text>
              <Text style={styles.heroSubtitle}>
                {data.areaName} Â· {data.areaType}
              </Text>
            </View>

            <View style={styles.metrics}>
              <Metric
                icon={UsersRound}
                label={t('totalHouseholds')}
                value={data.totalHouseholds}
                tone={colors.primary}
                softTone={colors.primarySoft}
              />
              <Metric
                icon={Users}
                label={t('totalCitizens')}
                value={data.totalCitizens}
                tone={colors.secondary}
                softTone={colors.secondarySoft}
              />
              <Metric
                icon={Home}
                label="Habitations"
                value={data.totalDwellings}
                tone={colors.accent}
                softTone={colors.accentSoft}
              />
              <Metric
                icon={GraduationCap}
                label={t('students')}
                value={data.students}
                tone={colors.warning}
                softTone={colors.warningSoft}
              />
            </View>

            <GenderDonut data={data} womenLabel={t('women')} menLabel={t('men')} />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('distribution')}</Text>
              <Bar label={t('women')} value={data.femaleCitizens} total={data.totalCitizens} tone={colors.secondary} />
              <Bar label={t('men')} value={data.maleCitizens} total={data.totalCitizens} tone={colors.accent} />
              <Bar label={t('children')} value={data.children} total={data.totalCitizens} tone={colors.primary} />
              <Bar label={t('youth')} value={data.youth} total={data.totalCitizens} tone={colors.purple} />
              <Bar label={t('adults')} value={data.adults} total={data.totalCitizens} tone={colors.success} />
              <Bar label={t('seniors')} value={data.seniors} total={data.totalCitizens} tone={colors.warning} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('topFive')}</Text>
              {data.topAreas.map((area, index) => (
                <View key={area.areaId} style={styles.ranking}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{area.areaName}</Text>
                    <Text style={styles.rankType}>{area.areaType}</Text>
                  </View>
                  <Text style={styles.rankValue}>{format(area.citizens)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {showEmpty ? <Text style={styles.empty}>{t('noValidatedData')}</Text> : null}
      </ScrollView>
    </>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
  softTone,
}: {
  icon: typeof CheckCircle2
  label: string
  value: number
  tone: string
  softTone: ColorValue
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricAccent, { backgroundColor: tone }]} />
      <View style={[styles.metricIcon, { backgroundColor: softTone }]}>
        <Icon color={tone} size={20} />
      </View>
      <Text style={styles.metricValue}>{format(value)}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function GenderDonut({
  data,
  womenLabel,
  menLabel,
}: {
  data: AnalyticsDto
  womenLabel: string
  menLabel: string
}) {
  const total = Math.max(1, data.femaleCitizens + data.maleCitizens)
  const femaleRate = data.femaleCitizens / total
  const maleRate = data.maleCitizens / total
  const radiusValue = 45
  const circumference = 2 * Math.PI * radiusValue
  const femaleLength = circumference * femaleRate
  const maleLength = circumference * maleRate

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>RÃ©partition par sexe</Text>
      <View style={styles.donutRow}>
        <View style={styles.donutWrap}>
          <Svg width={124} height={124} viewBox="0 0 120 120">
            <Circle
              cx="60"
              cy="60"
              r={radiusValue}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="16"
            />
            <Circle
              cx="60"
              cy="60"
              r={radiusValue}
              fill="none"
              stroke="#6366F1"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${femaleLength} ${circumference}`}
              transform="rotate(-90 60 60)"
            />
            <Circle
              cx="60"
              cy="60"
              r={radiusValue}
              fill="none"
              stroke="#14B8A6"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${maleLength} ${circumference}`}
              strokeDashoffset={-femaleLength}
              transform="rotate(-90 60 60)"
            />
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutValue}>{format(data.totalCitizens)}</Text>
            <Text style={styles.donutCaption}>citoyens</Text>
          </View>
        </View>
        <View style={styles.legend}>
          <LegendItem color={colors.secondary} label={womenLabel} value={data.femaleCitizens} total={total} />
          <LegendItem color={colors.accent} label={menLabel} value={data.maleCitizens} total={total} />
        </View>
      </View>
    </View>
  )
}

function LegendItem({
  color,
  label,
  value,
  total,
}: {
  color: string
  label: string
  value: number
  total: number
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View style={styles.legendCopy}>
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendValue}>
          {format(value)} Â· {Math.round((value / total) * 100)}%
        </Text>
      </View>
    </View>
  )
}

function Bar({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: string
}) {
  const width = (total > 0 ? `${Math.round((value / total) * 100)}%` : '0%') as `${number}%`

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{format(value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width, backgroundColor: tone }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  headerText: { flex: 1 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...softShadow,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3, lineHeight: 17 },
  filterCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 13,
    ...softShadow,
  },
  filterTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  filterIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.text, fontWeight: '900' },
  filterHint: { color: colors.muted, fontSize: 10, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: colors.surfaceSoft,
  },
  chips: { gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipDisabled: { opacity: 0.45 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  areaChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  errorTitle: { color: colors.danger, fontWeight: '900' },
  errorText: { color: colors.textSoft, lineHeight: 20 },
  results: { gap: spacing.lg },
  analyticsHero: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 162,
    borderRadius: radius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    ...shadow,
  },
  heroEyebrow: { color: '#CCFBF1', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: '#E0E7FF', fontSize: 12, marginTop: 6 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: {
    position: 'relative',
    overflow: 'hidden',
    flexGrow: 1,
    flexBasis: 145,
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
    ...softShadow,
  },
  metricAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  metricIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 3 },
  metricLabel: { color: colors.muted, fontSize: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 13,
    ...softShadow,
  },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  donutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 18 },
  donutWrap: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  donutCaption: { color: colors.muted, fontSize: 9, marginTop: 1 },
  legend: { flex: 1, gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendCopy: { flex: 1 },
  legendLabel: { color: colors.text, fontWeight: '800', fontSize: 12 },
  legendValue: { color: colors.muted, fontSize: 10, marginTop: 2 },
  barRow: { gap: 6 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: colors.text, fontSize: 12 },
  barValue: { color: colors.text, fontWeight: '900', fontSize: 12 },
  barTrack: { height: 8, borderRadius: 999, backgroundColor: colors.surfaceSoft, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  ranking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
  },
  rankInfo: { flex: 1 },
  rankName: { color: colors.text, fontWeight: '800' },
  rankType: { color: colors.muted, fontSize: 10 },
  rankValue: { color: colors.text, fontWeight: '900' },
  empty: { color: colors.muted, textAlign: 'center', padding: 24 },
})

