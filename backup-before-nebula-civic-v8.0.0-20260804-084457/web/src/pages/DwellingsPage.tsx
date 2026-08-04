import { Eye, LocateFixed, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, dwellingsApi, territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import SearchableSelect from '../components/common/SearchableSelect'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, DwellingDto } from '../types/api'
import { formatDate } from '../utils/format'

const makeReference = () => {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
  return `HAB-${date}-${suffix}`
}

const descendants = (
  areas: AdministrativeAreaDto[],
  parentId: string,
  type: AdministrativeAreaDto['type'],
) => areas.filter((area) => area.parentId === parentId && area.type === type)

export default function DwellingsPage() {
  const { t } = useI18n()
  const dwellings = useAsync(() => dwellingsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const areas = useAsync(() => territoriesApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [formItem, setFormItem] = useState<DwellingDto | null | undefined>(undefined)
  const [detail, setDetail] = useState<DwellingDto | null>(null)
  const [error, setError] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [communeId, setCommuneId] = useState('')
  const [fokontanyId, setFokontanyId] = useState('')
  const [reference, setReference] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)

  const areaRows = areas.data ?? []
  const districts = areaRows.filter((area) => area.type === 'District')
  const communes = descendants(areaRows, districtId, 'Commune')
  const fokontany = descendants(areaRows, communeId, 'Fokontany')

  const areaName = (id: string) => areaRows.find((area) => area.id === id)?.name ?? ''
  const filtered = useMemo(
    () => (dwellings.data ?? []).filter((item) => {
      const inCampaign = !campaignFilter || item.campaignId === campaignFilter
      const text = `${item.referenceCode} ${item.address ?? ''} ${item.localityName ?? ''}`
        .toLocaleLowerCase()
      return inCampaign && text.includes(search.toLocaleLowerCase())
    }),
    [campaignFilter, dwellings.data, search],
  )

  const openCreate = () => {
    setFormItem(null)
    setCampaignId('')
    setDistrictId('')
    setCommuneId('')
    setFokontanyId('')
    setReference(makeReference())
    setLatitude('')
    setLongitude('')
    setAccuracy(null)
    setError('')
  }

  const captureGps = () => {
    if (!navigator.geolocation) {
      setError(t('gpsUnavailable'))
      return
    }

    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude))
        setLongitude(String(position.coords.longitude))
        setAccuracy(position.coords.accuracy)
        setLocating(false)
      },
      (failure) => {
        setError(failure.message || t('gpsUnavailable'))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())

    try {
      if (formItem) {
        await dwellingsApi.update(formItem.id, {
          address: raw.address || null,
          localityName: raw.localityName || null,
          latitude: Number(raw.latitude),
          longitude: Number(raw.longitude),
          occupancyStatus: raw.occupancyStatus,
          notes: formItem.notes ?? null,
        })
      } else {
        if (!campaignId || !districtId || !communeId || !fokontanyId) {
          setError(t('completeLocation'))
          return
        }
        if (!latitude || !longitude) {
          setError(t('verifyGpsFirst'))
          return
        }

        await dwellingsApi.create({
          campaignId,
          enumerationAreaId: fokontanyId,
          referenceCode: reference || null,
          address: raw.address || null,
          localityName: areaName(fokontanyId),
          latitude: Number(latitude),
          longitude: Number(longitude),
          notes: JSON.stringify({
            district: areaName(districtId),
            commune: areaName(communeId),
            fokontany: areaName(fokontanyId),
            gpsAccuracy: accuracy,
          }),
        })
      }

      setFormItem(undefined)
      await dwellings.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  const remove = async (item: DwellingDto) => {
    if (!window.confirm(t('confirmDelete'))) return
    await dwellingsApi.remove(item.id)
    await dwellings.reload()
  }

  return (
    <>
      <PageHeader
        title={t('dwellings')}
        subtitle={t('dwellingsSubtitle')}
        actions={(
          <button className="button button--primary" onClick={openCreate}>
            <Plus size={17} />
            {t('newDwelling')}
          </button>
        )}
      />

      <section className="card">
        <div className="toolbar toolbar--wrap">
          <label className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`${t('reference')}, ${t('fokontany')}…`}
            />
          </label>
          <select
            value={campaignFilter}
            onChange={(event) => setCampaignFilter(event.target.value)}
          >
            <option value="">{t('all')} · {t('campaigns')}</option>
            {campaigns.data?.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>

        {dwellings.loading ? <Loader /> : (
          <DataTable<DwellingDto>
            rows={filtered}
            keyOf={(row) => row.id}
            columns={[
              {
                key: 'ref',
                title: t('reference'),
                render: (row) => <strong>{row.referenceCode}</strong>,
              },
              {
                key: 'location',
                title: t('location'),
                render: (row) => (
                  <div>
                    <strong>{row.localityName || '—'}</strong>
                    <small className="cell-subtitle">{row.address}</small>
                  </div>
                ),
              },
              {
                key: 'gps',
                title: t('gps'),
                render: (row) => `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`,
              },
              {
                key: 'status',
                title: t('status'),
                render: (row) => <StatusBadge value={row.recordStatus} />,
              },
              {
                key: 'date',
                title: t('createdOn'),
                render: (row) => formatDate(row.createdAtUtc),
              },
              {
                key: 'actions',
                title: t('actions'),
                render: (row) => (
                  <div className="inline-actions">
                    <button className="icon-button" title={t('details')} onClick={() => setDetail(row)}><Eye size={16} /></button>
                    {['Draft', 'Rejected'].includes(row.recordStatus) && (
                      <button className="icon-button" title={t('edit')} onClick={() => setFormItem(row)}><Pencil size={16} /></button>
                    )}
                    {['Draft', 'Rejected'].includes(row.recordStatus) && (
                      <button className="icon-button icon-button--danger" title={t('delete')} onClick={() => void remove(row)}><Trash2 size={16} /></button>
                    )}
                    {row.recordStatus === 'Draft' && (
                      <button className="link-button" onClick={() => void dwellingsApi.submit(row.id).then(dwellings.reload)}>{t('submit')}</button>
                    )}
                    {row.recordStatus === 'Submitted' && (
                      <button className="link-button" onClick={() => void dwellingsApi.validate(row.id).then(dwellings.reload)}>{t('validate')}</button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        title={formItem ? t('editDwelling') : t('newDwelling')}
        open={formItem !== undefined}
        onClose={() => setFormItem(undefined)}
      >
        <form className="form-grid" onSubmit={submit}>
          {!formItem && (
            <>
              <div className="form-section-title">1. {t('campaignAndLocation')}</div>
              <SearchableSelect
                label={t('campaign')}
                value={campaignId}
                onChange={setCampaignId}
                required
                placeholder={t('typeToSearchCampaign')}
                options={(campaigns.data ?? []).map((campaign) => ({
                  value: campaign.id,
                  label: `${campaign.name} — ${campaign.code}`,
                  description: campaign.status,
                }))}
              />
              <SearchableSelect
                label={t('district')}
                value={districtId}
                onChange={(value) => {
                  setDistrictId(value)
                  setCommuneId('')
                  setFokontanyId('')
                }}
                required
                placeholder={t('typeToSearchDistrict')}
                options={districts.map((area) => ({ value: area.id, label: area.name, description: area.code }))}
              />
              <SearchableSelect
                label={t('commune')}
                value={communeId}
                onChange={(value) => {
                  setCommuneId(value)
                  setFokontanyId('')
                }}
                required
                disabled={!districtId}
                placeholder={t('typeToSearchCommune')}
                options={communes.map((area) => ({ value: area.id, label: area.name, description: area.code }))}
              />
              <SearchableSelect
                label={t('fokontany')}
                value={fokontanyId}
                onChange={setFokontanyId}
                required
                disabled={!communeId}
                placeholder={t('typeToSearchFokontany')}
                options={fokontany.map((area) => ({ value: area.id, label: area.name, description: area.code }))}
              />
              <div className="form-section-title">2. {t('automaticReference')}</div>
              <label className="span-2">
                {t('reference')}
                <div className="reference-preview">{reference}</div>
              </label>
              <div className="form-section-title">3. {t('gpsVerification')}</div>
              <div className="gps-check span-2">
                <div className="gps-check__line">
                  <button type="button" className="button button--secondary" onClick={captureGps} disabled={locating}>
                    <LocateFixed size={17} />
                    {locating ? t('locating') : t('verifyGps')}
                  </button>
                  <span className="gps-check__value">
                    {latitude && longitude
                      ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}${accuracy ? ` · ±${Math.round(accuracy)} m` : ''}`
                      : t('gpsNotCaptured')}
                  </span>
                </div>
              </div>
              <input type="hidden" name="latitude" value={latitude} />
              <input type="hidden" name="longitude" value={longitude} />
              <label className="span-2">
                {t('address')} ({t('optional')})
                <input name="address" placeholder={t('addressLandmark')} />
              </label>
            </>
          )}

          {formItem && (
            <>
              <label>{t('locality')}<input name="localityName" defaultValue={formItem.localityName ?? ''} /></label>
              <label className="span-2">{t('address')}<input name="address" defaultValue={formItem.address ?? ''} /></label>
              <label>{t('latitude')}<input name="latitude" type="number" step="0.000001" defaultValue={formItem.latitude} required /></label>
              <label>{t('longitude')}<input name="longitude" type="number" step="0.000001" defaultValue={formItem.longitude} required /></label>
              <label className="span-2">
                {t('type')}
                <select name="occupancyStatus" defaultValue={formItem.occupancyStatus}>
                  <option value="Unknown">{t('notStated')}</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Collective">Collective</option>
                  <option value="NonResidential">NonResidential</option>
                </select>
              </label>
            </>
          )}

          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2">
            <button type="button" className="button" onClick={() => setFormItem(undefined)}>{t('cancel')}</button>
            <button className="button button--primary">{formItem ? t('save') : t('create')}</button>
          </div>
        </form>
      </Modal>

      <Modal title={t('details')} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && (
          <dl className="detail-list">
            <div><dt>{t('reference')}</dt><dd>{detail.referenceCode}</dd></div>
            <div><dt>{t('locality')}</dt><dd>{detail.localityName || '—'}</dd></div>
            <div><dt>{t('address')}</dt><dd>{detail.address || '—'}</dd></div>
            <div><dt>{t('gps')}</dt><dd>{detail.latitude}, {detail.longitude}</dd></div>
            <div><dt>{t('status')}</dt><dd><StatusBadge value={detail.recordStatus} /></dd></div>
          </dl>
        )}
      </Modal>
    </>
  )
}
