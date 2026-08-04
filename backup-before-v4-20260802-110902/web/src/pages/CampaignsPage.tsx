import { CalendarClock, Globe2, MapPinned, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, AdministrativeAreaType, CampaignDto, CampaignStatus } from '../types/api'
import { formatDate } from '../utils/format'

const statuses: CampaignStatus[] = ['Draft', 'Scheduled', 'Active', 'Suspended', 'Closed', 'Archived']
const childrenOf = (areas: AdministrativeAreaDto[], parentId: string | null, type: AdministrativeAreaType) => areas.filter((area) => area.type === type && (parentId ? area.parentId === parentId : !area.parentId))
const makeCode = (name: string) => `${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'CENSUS'}-${new Date().getFullYear()}`.toUpperCase()

export default function CampaignsPage() {
  const { t } = useI18n()
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const territories = useAsync(() => territoriesApi.list(), [])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [scopeType, setScopeType] = useState<'Country' | 'Region' | 'District' | 'Commune'>('Country')
  const [countryId, setCountryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const [areaSearch, setAreaSearch] = useState('')
  const areas = territories.data ?? []
  const countries = areas.filter((area) => area.type === 'Country')
  const regions = childrenOf(areas, countryId, 'Region')
  const districts = childrenOf(areas, regionId, 'District')
  const communes = childrenOf(areas, districtId, 'Commune')
  const scopeId = scopeType === 'Country' ? countryId : scopeType === 'Region' ? regionId : scopeType === 'District' ? districtId : communeId
  const filterOptions = (values: AdministrativeAreaDto[]) => values.filter((area) => area.name.toLowerCase().includes(areaSearch.toLowerCase()))
  const filtered = useMemo(() => (campaigns.data ?? []).filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase())), [campaigns.data, search])

  const resetForm = () => { setScopeType('Country'); setCountryId(''); setRegionId(''); setDistrictId(''); setCommuneId(''); setAreaSearch(''); setError('') }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    if (!scopeId) { setError(t('geographicSelectionRequired')); return }
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const name = String(data.name)
      const created = await campaignsApi.create({ code: String(data.code || makeCode(name)), name, description: String(data.description || ''), startDate: data.startDate, endDate: data.endDate, scopeAdministrativeAreaId: scopeId })
      const mode = String(data.launchMode)
      if (mode === 'Active') await campaignsApi.changeStatus(created.id, 'Active')
      if (mode === 'Scheduled') await campaignsApi.changeStatus(created.id, 'Scheduled')
      setOpen(false); resetForm(); await campaigns.reload()
    } catch (exception) { setError(getErrorMessage(exception)) }
  }

  return <>
    <PageHeader title={t('campaigns')} subtitle={t('campaignSubtitle')} actions={<button className="button button--primary" onClick={() => { resetForm(); setOpen(true) }}><Plus size={17} />{t('newCampaign')}</button>} />
    <section className="campaign-summary"><article className="card"><span><CalendarClock size={20} /></span><div><strong>{campaigns.data?.length ?? 0}</strong><small>{t('campaigns')}</small></div></article><article className="card"><span><Globe2 size={20} /></span><div><strong>{campaigns.data?.filter((item) => item.status === 'Active').length ?? 0}</strong><small>{t('inProgress')}</small></div></article><article className="card"><span><MapPinned size={20} /></span><div><strong>{campaigns.data?.filter((item) => item.status === 'Scheduled').length ?? 0}</strong><small>{t('scheduled')}</small></div></article></section>
    <section className="card"><div className="toolbar"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('campaignSearch')} /></label></div>{campaigns.loading ? <Loader /> : <DataTable<CampaignDto> rows={filtered} keyOf={(row) => row.id} columns={[
      { key: 'campaign', title: t('campaignName'), render: (row) => <div><strong>{row.name}</strong><small className="cell-subtitle">{row.code} · {row.description}</small></div> },
      { key: 'dates', title: t('period'), render: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}` },
      { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.status} /> },
      { key: 'action', title: t('changeStatus'), render: (row) => <select className="select select--small" value={row.status} onChange={(event) => void campaignsApi.changeStatus(row.id, event.target.value).then(campaigns.reload)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select> },
    ]} />}</section>

    <Modal title={t('newCampaign')} open={open} onClose={() => setOpen(false)}><form className="form-grid campaign-form" onSubmit={submit}><label className="span-2">{t('campaignName')}<input name="name" required onBlur={(event) => { const code = event.currentTarget.form?.elements.namedItem('code') as HTMLInputElement | null; if (code && !code.value) code.value = makeCode(event.currentTarget.value) }} /></label><label>{t('campaignCode')}<input name="code" placeholder="AUTO-2026" /></label><label>{t('scope')}<select value={scopeType} onChange={(event) => setScopeType(event.target.value as typeof scopeType)}><option value="Country">{t('wholeCountry')}</option><option value="Region">{t('oneRegion')}</option><option value="District">{t('oneDistrict')}</option><option value="Commune">{t('oneCommune')}</option></select></label><label>{t('startDate')}<input name="startDate" type="date" required /></label><label>{t('endDate')}<input name="endDate" type="date" required /></label><label className="span-2">{t('geographicSearch')}<input value={areaSearch} onChange={(event) => setAreaSearch(event.target.value)} placeholder={`${t('search')} Madagascar, Analamanga…`} /></label><label>{t('country')}<select value={countryId} onChange={(event) => { setCountryId(event.target.value); setRegionId(''); setDistrictId(''); setCommuneId('') }} required><option value="">— {t('country')} —</option>{filterOptions(countries).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>{scopeType !== 'Country' && <label>{t('region')}<select value={regionId} onChange={(event) => { setRegionId(event.target.value); setDistrictId(''); setCommuneId('') }} required><option value="">— {t('region')} —</option>{filterOptions(regions).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>}{['District', 'Commune'].includes(scopeType) && <label>{t('district')}<select value={districtId} onChange={(event) => { setDistrictId(event.target.value); setCommuneId('') }} required><option value="">— {t('district')} —</option>{filterOptions(districts).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>}{scopeType === 'Commune' && <label>{t('commune')}<select value={communeId} onChange={(event) => setCommuneId(event.target.value)} required><option value="">— {t('commune')} —</option>{filterOptions(communes).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>}<fieldset className="span-2 launch-options"><legend>{t('startMode')}</legend><label><input type="radio" name="launchMode" value="Active" /> <span><strong>{t('startNow')}</strong><small>{t('collectionImmediate')}</small></span></label><label><input type="radio" name="launchMode" value="Scheduled" defaultChecked /> <span><strong>{t('schedule')}</strong><small>{t('collectionScheduled')}</small></span></label><label><input type="radio" name="launchMode" value="Draft" /> <span><strong>{t('keepPending')}</strong><small>{t('collectionPending')}</small></span></label></fieldset><label className="span-2">{t('description')}<textarea name="description" rows={3} /></label>{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>{t('cancel')}</button><button className="button button--primary">{t('create')}</button></div></form></Modal>
  </>
}
