import { BarChart3, Download, FileImage, FileText, Filter, GraduationCap, Home, UsersRound } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { analyticsApi, campaignsApi, territoriesApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto } from '../types/api'
import { formatNumber } from '../utils/format'

const childAreas = (areas: AdministrativeAreaDto[], parentId: string, type: string) => areas.filter((item) => item.parentId === parentId && item.type === type)

export default function StatisticsPage() {
  const { t } = useI18n()
  const reportRef = useRef<HTMLElement>(null)
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const areas = useAsync(() => territoriesApi.list(), [])
  const [campaignId, setCampaignId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const selectedCampaignId = campaignId || campaigns.data?.find((item) => item.status === 'Active')?.id || campaigns.data?.[0]?.id || ''
  const allAreas = areas.data ?? []
  const countries = allAreas.filter((item) => item.type === 'Country')
  const selectedCountryId = countryId || countries[0]?.id || ''
  const regions = childAreas(allAreas, selectedCountryId, 'Region')
  const districts = childAreas(allAreas, regionId, 'District')
  const communes = childAreas(allAreas, districtId, 'Commune')
  const selectedAreaId = communeId || districtId || regionId || selectedCountryId
  const analytics = useAsync(() => selectedCampaignId && selectedAreaId ? analyticsApi.get(selectedCampaignId, selectedAreaId) : Promise.resolve(null), [selectedAreaId, selectedCampaignId])
  const data = analytics.data
  const ageData = useMemo(() => data ? [{ name: t('children'), value: data.children }, { name: t('youth'), value: data.youth }, { name: t('adults'), value: data.adults }, { name: t('seniors'), value: data.seniors }] : [], [data, t])
  const sexData = useMemo(() => data ? [{ name: t('women'), value: data.femaleCitizens }, { name: t('men'), value: data.maleCitizens }] : [], [data, t])

  const exportImage = () => {
    if (!data) return
    const safe = (value: string) => value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character)
    const bars = data.topAreas.map((item, index) => `<text x="70" y="${410 + index * 54}" font-size="17" fill="#20304a">${safe(item.areaName)}</text><rect x="330" y="${390 + index * 54}" width="${Math.max(8, (item.citizens / Math.max(1, data.topAreas[0]?.citizens ?? 1)) * 700)}" height="28" rx="8" fill="#16b3a3"/><text x="1060" y="${410 + index * 54}" text-anchor="end" font-size="17" font-weight="700" fill="#20304a">${item.citizens}</text>`).join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#18213e"/><stop offset="1" stop-color="#322a74"/></linearGradient></defs><rect width="1200" height="760" fill="#f7f8fc"/><rect x="35" y="35" width="1130" height="150" rx="28" fill="url(#g)"/><text x="70" y="92" font-size="20" fill="#78dfd0">CENSUS FLOW · RAPPORT VALIDÉ</text><text x="70" y="142" font-size="36" font-weight="800" fill="white">${safe(data.campaignName)}</text><text x="1125" y="142" text-anchor="end" font-size="22" fill="#dbe4ff">${safe(data.areaName)}</text><g font-family="Arial, sans-serif"><text x="70" y="250" font-size="18" fill="#60708a">Citoyens</text><text x="70" y="300" font-size="42" font-weight="800" fill="#18213e">${data.totalCitizens}</text><text x="360" y="250" font-size="18" fill="#60708a">Ménages</text><text x="360" y="300" font-size="42" font-weight="800" fill="#18213e">${data.totalHouseholds}</text><text x="650" y="250" font-size="18" fill="#60708a">Habitations</text><text x="650" y="300" font-size="42" font-weight="800" fill="#18213e">${data.totalDwellings}</text><text x="940" y="250" font-size="18" fill="#60708a">Étudiants</text><text x="940" y="300" font-size="42" font-weight="800" fill="#18213e">${data.students}</text><text x="70" y="360" font-size="23" font-weight="750" fill="#18213e">${safe(t('topFive'))}</text>${bars}<text x="70" y="720" font-size="14" fill="#718096">Données synchronisées et validées uniquement · ${new Date().toLocaleDateString()}</text></g></svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `statistiques-${data.areaName}.svg`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <><PageHeader title={t('statistics')} subtitle={t('statsSubtitle')} actions={<div className="page-actions"><button className="button" disabled={!data} onClick={() => window.print()}><FileText size={17} />{t('exportPdf')}</button><button className="button button--primary" disabled={!data} onClick={exportImage}><FileImage size={17} />{t('exportImage')}</button></div>} />
    <section className="card stats-filters"><header><Filter size={19} /><div><strong>{t('filters')}</strong><small>{t('validatedOnly')}</small></div></header><label>{t('country')}<select value={selectedCountryId} onChange={(event) => { setCountryId(event.target.value); setRegionId(''); setDistrictId(''); setCommuneId('') }}><option value="">—</option>{countries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('campaigns')}<select value={selectedCampaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">—</option>{campaigns.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('region')}<select value={regionId} onChange={(event) => { setRegionId(event.target.value); setDistrictId(''); setCommuneId('') }}><option value="">{t('all')}</option>{regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('district')}<select value={districtId} onChange={(event) => { setDistrictId(event.target.value); setCommuneId('') }} disabled={!regionId}><option value="">{t('all')}</option>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('commune')}<select value={communeId} onChange={(event) => setCommuneId(event.target.value)} disabled={!districtId}><option value="">{t('all')}</option>{communes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></section>
    {campaigns.loading || areas.loading || analytics.loading ? <Loader /> : !data ? <section className="card empty-stats"><BarChart3 size={36} /><h2>{t('noValidatedData')}</h2></section> : <section ref={reportRef} className="stats-report print-report"><header className="stats-report__header"><div><span>Census Flow · {t('validatedOnly')}</span><h2>{data.campaignName}</h2><p>{data.areaName} · {data.areaType}</p></div><Download size={28} /></header><div className="stats-kpi-grid"><article><span><UsersRound size={21} /></span><small>{t('totalCitizens')}</small><strong>{formatNumber(data.totalCitizens)}</strong></article><article><span><Home size={21} /></span><small>{t('totalHouseholds')}</small><strong>{formatNumber(data.totalHouseholds)}</strong></article><article><span><BarChart3 size={21} /></span><small>{t('totalDwellings')}</small><strong>{formatNumber(data.totalDwellings)}</strong></article><article><span><GraduationCap size={21} /></span><small>{t('students')}</small><strong>{formatNumber(data.students)}</strong></article></div><div className="stats-chart-grid"><article className="card chart-card"><h3>{t('ageDistribution')}</h3><div className="chart-height"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageData} margin={{ left: 8, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="value" className="chart-bar" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="card chart-card"><h3>{t('sexDistribution')}</h3><div className="chart-height"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sexData} dataKey="value" outerRadius={100} innerRadius={55} paddingAngle={4} label><Cell className="pie-women" /><Cell className="pie-men" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div></article><article className="card ranking-card"><h3>{t('topFive')}</h3>{data.topAreas.length ? <ol>{data.topAreas.map((item, index) => <li key={item.areaId}><span>{index + 1}</span><div><strong>{item.areaName}</strong><small>{item.areaType}</small></div><b>{formatNumber(item.citizens)}</b></li>)}</ol> : <p>{t('noValidatedData')}</p>}</article><article className="card demographics-card"><h3>{t('demographicIndicators')}</h3><div><span><i style={{ width: `${data.totalCitizens ? data.femaleCitizens / data.totalCitizens * 100 : 0}%` }} /></span><p>{t('women')} <strong>{formatNumber(data.femaleCitizens)}</strong></p></div><div><span><i style={{ width: `${data.totalCitizens ? data.maleCitizens / data.totalCitizens * 100 : 0}%` }} /></span><p>{t('men')} <strong>{formatNumber(data.maleCitizens)}</strong></p></div><div><span><i style={{ width: `${data.totalCitizens ? data.students / data.totalCitizens * 100 : 0}%` }} /></span><p>{t('students')} <strong>{formatNumber(data.students)}</strong></p></div></article></div></section>}
  </>
}
