import { Redirect, Stack, useRouter } from 'expo-router'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Users,
  UsersRound,
} from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import { useAuth } from '../src/auth/AuthContext'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type {
  AdministrativeAreaDto,
  AnalyticsDto,
  CampaignDto,
} from '../src/types/api'

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
      .catch((loadError: unknown) => {
        setError(messageFromError(loadError))
      })
      .finally(() => setLoading(false))
  }, [user])

  const visibleAreas = useMemo(() => {
    const query = search.trim().toLowerCase()

    return areas.filter((area) => {
      const supported = [
        'Country',
        'Region',
        'District',
        'Commune',
      ].includes(area.type)

      return supported && area.name.toLowerCase().includes(query)
    })
  }, [areas, search])

  const refresh = async (
    nextCampaignId: string,
    nextAreaId?: string,
  ) => {
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

  const showEmpty =
    !loading && campaignId.length > 0 && data === null && !error

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/login" />
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            style={styles.back}
            onPress={() =>
              goBackOrReplace(router, '/(tabs)/more')
            }
          >
            <ArrowLeft color={colors.text} size={21} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('validatedStats')}</Text>
            <Text style={styles.subtitle}>
              {t('validatedStatsText')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('campaign')}</Text>
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
                    campaignId === campaign.id &&
                      styles.chipTextActive,
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
                  areaId === area.id && styles.chipActive,
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

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Chargement impossible</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {data ? (
          <View style={styles.results}>
            <Text style={styles.zone}>
              {data.areaName}
              {' · '}
              {data.campaignName}
            </Text>

            <View style={styles.metrics}>
              <Metric
                icon={UsersRound}
                label={t('totalHouseholds')}
                value={data.totalHouseholds}
              />
              <Metric
                icon={Users}
                label={t('totalCitizens')}
                value={data.totalCitizens}
              />
              <Metric
                icon={CheckCircle2}
                label={t('students')}
                value={data.students}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('distribution')}
              </Text>
              <Bar
                label={t('women')}
                value={data.femaleCitizens}
                total={data.totalCitizens}
              />
              <Bar
                label={t('men')}
                value={data.maleCitizens}
                total={data.totalCitizens}
              />
              <Bar
                label={t('children')}
                value={data.children}
                total={data.totalCitizens}
              />
              <Bar
                label={t('youth')}
                value={data.youth}
                total={data.totalCitizens}
              />
              <Bar
                label={t('adults')}
                value={data.adults}
                total={data.totalCitizens}
              />
              <Bar
                label={t('seniors')}
                value={data.seniors}
                total={data.totalCitizens}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('topFive')}</Text>
              {data.topAreas.map((area, index) => (
                <View key={area.areaId} style={styles.ranking}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>
                      {area.areaName}
                    </Text>
                    <Text style={styles.rankType}>
                      {area.areaType}
                    </Text>
                  </View>
                  <Text style={styles.rankValue}>
                    {area.citizens}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {showEmpty ? (
          <Text style={styles.empty}>{t('noValidatedData')}</Text>
        ) : null}
      </ScrollView>
    </>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3
  label: string
  value: number
}) {
  return (
    <View style={styles.metric}>
      <Icon color={colors.primary} size={20} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function Bar({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const width = (
    total > 0
      ? `${Math.round((value / total) * 100)}%`
      : '0%'
  ) as `${number}%`

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width }]} />
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
  errorCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: '900',
  },
  errorText: {
    color: colors.textSoft,
    lineHeight: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 48,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  headerText: {
    flex: 1,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 12,
    ...shadow,
  },
  label: {
    color: colors.text,
    fontWeight: '900',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  chips: {
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  results: {
    gap: spacing.lg,
  },
  zone: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 100,
    minWidth: 100,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  barRow: {
    gap: 5,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    color: colors.text,
    fontSize: 12,
  },
  barValue: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 12,
  },
  barTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  ranking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: colors.text,
    fontWeight: '800',
  },
  rankType: {
    color: colors.muted,
    fontSize: 10,
  },
  rankValue: {
    color: colors.text,
    fontWeight: '900',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    padding: 24,
  },
})
