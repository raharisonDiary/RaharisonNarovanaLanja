import { Eye, Pencil, Plus, Search, Trash2, UserPlus, UsersRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { campaignsApi, dwellingsApi, householdsApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import SearchableSelect from '../components/common/SearchableSelect'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { HouseholdDto } from '../types/api'
import { formatDate } from '../utils/format'

const makeReference = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()
  return `MNG-${date}-${suffix}`
}

export default function HouseholdsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const households = useAsync(() => householdsApi.list(), [])
  const dwellings = useAsync(() => dwellingsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [formItem, setFormItem] = useState<HouseholdDto | null | undefined>(undefined)
  const [detail, setDetail] = useState<HouseholdDto | null>(null)
  const [created, setCreated] = useState<HouseholdDto | null>(null)
  const [error, setError] = useState('')
  const [dwellingId, setDwellingId] = useState('')
  const [reference, setReference] = useState('')

  const filtered = useMemo(
    () => (households.data ?? []).filter((item) => {
      const matchesCampaign = !campaignId || item.campaignId === campaignId
      const matchesSearch = `${item.referenceCode} ${item.headFullName ?? ''} ${item.phoneNumber ?? ''}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
      return matchesCampaign && matchesSearch
    }),
    [campaignId, households.data, search],
  )

  const openCreate = () => {
    setFormItem(null)
    setDwellingId('')
    setReference(makeReference())
    setError('')
  }

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
        setFormItem(undefined)
      } else {
        if (!dwellingId) {
          setError(t('selectDwellingFirst'))
          return
        }
        const result = await householdsApi.create({
          dwellingId,
          referenceCode: reference || null,
          householdType: raw.householdType,
          headFullName: raw.headFullName,
          phoneNumber: raw.phoneNumber || null,
        })
        setFormItem(undefined)
        setCreated(result)
      }
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

  const addCitizen = (householdId: string) => {
    setCreated(null)
    navigate(`/persons?householdId=${householdId}&new=1`)
  }

  return (
    <>
      <PageHeader
        title={t('households')}
        subtitle={t('householdsSubtitle')}
        actions={(
          <button className="button button--primary" onClick={openCreate}>
            <Plus size={17} />
            {t('newHousehold')}
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
              placeholder={`${t('reference')}, ${t('householdHead')}, ${t('phone')}…`}
            />
          </label>
          <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
            <option value="">{t('all')} · {t('campaigns')}</option>
            {campaigns.data?.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>

        {households.loading ? <Loader /> : (
          <DataTable<HouseholdDto>
            rows={filtered}
            keyOf={(row) => row.id}
            columns={[
              {
                key: 'ref',
                title: t('reference'),
                render: (row) => <strong>{row.referenceCode}</strong>,
              },
              {
                key: 'head',
                title: t('householdHead'),
                render: (row) => (
                  <div>
                    <strong>{row.headFullName || '—'}</strong>
                    <small className="cell-subtitle">{row.phoneNumber || t('phoneMissing')}</small>
                  </div>
                ),
              },
              { key: 'type', title: t('type'), render: (row) => row.householdType },
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
                    <button className="icon-button" title={t('addCitizen')} onClick={() => addCitizen(row.id)}><UserPlus size={16} /></button>
                    {['Draft', 'Rejected'].includes(row.recordStatus) && (
                      <button className="icon-button" title={t('edit')} onClick={() => setFormItem(row)}><Pencil size={16} /></button>
                    )}
                    {['Draft', 'Rejected'].includes(row.recordStatus) && (
                      <button className="icon-button icon-button--danger" title={t('delete')} onClick={() => void remove(row)}><Trash2 size={16} /></button>
                    )}
                    {row.recordStatus === 'Draft' && (
                      <button className="link-button" onClick={() => void householdsApi.submit(row.id).then(households.reload)}>{t('submit')}</button>
                    )}
                    {row.recordStatus === 'Submitted' && (
                      <button className="link-button" onClick={() => void householdsApi.validate(row.id).then(households.reload)}>{t('validate')}</button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        title={formItem ? t('editHousehold') : t('newHousehold')}
        open={formItem !== undefined}
        onClose={() => setFormItem(undefined)}
      >
        <form className="form-grid" onSubmit={submit}>
          {!formItem && (
            <>
              <div className="form-section-title">1. {t('selectDwelling')}</div>
              <div className="span-2">
                <SearchableSelect
                  label={t('dwelling')}
                  value={dwellingId}
                  onChange={setDwellingId}
                  required
                  placeholder={t('typeToSearchDwelling')}
                  options={(dwellings.data ?? [])
                    .filter((dwelling) => !campaignId || dwelling.campaignId === campaignId)
                    .map((dwelling) => ({
                      value: dwelling.id,
                      label: `${dwelling.referenceCode} — ${dwelling.localityName || t('locality')}`,
                      description: `${dwelling.latitude.toFixed(5)}, ${dwelling.longitude.toFixed(5)}`,
                    }))}
                />
              </div>
              <div className="form-section-title">2. {t('householdInfo')}</div>
              <label>
                {t('reference')}
                <div className="reference-preview">{reference}</div>
              </label>
            </>
          )}

          <label>
            {t('type')}
            <select name="householdType" defaultValue={formItem?.householdType ?? 'Ordinary'} required>
              <option value="Ordinary">{t('ordinary')}</option>
              <option value="Collective">{t('collective')}</option>
              <option value="Homeless">{t('homeless')}</option>
            </select>
          </label>
          <label className="span-2">
            {t('householdHead')}
            <input name="headFullName" defaultValue={formItem?.headFullName ?? ''} required />
          </label>
          <label className="span-2">
            {t('phone')}
            <input name="phoneNumber" type="tel" defaultValue={formItem?.phoneNumber ?? ''} placeholder="+261…" />
          </label>

          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2">
            <button type="button" className="button" onClick={() => setFormItem(undefined)}>{t('cancel')}</button>
            <button className="button button--primary">{formItem ? t('save') : t('create')}</button>
          </div>
        </form>
      </Modal>

      <Modal title={t('householdCreated')} open={Boolean(created)} onClose={() => setCreated(null)}>
        {created && (
          <div className="follow-up-card">
            <div className="follow-up-card__icon"><UsersRound size={28} /></div>
            <div>
              <h3>{created.referenceCode}</h3>
              <p>{t('addCitizenNowQuestion')}</p>
            </div>
            <div className="form-actions">
              <button className="button" onClick={() => setCreated(null)}>{t('later')}</button>
              <button className="button button--primary" onClick={() => addCitizen(created.id)}>
                <UserPlus size={17} />
                {t('addCitizenNow')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal title={t('details')} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && (
          <dl className="detail-list">
            <div><dt>{t('reference')}</dt><dd>{detail.referenceCode}</dd></div>
            <div><dt>{t('householdHead')}</dt><dd>{detail.headFullName || '—'}</dd></div>
            <div><dt>{t('phone')}</dt><dd>{detail.phoneNumber || '—'}</dd></div>
            <div><dt>{t('type')}</dt><dd>{detail.householdType}</dd></div>
            <div><dt>{t('status')}</dt><dd><StatusBadge value={detail.recordStatus} /></dd></div>
          </dl>
        )}
      </Modal>
    </>
  )
}
