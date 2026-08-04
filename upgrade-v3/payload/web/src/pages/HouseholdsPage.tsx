import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, dwellingsApi, householdsApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { HouseholdDto } from '../types/api'
import { formatDate } from '../utils/format'

export default function HouseholdsPage() {
  const { t } = useI18n()
  const households = useAsync(() => householdsApi.list(), [])
  const dwellings = useAsync(() => dwellingsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [formItem, setFormItem] = useState<HouseholdDto | null | undefined>(undefined)
  const [detail, setDetail] = useState<HouseholdDto | null>(null)
  const [error, setError] = useState('')

  const filtered = useMemo(() => (households.data ?? []).filter((item) => {
    const matchesCampaign = !campaignId || item.campaignId === campaignId
    const matchesSearch = `${item.referenceCode} ${item.headFullName ?? ''} ${item.phoneNumber ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
    return matchesCampaign && matchesSearch
  }), [campaignId, households.data, search])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      if (formItem) {
        await householdsApi.update(formItem.id, {
          householdType: raw.householdType,
          headFullName: raw.headFullName || null,
          phoneNumber: raw.phoneNumber || null,
          notes: formItem.notes ?? null,
        })
      } else {
        await householdsApi.create(raw)
      }
      setFormItem(undefined)
      await households.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  const remove = async (item: HouseholdDto) => {
    if (!window.confirm(t('confirmDelete'))) return
    await householdsApi.remove(item.id)
    await households.reload()
  }

  return (
    <>
      <PageHeader title={t('households')} subtitle={t('householdsSubtitle')} actions={<button className="button button--primary" onClick={() => setFormItem(null)}><Plus size={17} />{t('newHousehold')}</button>} />
      <section className="card">
        <div className="toolbar toolbar--wrap">
          <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`${t('householdCode')}, ${t('householdHead')}…`} /></label>
          <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">{t('all')} · {t('campaigns')}</option>{campaigns.data?.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select>
        </div>
        {households.loading ? <Loader /> : <DataTable<HouseholdDto> rows={filtered} keyOf={(row) => row.id} columns={[
          { key: 'ref', title: t('householdCode'), render: (row) => <strong>{row.referenceCode}</strong> },
          { key: 'head', title: t('householdHead'), render: (row) => row.headFullName || '—' },
          { key: 'type', title: t('type'), render: (row) => row.householdType },
          { key: 'phone', title: t('phone'), render: (row) => row.phoneNumber || '—' },
          { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.recordStatus} /> },
          { key: 'date', title: t('createdOn'), render: (row) => formatDate(row.createdAtUtc) },
          { key: 'actions', title: t('actions'), render: (row) => <div className="inline-actions">
            <button className="icon-button" onClick={() => setDetail(row)}><Eye size={16} /></button>
            {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button" onClick={() => setFormItem(row)}><Pencil size={16} /></button>}
            {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button icon-button--danger" onClick={() => void remove(row)}><Trash2 size={16} /></button>}
            {row.recordStatus === 'Draft' && <button className="link-button" onClick={() => void householdsApi.submit(row.id).then(households.reload)}>{t('submit')}</button>}
            {row.recordStatus === 'Submitted' && <button className="link-button" onClick={() => void householdsApi.validate(row.id).then(households.reload)}>{t('validate')}</button>}
          </div> },
        ]} />}
      </section>

      <Modal title={formItem ? t('editHousehold') : t('newHousehold')} open={formItem !== undefined} onClose={() => setFormItem(undefined)}>
        <form className="form-grid" onSubmit={submit}>
          {!formItem && <><label className="span-2">{t('dwelling')}<select name="dwellingId" required><option value="">— {t('select')} —</option>{dwellings.data?.filter((item) => !campaignId || item.campaignId === campaignId).map((item) => <option key={item.id} value={item.id}>{item.referenceCode} — {item.localityName}</option>)}</select></label><label>{t('reference')}<input name="referenceCode" required /></label></>}
          <label>{t('type')}<select name="householdType" defaultValue={formItem?.householdType ?? 'Ordinary'}><option value="Ordinary">{t('ordinary')}</option><option value="Collective">{t('collective')}</option><option value="Homeless">{t('homeless')}</option></select></label>
          <label>{t('householdHead')}<input name="headFullName" defaultValue={formItem?.headFullName ?? ''} /></label>
          <label>{t('phone')}<input name="phoneNumber" defaultValue={formItem?.phoneNumber ?? ''} /></label>
          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2"><button type="button" className="button" onClick={() => setFormItem(undefined)}>{t('cancel')}</button><button className="button button--primary">{formItem ? t('save') : t('create')}</button></div>
        </form>
      </Modal>

      <Modal title={t('details')} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && <dl className="detail-list"><div><dt>{t('householdCode')}</dt><dd>{detail.referenceCode}</dd></div><div><dt>{t('householdHead')}</dt><dd>{detail.headFullName || '—'}</dd></div><div><dt>{t('type')}</dt><dd>{detail.householdType}</dd></div><div><dt>{t('phone')}</dt><dd>{detail.phoneNumber || '—'}</dd></div><div><dt>{t('status')}</dt><dd><StatusBadge value={detail.recordStatus} /></dd></div></dl>}
      </Modal>
    </>
  )
}
