import { useFocusEffect } from 'expo-router'
import { Globe2, LocateFixed, MapPin, Search } from 'lucide-react-native'
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
import { mobileApi } from '../api/resources'
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

function findRegionName(
  areaId: string,
  areas: AdministrativeAreaDto[],
) {
  const byId = new Map(areas.map((area) => [area.id, area]))
  let current = byId.get(areaId)

  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current.type === 'Region') return current.name
    current = current.parentId
      ? byId.get(current.parentId)
      : undefined
  }

  return null
}

function markerPosition(latitude: number, longitude: number) {
  const top = Math.min(
    94,
    Math.max(4, ((-12 - latitude) / 14.5) * 100),
  )
  const left = Math.min(
    94,
    Math.max(4, ((longitude - 43) / 8.5) * 100),
  )

  return {
    left: `${left}%` as `${number}%`,
    top: `${top}%` as `${number}%`,
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

  const loadReferenceData = useCallback(async () => {
    setLoading(true)
    try {
      const [campaignRows, areaRows] = await Promise.all([
        mobileApi.campaigns(),
        mobileApi.areas(),
      ])
      setCampaigns(campaignRows)
      setAreas(areaRows)
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
  }

  const chooseCampaign = async (id: string) => {
    setCampaignId(id)
    setLoading(true)
    try {
      setDwellings(await mobileApi.dwellings(id))
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.code}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [campaigns, search],
  )

  const progressByRegion = useMemo(() => {
    const result = new Map<
      string,
      { total: number; validated: number }
    >()

    for (const dwelling of dwellings) {
      const regionName = findRegionName(
        dwelling.enumerationAreaId,
        areas,
      )
      if (!regionName) continue

      const current = result.get(regionName) ?? {
        total: 0,
        validated: 0,
      }
      current.total += 1
      if (dwelling.recordStatus === 'Validated') {
        current.validated += 1
      }
      result.set(regionName, current)
    }

    return result
  }, [areas, dwellings])

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
              {t('worldMap')} · Madagascar
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
      </View>

      <View style={styles.mapCanvas}>
        {!country ? (
          <View style={styles.worldScene}>
            <View style={[styles.continent, styles.america]} />
            <View style={[styles.continent, styles.europeAfrica]} />
            <View style={[styles.continent, styles.asia]} />
            <View style={[styles.continent, styles.australia]} />
            <Text style={styles.worldLabel}>{t('worldMap')}</Text>
          </View>
        ) : (
          <View style={styles.madagascarScene}>
            <View style={styles.island} />
            {Boolean(campaignId) && regionCenters.map(
              ([name, latitude, longitude]) => {
                const progress = progressByRegion.get(name)
                const markerColor = !progress?.total
                  ? '#7A897F'
                  : progress.validated === progress.total
                    ? '#3D8B70'
                    : '#326A4D'

                return (
                  <View
                    key={name}
                    style={[
                      styles.regionMarker,
                      markerPosition(latitude, longitude),
                      { backgroundColor: markerColor },
                    ]}
                  >
                    <Text style={styles.markerCount}>
                      {progress?.total ?? 0}
                    </Text>
                  </View>
                )
              },
            )}
            {Boolean(campaignId) && dwellings.slice(0, 250).map((dwelling) => (
              <View
                key={dwelling.id}
                style={[
                  styles.dwellingMarker,
                  markerPosition(
                    dwelling.latitude,
                    dwelling.longitude,
                  ),
                  {
                    backgroundColor:
                      dwelling.recordStatus === 'Validated'
                        ? '#3D8B70'
                        : '#C97955',
                  },
                ]}
              />
            ))}
            {!campaignId && (
              <View style={styles.mapInstruction}>
                <MapPin color={colors.primary} size={24} />
                <Text style={styles.instructionTitle}>
                  {t('selectCampaign')}
                </Text>
                <Text style={styles.instructionText}>
                  {t('noValidatedData')}
                </Text>
              </View>
            )}
          </View>
        )}

        {loading && (
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
          />
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.notStarted]} />
          <Text style={styles.legendText}>{t('notStarted')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.inProgress]} />
          <Text style={styles.legendText}>{t('inProgress')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.completed]} />
          <Text style={styles.legendText}>{t('completed')}</Text>
        </View>
      </View>

      <Pressable
        style={styles.locate}
        onPress={() => setCountry(country ? '' : 'Madagascar')}
      >
        <LocateFixed color={colors.primary} size={20} />
        <Text style={styles.locateText}>
          {country ? t('worldMap') : 'Madagascar'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
  heading: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  headingText: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
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
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.text,
  },
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
  mapCanvas: {
    minHeight: 520,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#DDEDE3',
    ...shadow,
  },
  loader: {
    position: 'absolute',
    top: '48%',
    alignSelf: 'center',
  },
  worldScene: {
    flex: 1,
    minHeight: 520,
    backgroundColor: '#D9EBE1',
  },
  continent: {
    position: 'absolute',
    backgroundColor: '#A8C6AF',
    borderRadius: 999,
    opacity: 0.9,
  },
  america: {
    left: '9%',
    top: '20%',
    width: '21%',
    height: '58%',
    transform: [{ rotate: '-12deg' }],
  },
  europeAfrica: {
    left: '42%',
    top: '21%',
    width: '18%',
    height: '57%',
    transform: [{ rotate: '8deg' }],
  },
  asia: {
    right: '9%',
    top: '17%',
    width: '34%',
    height: '35%',
    transform: [{ rotate: '-6deg' }],
  },
  australia: {
    right: '13%',
    bottom: '15%',
    width: '14%',
    height: '15%',
  },
  worldLabel: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    color: '#326A4D',
    fontWeight: '900',
    fontSize: 16,
  },
  madagascarScene: {
    flex: 1,
    minHeight: 520,
    backgroundColor: '#D9EBE1',
  },
  island: {
    position: 'absolute',
    left: '31%',
    top: '5%',
    width: '38%',
    height: '90%',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 150,
    backgroundColor: '#B7D2BC',
    transform: [{ rotate: '7deg' }],
    borderWidth: 2,
    borderColor: '#8CB39A',
  },
  regionMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerCount: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  dwellingMarker: {
    position: 'absolute',
    width: 7,
    height: 7,
    marginLeft: -3.5,
    marginTop: -3.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mapInstruction: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '37%',
    alignItems: 'center',
    gap: 7,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  instructionTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  instructionText: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notStarted: { backgroundColor: '#7A897F' },
  inProgress: { backgroundColor: '#326A4D' },
  completed: { backgroundColor: '#3D8B70' },
  legendText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  locate: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadow,
  },
  locateText: {
    color: colors.primary,
    fontWeight: '900',
  },
})
