import L from 'leaflet'
import { Globe2, LocateFixed, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { campaignsApi, dwellingsApi, territoriesApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { madagascarRegions } from '../data/madagascarRegions'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, DwellingDto } from '../types/api'

const iconFor = (status: 'idle' | 'running' | 'done') => L.divIcon({ className: `region-marker region-marker--${status}`, html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 14] })
const dwellingMarker = L.divIcon({ className: 'map-dot', html: '<span></span>', iconSize: [24, 24], iconAnchor: [12, 12] })

function MapView({ country }: { country: string }) {
  const map = useMap()
  useEffect(() => { if (country === 'Madagascar') map.flyTo([-18.8, 46.8], 6, { duration: 1.2 }); else map.flyTo([12, 15], 2, { duration: 1.2 }) }, [country, map])
  return null
}

const findRegion = (leafId: string, areas: AdministrativeAreaDto[]) => {
  const byId = new Map(areas.map((area) => [area.id, area]))
  let current = byId.get(leafId)
  for (let i = 0; current && i < 8; i += 1) { if (current.type === 'Region') return current; current = current.parentId ? byId.get(current.parentId) : undefined }
  return undefined
}

export default function MapPage() {
  const { t } = useI18n()
  const [country, setCountry] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [campaignSearch, setCampaignSearch] = useState('')
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const areas = useAsync(() => territoriesApi.list(), [])
  const dwellings = useAsync(() => campaignId ? dwellingsApi.list({ campaignId }) : Promise.resolve([]), [campaignId])
  const campaign = campaigns.data?.find((item) => item.id === campaignId)
  const filteredCampaigns = useMemo(() => (campaigns.data ?? []).filter((item) => item.name.toLowerCase().includes(campaignSearch.toLowerCase())), [campaignSearch, campaigns.data])
  const counts = useMemo(() => {
    const result = new Map<string, { total: number; validated: number }>()
    for (const dwelling of dwellings.data ?? []) {
      const region = findRegion(dwelling.enumerationAreaId, areas.data ?? [])
      if (!region) continue
      const current = result.get(region.name) ?? { total: 0, validated: 0 }
      current.total += 1
      if (dwelling.recordStatus === 'Validated') current.validated += 1
      result.set(region.name, current)
    }
    return result
  }, [areas.data, dwellings.data])
  const statusFor = (name: string): 'idle' | 'running' | 'done' => {
    const value = counts.get(name)
    if (!value?.total) return 'idle'
    if (value.validated === value.total && campaign && ['Closed', 'Archived'].includes(campaign.status)) return 'done'
    return 'running'
  }

  return <><PageHeader title={t('map')} subtitle={t('mapSubtitle')} />{campaigns.loading || areas.loading ? <Loader /> : <section className="map-workspace"><aside className="card map-control-panel"><div className="map-control-title"><span><Globe2 size={21} /></span><div><h2>{t('filters')}</h2><p>{t('mapHelp')}</p></div></div><label>{t('selectCountry')}<select value={country} onChange={(event) => { setCountry(event.target.value); setCampaignId('') }}><option value="">{t('worldMap')}</option><option value="Madagascar">Madagascar</option></select></label>{country && <><label>{t('campaignSearch')}<div className="input-with-icon"><Search size={16} /><input value={campaignSearch} onChange={(event) => setCampaignSearch(event.target.value)} /></div></label><label>{t('selectCampaign')}<select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">— {t('selectCampaign')} —</option>{filteredCampaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></>}<div className="map-legend"><span><i className="dot" />{t('notStarted')}</span><span><i className="dot dot--blue" />{t('inProgress')}</span><span><i className="dot dot--green" />{t('completed')}</span></div>{campaign && <article className="map-campaign-card"><small>{t('campaignName')}</small><strong>{campaign.name}</strong><StatusBadge value={campaign.status} /><span>{dwellings.data?.length ?? 0} {t('fieldDwellings')}</span></article>}</aside><div className="map-card map-card--world"><MapContainer center={[12, 15]} zoom={2} minZoom={2} scrollWheelZoom><MapView country={country} /><TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{country === 'Madagascar' && campaignId && madagascarRegions.map((region) => { const value = counts.get(region.name); const status = statusFor(region.name); return <Marker key={region.name} position={[region.lat, region.lng]} icon={iconFor(status)}><Popup><strong>{region.name}</strong><br />{value?.total ?? 0} {t('dwellingCount')}<br />{value?.validated ?? 0} {t('validatedCount')}<br /><span className={`map-status map-status--${status}`}>{status === 'idle' ? t('notStarted') : status === 'done' ? t('completed') : t('inProgress')}</span></Popup></Marker> })}{country === 'Madagascar' && campaignId && (dwellings.data ?? []).filter((item: DwellingDto) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).map((item) => <Marker key={item.id} position={[item.latitude, item.longitude]} icon={dwellingMarker}><Popup><strong>{item.referenceCode}</strong><br />{item.localityName}<br /><StatusBadge value={item.recordStatus} /></Popup></Marker>)}</MapContainer><div className="map-floating-tip"><LocateFixed size={17} />{country ? campaignId ? t('synchronizedData') : t('selectCampaign') : t('selectCountry')}</div></div></section>}</>
}
