import { useFocusEffect } from 'expo-router'
import { Globe2, LocateFixed, Search } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Svg, {
  Circle,
  G,
  Path,
  Text as SvgText,
} from 'react-native-svg'
import { messageFromError } from '../api/client'
import { mobileApi } from '../api/resources'
import {
  MADAGASCAR_BOUNDS,
  MADAGASCAR_PATH,
  MADAGASCAR_VIEWBOX,
  WORLD_PATH,
  WORLD_VIEWBOX,
} from '../data/mapGeometry'
import { usePreferences } from '../preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../styles/theme'
import type {
  AdministrativeAreaDto,
  CampaignDto,
  DwellingDto,
} from '../types/api'

const regionCenters = [
  ['Analamanga', -18.91, 47.52],
  ['Vakinankaratra', -19.87, 46.97],
  ['Itasy', -19.05, 46.73],
  ['Bongolava', -18.75, 46.18],
  ['Haute Matsiatra', -21.45, 47.08],
  ['Amoron’i Mania', -20.55, 47.08],
  ['Vatovavy', -21.2, 48.1],
  ['Fitovinany', -22.15, 47.8],
  ['Atsimo-Atsinanana', -23.15, 47.3],
  ['Ihorombe', -22.5, 46.3],
  ['Atsimo-Andrefana', -23.35, 44.65],
  ['Androy', -24.75, 45.15],
  ['Anosy', -24.1, 46.5],
  ['Menabe', -20.3, 44.45],
  ['Melaky', -17.7, 44.3],
  ['Boeny', -16.25, 46.35],
  ['Betsiboka', -17.15, 46.85],
  ['Sofia', -15.25, 48.2],
  ['Diana', -13.35, 49.15],
  ['Sava', -14.25, 50.15],
  ['Alaotra-Mangoro', -18, 48.05],
  ['Atsinanana', -18.55, 49.1],
  ['Analanjirofo', -16.85, 49.65],
] as const

function areaById(areas: AdministrativeAreaDto[]) {
  return new Map(areas.map((area) => [area.id, area]))
}

function findRegion(
  areaId: string,
  areas: AdministrativeAreaDto[],
): AdministrativeAreaDto | undefined {
  const byId = areaById(areas)
  let current = byId.get(areaId)

  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current.type === 'Region') return current
    current = current.parentId
      ? byId.get(current.parentId)
      : undefined
  }

  return undefined
}

function projectedPoint(latitude: number, longitude: number) {
  const { offsetX, offsetY, scale, maxLatitude, minLongitude } =
    MADAGASCAR_BOUNDS

  return {
    x: offsetX + (longitude - minLongitude) * scale,
    y: offsetY + (maxLatitude - latitude) * scale,
  }
}

export default function MapScreen() {
  const { t } = usePreferences()
  const [country, setCountry] = useState('')
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [areas, setAreas] = useState<AdministrativeAreaDto[]>([])
  const [dwellings, setDwellings] = useState<DwellingDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReferenceData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [campaignRows, areaRows] = await Promise.all([
        mobileApi.campaigns(),
        mobileApi.areas(),
      ])
      setCampaigns(campaignRows)
      setAreas(areaRows)
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadReferenceData()
    }, [loadReferenceData]),
  )

  const chooseCountry = () => {
    setCountry('Madagascar')
    setCampaignId('')
    setDwellings([])
    setError('')
  }

  const showWorld = () => {
    setCountry('')
    setCampaignId('')
    setDwellings([])
    setError('')
  }

  const chooseCampaign = async (id: string) => {
    setCampaignId(id)
    setLoading(true)
    setError('')
    try {
      setDwellings(await mobileApi.dwellings(id))
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.code}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    ),
    [campaigns, search],
  )

  const selectedCampaign = campaigns.find(
    (campaign) => campaign.id === campaignId,
  )

  const concernedRegionNames = useMemo(() => {
    if (!selectedCampaign) return new Set<string>()

    const scope = areas.find(
      (area) => area.id === selectedCampaign.scopeAdministrativeAreaId,
    )
    if (!scope) return new Set<string>()

    if (scope.type === 'Country') {
      return new Set(
        areas
          .filter(
            (area) =>
              area.type === 'Region' && area.parentId === scope.id,
          )
          .map((area) => area.name),
      )
    }

    const region = findRegion(scope.id, areas)
    return new Set(region ? [region.name] : [])
  }, [areas, selectedCampaign])

  const progressByRegion = useMemo(() => {
    const result = new Map<
      string,
      { total: number; validated: number }
    >()

    for (const dwelling of dwellings) {
      const region = findRegion(dwelling.enumerationAreaId, areas)
      if (!region) continue

      const current = result.get(region.name) ?? {
        total: 0,
        validated: 0,
      }
      current.total += 1
      if (dwelling.recordStatus === 'Validated') {
        current.validated += 1
      }
      result.set(region.name, current)
    }

    return result
  }, [areas, dwellings])

  const regionStatus = (name: string) => {
    const progress = progressByRegion.get(name)
    if (!progress?.total) return 'idle' as const
    if (
      progress.validated === progress.total &&
      selectedCampaign &&
      ['Closed', 'Archived'].includes(selectedCampaign.status)
    ) {
      return 'done' as const
    }
    return 'running' as const
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.panel}>
        <View style={styles.heading}>
          <View style={styles.icon}>
            <Globe2 color={colors.primary} size={20} />
          </View>
          <View style={styles.headingText}>
            <Text style={styles.title}>{t('map')}</Text>
            <Text style={styles.subtitle}>
              {country || t('worldMap')}
            </Text>
          </View>
        </View>

        {!country ? (
          <Pressable
            style={styles.primaryButton}
            onPress={chooseCountry}
          >
            <Text style={styles.primaryButtonText}>
              {t('selectCountry')} · Madagascar
            </Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Search color={colors.muted} size={17} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`${t('search')} · ${t('campaign')}`}
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.campaignList}
            >
              {filteredCampaigns.map((campaign) => (
                <Pressable
                  key={campaign.id}
                  style={[
                    styles.campaignChip,
                    campaignId === campaign.id &&
                      styles.campaignChipActive,
                  ]}
                  onPress={() => void chooseCampaign(campaign.id)}
                >
                  <Text
                    style={[
                      styles.campaignChipText,
                      campaignId === campaign.id &&
                        styles.campaignChipTextActive,
                    ]}
                  >
                    {campaign.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.mapCard}>
        {!country ? (
          <Svg
            width="100%"
            height={290}
            viewBox={WORLD_VIEWBOX}
            accessibilityLabel={t('worldMap')}
          >
            <Path
              d={WORLD_PATH}
              fill="#BCD8C7"
              stroke="#6E9980"
              strokeWidth={0.35}
            />
          </Svg>
        ) : (
          <Svg
            width="100%"
            height={510}
            viewBox={MADAGASCAR_VIEWBOX}
            accessibilityLabel="Madagascar"
          >
            <Path
              d={MADAGASCAR_PATH}
              fill="#CBE2D3"
              stroke="#2563EB"
              strokeWidth={2.2}
            />

            {Boolean(campaignId) && regionCenters
              .filter(([name]) => concernedRegionNames.has(name))
              .map(([name, latitude, longitude]) => {
                const point = projectedPoint(latitude, longitude)
                const progress = progressByRegion.get(name)
                const status = regionStatus(name)
                const fill = status === 'done'
                  ? '#22C55E'
                  : status === 'running'
                    ? '#2563EB'
                    : '#7A897F'

                return (
                  <G key={name}>
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={11}
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth={2.4}
                    />
                    <SvgText
                      x={point.x}
                      y={point.y + 3.5}
                      fill="#FFFFFF"
                      fontSize={8.5}
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {progress?.total ?? 0}
                    </SvgText>
                  </G>
                )
              })}

            {Boolean(campaignId) && dwellings
              .filter(
                (dwelling) =>
                  Number.isFinite(dwelling.latitude) &&
                  Number.isFinite(dwelling.longitude),
              )
              .slice(0, 400)
              .map((dwelling) => {
                const point = projectedPoint(
                  dwelling.latitude,
                  dwelling.longitude,
                )
                return (
                  <Circle
                    key={dwelling.id}
                    cx={point.x}
                    cy={point.y}
                    r={2.2}
                    fill={
                      dwelling.recordStatus === 'Validated'
                        ? '#F0B85A'
                        : '#EF4444'
                    }
                    stroke="#FFFFFF"
                    strokeWidth={0.8}
                  />
                )
              })}
          </Svg>
        )}

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
          />
        ) : null}

        <Pressable
          style={styles.locate}
          onPress={country ? showWorld : chooseCountry}
        >
          <LocateFixed color={colors.primary} size={20} />
          <Text style={styles.locateText}>
            {country ? t('worldMap') : 'Madagascar'}
          </Text>
        </Pressable>
      </View>

      {country && campaignId ? (
        <View style={styles.legend}>
          <Legend color="#7A897F" label={t('notStarted')} />
          <Legend color="#2563EB" label={t('inProgress')} />
          <Legend color="#22C55E" label={t('completed')} />
        </View>
      ) : null}

      <Text style={styles.attribution}>
        Fond géographique : Natural Earth · affichage hors ligne
      </Text>
    </ScrollView>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 110,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  headingText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 11, color: colors.muted, marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '900' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  searchInput: { flex: 1, paddingVertical: 10, color: colors.text },
  campaignList: { gap: 8, paddingTop: 10 },
  campaignChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  campaignChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  campaignChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  campaignChipTextActive: { color: '#FFFFFF' },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontSize: 11,
  },
  mapCard: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 330,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loader: { position: 'absolute', top: 24, right: 24 },
  locate: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    ...shadow,
  },
  locateText: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 999 },
  legendText: { color: colors.textSoft, fontSize: 10, fontWeight: '700' },
  attribution: {
    color: colors.muted,
    fontSize: 9,
    textAlign: 'center',
  },
})
