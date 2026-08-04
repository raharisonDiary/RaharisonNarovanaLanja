import { useFocusEffect } from 'expo-router'
import { Globe2, LocateFixed, Search } from 'lucide-react-native'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import MapView, { Marker, type Region } from 'react-native-maps'
import { mobileApi } from '../api/resources'
import { colors, radius, shadow, spacing } from '../styles/theme'
import { usePreferences } from '../preferences/PreferencesContext'
import type { AdministrativeAreaDto, CampaignDto, DwellingDto } from '../types/api'

const worldRegion: Region = {
  latitude: 12,
  longitude: 15,
  latitudeDelta: 120,
  longitudeDelta: 120,
}

const madagascarRegion: Region = {
  latitude: -18.8792,
  longitude: 46.8,
  latitudeDelta: 14,
  longitudeDelta: 9,
}

const regionCenters = [
  ['Analamanga', -18.91, 47.52], ['Vakinankaratra', -19.87, 46.97],
  ['Itasy', -19.05, 46.73], ['Bongolava', -18.75, 46.18],
  ['Haute Matsiatra', -21.45, 47.08], ['Amoron’i Mania', -20.55, 47.08],
  ['Vatovavy', -21.2, 48.1], ['Fitovinany', -22.15, 47.8],
  ['Atsimo-Atsinanana', -23.15, 47.3], ['Ihorombe', -22.5, 46.3],
  ['Atsimo-Andrefana', -23.35, 44.65], ['Androy', -24.75, 45.15],
  ['Anosy', -24.1, 46.5], ['Menabe', -20.3, 44.45],
  ['Melaky', -17.7, 44.3], ['Boeny', -16.25, 46.35],
  ['Betsiboka', -17.15, 46.85], ['Sofia', -15.25, 48.2],
  ['Diana', -13.35, 49.15], ['Sava', -14.25, 50.15],
  ['Alaotra-Mangoro', -18, 48.05], ['Atsinanana', -18.55, 49.1],
  ['Analanjirofo', -16.85, 49.65],
] as const

function findRegionName(areaId: string, areas: AdministrativeAreaDto[]) {
  const byId = new Map(areas.map((area) => [area.id, area]))
  let current = byId.get(areaId)
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current.type === 'Region') return current.name
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return null
}

export default function MapScreen() {
  const {t}=usePreferences()
  const mapRef = useRef<MapView>(null)
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

  useFocusEffect(useCallback(() => {
    void loadReferenceData()
  }, [loadReferenceData]))

  const chooseCountry = () => {
    setCountry('Madagascar')
    setCampaignId('')
    setDwellings([])
    mapRef.current?.animateToRegion(madagascarRegion, 650)
  }

  const chooseCampaign = async (id: string) => {
    setCampaignId(id)
    setLoading(true)
    try {
      setDwellings(await mobileApi.dwellings(id))
      mapRef.current?.animateToRegion(madagascarRegion, 500)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.code}`.toLowerCase().includes(search.toLowerCase())),
    [campaigns, search],
  )

  const progressByRegion = useMemo(() => {
    const result = new Map<string, { total: number; validated: number }>()
    for (const dwelling of dwellings) {
      const regionName = findRegionName(dwelling.enumerationAreaId, areas)
      if (!regionName) continue
      const current = result.get(regionName) ?? { total: 0, validated: 0 }
      current.total += 1
      if (dwelling.recordStatus === 'Validated') current.validated += 1
      result.set(regionName, current)
    }
    return result
  }, [areas, dwellings])

  return (
    <View style={styles.screen}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={worldRegion}>
        {country === 'Madagascar' && campaignId && regionCenters.map(([name, latitude, longitude]) => {
          const progress = progressByRegion.get(name)
          const color = !progress?.total
            ? colors.muted
            : progress.validated === progress.total
              ? colors.success
              : colors.primary
          return (
            <Marker
              key={name}
              coordinate={{ latitude, longitude }}
              title={name}
              description={`${progress?.total ?? 0} ${t('totalHouseholds')} · ${progress?.validated ?? 0} ${t('completed')}`}
              pinColor={String(color)}
            />
          )
        })}
        {country === 'Madagascar' && campaignId && dwellings.map((dwelling) => (
          <Marker
            key={dwelling.id}
            coordinate={{ latitude: dwelling.latitude, longitude: dwelling.longitude }}
            title={dwelling.referenceCode}
            description={dwelling.localityName ?? dwelling.address ?? ''}
            pinColor={String(dwelling.recordStatus === 'Validated' ? colors.success : colors.primary)}
          />
        ))}
      </MapView>

      <View style={styles.panel}>
        <View style={styles.heading}>
          <View style={styles.icon}><Globe2 color={colors.primary} size={20} /></View>
          <View style={styles.headingText}>
            <Text style={styles.title}>{t('map')}</Text>
            <Text style={styles.subtitle}>{t('worldMap')} · Madagascar</Text>
          </View>
        </View>

        {!country ? (
          <Pressable style={styles.primaryButton} onPress={chooseCountry}>
            <Text style={styles.primaryButtonText}>{t('selectCountry')} · Madagascar</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campaignList}>
              {filteredCampaigns.map((campaign) => (
                <Pressable
                  key={campaign.id}
                  style={[styles.campaignChip, campaignId === campaign.id && styles.campaignChipActive]}
                  onPress={() => void chooseCampaign(campaign.id)}
                >
                  <Text style={[styles.campaignChipText, campaignId === campaign.id && styles.campaignChipTextActive]}>
                    {campaign.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {loading && <ActivityIndicator style={styles.loader} color={colors.primary} />}
      <Pressable
        style={styles.locate}
        onPress={() => mapRef.current?.animateToRegion(country ? madagascarRegion : worldRegion, 500)}
      >
        <LocateFixed color={colors.primary} size={22} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loader: { position: 'absolute', top: 200, alignSelf: 'center' },
  panel: {
    position: 'absolute', top: 16, left: 16, right: 16,
    backgroundColor: colors.white, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadow,
  },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  headingText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 11, color: colors.muted, marginTop: 2 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 14, padding: 13, marginTop: 14, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '900' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 12, marginTop: 14 },
  searchInput: { flex: 1, paddingVertical: 10, color: colors.text },
  campaignList: { gap: 8, paddingTop: 10 },
  campaignChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.background },
  campaignChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  campaignChipText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  campaignChipTextActive: { color: '#FFFFFF' },
  locate: {
    position: 'absolute', right: 16, bottom: 92, width: 50, height: 50,
    borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadow,
  },
})
