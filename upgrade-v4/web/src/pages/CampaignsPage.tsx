import { CalendarClock, Globe2, MapPinned, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import SearchableSelect from '../components/common/SearchableSelect'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, AdministrativeAreaType, CampaignDto, CampaignStatus } from '../types/api'
import { formatDate } from '../utils/format'

const statuses: CampaignStatus[] = ['Draft', 'Scheduled', 'Active', 'Suspended', 'Closed', 'Archived']
const makeCode = (name: string) => {
  const label = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'CENSUS'
  return `${label}-${new Date().getFullYear()}`.toUpperCase()
}
const children = (areas: AdministrativeAreaDto[], parentId: string, type: AdministrativeAreaType) =>
  areas.filter((area) => area.parentId === parentId && area.type === type)

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

  const areas = territories.data ?? []
  const countries = areas.filter((area) => area.type === 'Country')
  const regions = children(areas, countryId, 'Region')
  const districts = children(areas, regionId, 'District')
  const communes = children(areas, districtId, 'Commune')
  const scopeId = scopeType === 'Country'
    ? countryId
    : scopeType === 'Region'
      ? regionId
      : scopeType === 'District'
        ? districtId
        : communeId
  const areaName = (id: string) => areas.find((area) => area.id === id)?.name ?? '—'

  const filtered = useMemo(
    () => (campaigns.data ?? []).filter((campaign) =>
      `${campaign.code} ${campaign.name} ${areaName(campaign.scopeAdministrativeAreaId)}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    ),
    [areas, campaigns.data, search],
  )

  const reset = () => {
    setScopeType('Country')
    setCountryId(areas.find((area) => area.type === 'Country' && area.name.toLocaleLowerCase().includes('madagas'))?.id ?? '')
    setRegionId('')
    setDistrictId('')
    setCommuneId('')
    setError('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!scopeId) {
      setError(t('geographicSelectionRequired'))
      return
    }
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    const startDate = String(data.startDate)
    const endDate = String(data.endDate)
    if (endDate < startDate) {
      setError(t('invalidCampaignDates'))
      return
    }

    try {
      const name = String(data.name).trim()
      const created = await campaignsApi.create({
        code: String(data.code || makeCode(name)),
        name,
        description: String(data.description || ''),
        startDate,
        endDate,
        scopeAdministrativeAreaId: scopeId,
      })
      const mode = String(data.launchMode)
      if (mode === 'Active') await campaignsApi.changeStatus(created.id, 'Active')
      if (mode === 'Scheduled') await campaignsApi.changeStatus(created.id, 'Scheduled')
      setOpen(false)
      reset()
      await campaigns.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  return (
    <>
      <PageHeader
        title={t('campaigns')}
        subtitle={t('campaignSubtitle')}
        actions={(
          <button className="button button--primary" onClick={() => { reset(); setOpen(true) }}>
            <Plus size={17} />
            {t('newCampaign')}
          </button>
        )}
      />

      <section className="campaign-summary">
        <article className="card"><span><CalendarClock size={20} /></span><div><strong>{campaigns.data?.length ?? 0}</strong><small>{t('campaigns')}</small></div></article>
        <article className="card"><span><Globe2 size={20} /></span><div><strong>{campaigns.data?.filter((item) => item.status === 'Active').length ?? 0}</strong><small>{t('inProgress')}</small></div></article>
        <article className="card"><span><MapPinned size={20} /></span><div><strong>{campaigns.data?.filter((item) => item.status === 'Scheduled').length ?? 0}</strong><small>{t('scheduled')}</small></div></article>
      </section>

      <section className="card">
        <div className="toolbar">
          <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('campaignSearch')} /></label>
        </div>
        {campaigns.loading || territories.loading ? <Loader /> : (
          <DataTable<CampaignDto>
            rows={filtered}
            keyOf={(row) => row.id}
            columns={[
              { key: 'campaign', title: t('campaignName'), render: (row) => <div><strong>{row.name}</strong><small className="cell-subtitle">{row.code} · {row.description}</small></div> },
              { key: 'place', title: t('location'), render: (row) => areaName(row.scopeAdministrativeAreaId) },
              { key: 'dates', title: t('period'), render: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}` },
              { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.status} /> },
              { key: 'action', title: t('changeStatus'), render: (row) => <select className="select select--small" value={row.status} onChange={(event) => void campaignsApi.changeStatus(row.id, event.target.value).then(campaigns.reload)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select> },
            ]}
          />
        )}
      </section>

      <Modal title={t('newCampaign')} open={open} onClose={() => setOpen(false)}>
        <form className="form-grid campaign-form" onSubmit={submit}>
          <div className="form-section-title">1. {t('campaignInfo')}</div>
          <label className="span-2">{t('campaignName')}<input name="name" required /></label>
          <label>{t('campaignCode')}<input name="code" placeholder={t('automaticReference')} /></label>
          <label>{t('scope')}<select value={scopeType} onChange={(event) => { setScopeType(event.target.value as typeof scopeType); setRegionId(''); setDistrictId(''); setCommuneId('') }}><option value="Country">{t('wholeCountry')}</option><option value="Region">{t('oneRegion')}</option><option value="District">{t('oneDistrict')}</option><option value="Commune">{t('oneCommune')}</option></select></label>
          <label>{t('startDate')}<input name="startDate" type="date" required /></label>
          <label>{t('endDate')}<input name="endDate" type="date" required /></label>

          <div className="form-section-title">2. {t('location')}</div>
          <SearchableSelect label={t('country')} value={countryId} onChange={(value) => { setCountryId(value); setRegionId(''); setDistrictId(''); setCommuneId('') }} required placeholder={t('typeCountry')} options={countries.map((area) => ({ value: area.id, label: area.name, description: area.code }))} />
          {scopeType !== 'Country' && <SearchableSelect label={t('region')} value={regionId} onChange={(value) => { setRegionId(value); setDistrictId(''); setCommuneId('') }} required disabled={!countryId} placeholder={t('typeRegion')} options={regions.map((area) => ({ value: area.id, label: area.name, description: area.code }))} />}
          {['District', 'Commune'].includes(scopeType) && <SearchableSelect label={t('district')} value={districtId} onChange={(value) => { setDistrictId(value); setCommuneId('') }} required disabled={!regionId} placeholder={t('typeToSearchDistrict')} options={districts.map((area) => ({ value: area.id, label: area.name, description: area.code }))} />}
          {scopeType === 'Commune' && <SearchableSelect label={t('commune')} value={communeId} onChange={setCommuneId} required disabled={!districtId} placeholder={t('typeToSearchCommune')} options={communes.map((area) => ({ value: area.id, label: area.name, description: area.code }))} />}

          <div className="form-section-title">3. {t('startMode')}</div>
          <fieldset className="span-2 launch-options">
            <label><input type="radio" name="launchMode" value="Active" /><span><strong>{t('startNow')}</strong><small>{t('collectionImmediate')}</small></span></label>
            <label><input type="radio" name="launchMode" value="Scheduled" defaultChecked /><span><strong>{t('schedule')}</strong><small>{t('collectionScheduled')}</small></span></label>
            <label><input type="radio" name="launchMode" value="Draft" /><span><strong>{t('keepPending')}</strong><small>{t('collectionPending')}</small></span></label>
          </fieldset>
          <label className="span-2">{t('description')}<textarea name="description" rows={3} /></label>
          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>{t('cancel')}</button><button className="button button--primary">{t('create')}</button></div>
        </form>
      </Modal>
    </>
  )
}
