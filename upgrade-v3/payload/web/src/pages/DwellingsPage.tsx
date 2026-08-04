import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, dwellingsApi, territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { DwellingDto } from '../types/api'
import { formatDate } from '../utils/format'

export default function DwellingsPage() {
  const { t } = useI18n()
  const dwellings = useAsync(() => dwellingsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const areas = useAsync(() => territoriesApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [formItem, setFormItem] = useState<DwellingDto | null | undefined>(undefined)
  const [detail, setDetail] = useState<DwellingDto | null>(null)
  const [error, setError] = useState('')

  const fieldAreas = useMemo(
    () => (areas.data ?? []).filter((area) => ['Fokontany', 'EnumerationArea'].includes(area.type)),
    [areas.data],
  )
  const filtered = useMemo(() => (dwellings.data ?? []).filter((item) => {
    const matchesCampaign = !campaignId || item.campaignId === campaignId
    const matchesSearch = `${item.referenceCode} ${item.address ?? ''} ${item.localityName ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
    return matchesCampaign && matchesSearch
  }), [campaignId, dwellings.data, search])

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
        await dwellingsApi.create({
          campaignId: raw.campaignId,
          enumerationAreaId: raw.enumerationAreaId,
          referenceCode: raw.referenceCode,
          address: raw.address || null,
          localityName: raw.localityName || null,
          latitude: Number(raw.latitude),
          longitude: Number(raw.longitude),
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
        actions={<button className="button button--primary" onClick={() => setFormItem(null)}><Plus size={17} />{t('newDwelling')}</button>}
      />
      <section className="card">
        <div className="toolbar toolbar--wrap">
          <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`${t('reference')}, ${t('address')}, ${t('locality')}…`} /></label>
          <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
            <option value="">{t('all')} · {t('campaigns')}</option>
            {campaigns.data?.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
          </select>
        </div>
        {dwellings.loading ? <Loader /> : (
          <DataTable<DwellingDto>
            rows={filtered}
            keyOf={(row) => row.id}
            columns={[
              { key: 'ref', title: t('reference'), render: (row) => <strong>{row.referenceCode}</strong> },
              { key: 'location', title: t('location'), render: (row) => <div><strong>{row.localityName || '—'}</strong><small className="cell-subtitle">{row.address}</small></div> },
              { key: 'gps', title: t('gps'), render: (row) => `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}` },
              { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.recordStatus} /> },
              { key: 'date', title: t('createdOn'), render: (row) => formatDate(row.createdAtUtc) },
              { key: 'actions', title: t('actions'), render: (row) => <div className="inline-actions">
                <button className="icon-button" title={t('details')} onClick={() => setDetail(row)}><Eye size={16} /></button>
                {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button" title={t('edit')} onClick={() => setFormItem(row)}><Pencil size={16} /></button>}
                {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button icon-button--danger" title={t('delete')} onClick={() => void remove(row)}><Trash2 size={16} /></button>}
                {row.recordStatus === 'Draft' && <button className="link-button" onClick={() => void dwellingsApi.submit(row.id).then(dwellings.reload)}>{t('submit')}</button>}
                {row.recordStatus === 'Submitted' && <button className="link-button" onClick={() => void dwellingsApi.validate(row.id).then(dwellings.reload)}>{t('validate')}</button>}
              </div> },
            ]}
          />
        )}
      </section>

      <Modal title={formItem ? t('editDwelling') : t('newDwelling')} open={formItem !== undefined} onClose={() => setFormItem(undefined)}>
        <form className="form-grid" onSubmit={submit}>
          {!formItem && <><label>{t('campaign')}<select name="campaignId" required><option value="">— {t('select')} —</option>{campaigns.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('enumerationArea')}<select name="enumerationAreaId" required><option value="">— {t('select')} —</option>{fieldAreas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('reference')}<input name="referenceCode" required /></label></>}
          <label>{t('locality')}<input name="localityName" defaultValue={formItem?.localityName ?? ''} /></label>
          <label className="span-2">{t('address')}<input name="address" defaultValue={formItem?.address ?? ''} /></label>
          <label>{t('latitude')}<input name="latitude" type="number" step="0.000001" defaultValue={formItem?.latitude} required /></label>
          <label>{t('longitude')}<input name="longitude" type="number" step="0.000001" defaultValue={formItem?.longitude} required /></label>
          {formItem && <label className="span-2">Occupation<select name="occupancyStatus" defaultValue={formItem.occupancyStatus}><option>Unknown</option><option>Occupied</option><option>Vacant</option><option>Collective</option><option>NonResidential</option></select></label>}
          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2"><button type="button" className="button" onClick={() => setFormItem(undefined)}>{t('cancel')}</button><button className="button button--primary">{formItem ? t('save') : t('create')}</button></div>
        </form>
      </Modal>

      <Modal title={t('details')} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && <dl className="detail-list"><div><dt>{t('reference')}</dt><dd>{detail.referenceCode}</dd></div><div><dt>{t('locality')}</dt><dd>{detail.localityName || '—'}</dd></div><div><dt>{t('address')}</dt><dd>{detail.address || '—'}</dd></div><div><dt>{t('gps')}</dt><dd>{detail.latitude}, {detail.longitude}</dd></div><div><dt>{t('status')}</dt><dd><StatusBadge value={detail.recordStatus} /></dd></div></dl>}
      </Modal>
    </>
  )
}
