import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, BarChart3, CheckCircle2, Users, UsersRound } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { mobileApi } from '../src/api/resources'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type { AdministrativeAreaDto, AnalyticsDto, CampaignDto } from '../src/types/api'
import { usePreferences } from '../src/preferences/PreferencesContext'

export default function StatisticsScreen() {
  const router = useRouter()
  const {t}=usePreferences()
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [search, setSearch] = useState('')
  const [data, setData] = useState<AnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([mobileApi.campaigns(), mobileApi.areas()])
      .then(([campaignRows, areaRows]) => {
        setCampaigns(campaignRows)
        setAreas(areaRows)
      })
      .finally(() => setLoading(false))
  }, [])

  const visibleAreas = useMemo(() => areas.filter((area) =>
    ['Country', 'Region', 'District', 'Commune'].includes(area.type) &&
    area.name.toLowerCase().includes(search.toLowerCase())), [areas, search])

  const refresh = async (nextCampaignId: string, nextAreaId?: string) => {
    if (!nextCampaignId) return
    setLoading(true)
    try {
      setData(await mobileApi.analytics(nextCampaignId, nextAreaId))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><ArrowLeft color={colors.text} size={21} /></Pressable>
        <View><Text style={styles.title}>{t('validatedStats')}</Text><Text style={styles.subtitle}>{t('validatedStatsText')}</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('campaign')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {campaigns.map((campaign) => (
            <Pressable
              key={campaign.id}
              style={[styles.chip, campaignId === campaign.id && styles.chipActive]}
              onPress={() => {
                setCampaignId(campaign.id)
                setAreaId('')
                void refresh(campaign.id)
              }}
            >
              <Text style={[styles.chipText, campaignId === campaign.id && styles.chipTextActive]}>{campaign.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <TextInput value={search} onChangeText={setSearch} placeholder={t('search')} placeholderTextColor={colors.muted} style={styles.input} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {visibleAreas.slice(0, 60).map((area) => (
            <Pressable
              key={area.id}
              style={[styles.chip, areaId === area.id && styles.chipActive]}
              onPress={() => {
                setAreaId(area.id)
                void refresh(campaignId, area.id)
              }}
            >
              <Text style={[styles.chipText, areaId === area.id && styles.chipTextActive]}>{area.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading && <ActivityIndicator color={colors.primary} />}
      {data && (
        <>
          <Text style={styles.zone}>{data.areaName} · {data.campaignName}</Text>
          <View style={styles.metrics}>
            <Metric icon={UsersRound} label={t('totalHouseholds')} value={data.totalHouseholds} />
            <Metric icon={Users} label={t('totalCitizens')} value={data.totalCitizens} />
            <Metric icon={CheckCircle2} label={t('students')} value={data.students} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('distribution')}</Text>
            <Bar label={t('women')} value={data.femaleCitizens} total={data.totalCitizens} />
            <Bar label={t('men')} value={data.maleCitizens} total={data.totalCitizens} />
            <Bar label={t('children')} value={data.children} total={data.totalCitizens} />
            <Bar label={t('youth')} value={data.youth} total={data.totalCitizens} />
            <Bar label={t('adults')} value={data.adults} total={data.totalCitizens} />
            <Bar label={t('seniors')} value={data.seniors} total={data.totalCitizens} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('topFive')}</Text>
            {data.topAreas.map((area, index) => (
              <View key={area.areaId} style={styles.ranking}>
                <Text style={styles.rank}>{index + 1}</Text>
                <View style={styles.rankInfo}><Text style={styles.rankName}>{area.areaName}</Text><Text style={styles.rankType}>{area.areaType}</Text></View>
                <Text style={styles.rankValue}>{area.citizens}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {!loading && campaignId && !data && <Text style={styles.empty}>{t('noValidatedData')}</Text>}
    </ScrollView>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: number }) {
  return <View style={styles.metric}><Icon color={colors.primary} size={20} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = (total ? `${Math.round((value / total) * 100)}%` : '0%') as `${number}%`
  return <View style={styles.barRow}><View style={styles.barHeader}><Text style={styles.barLabel}>{label}</Text><Text style={styles.barValue}>{value}</Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width }]} /></View></View>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 12, ...shadow },
  label: { color: colors.text, fontWeight: '900' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
  chips: { gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  zone: { color: colors.text, fontWeight: '900', fontSize: 16 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 4 },
  metricValue: { color: colors.text, fontSize: 24, fontWeight: '900' },
  metricLabel: { color: colors.muted, fontSize: 10 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  barRow: { gap: 5 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: colors.text, fontSize: 12 },
  barValue: { color: colors.text, fontWeight: '900', fontSize: 12 },
  barTrack: { height: 7, borderRadius: 999, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  ranking: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rank: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.primarySoft, color: colors.primary, textAlign: 'center', textAlignVertical: 'center', fontWeight: '900' },
  rankInfo: { flex: 1 }, rankName: { color: colors.text, fontWeight: '800' }, rankType: { color: colors.muted, fontSize: 10 }, rankValue: { color: colors.text, fontWeight: '900' },
  empty: { color: colors.muted, textAlign: 'center', padding: 24 },
})
