import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { campaignsApi, householdsApi, personsApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { PersonDto } from '../types/api'
import { formatDate } from '../utils/format'

export default function PersonsPage() {
  const { t } = useI18n()
  const persons = useAsync(() => personsApi.list(), [])
  const households = useAsync(() => householdsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [formItem, setFormItem] = useState<PersonDto | null | undefined>(undefined)
  const [error, setError] = useState('')

  const filtered = useMemo(() => (persons.data ?? []).filter((item) => {
    const matchesCampaign = !campaignId || item.campaignId === campaignId
    const matchesSearch = `${item.fullName} ${item.nationalId ?? ''} ${item.occupation ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
    return matchesCampaign && matchesSearch
  }), [campaignId, persons.data, search])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())
    const payload = {
      ...raw,
      personNumber: Number(raw.personNumber || formItem?.personNumber),
      ageYears: raw.ageYears ? Number(raw.ageYears) : null,
      dateOfBirth: raw.dateOfBirth || null,
      nationality: raw.nationality || null,
      occupation: raw.occupation || null,
      phoneNumber: raw.phoneNumber || null,
      nationalId: raw.nationalId || null,
      notes: formItem?.notes ?? null,
    }
    try {
      if (formItem) await personsApi.update(formItem.id, payload)
      else await personsApi.create(payload)
      setFormItem(undefined)
      await persons.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  const remove = async (item: PersonDto) => {
    if (!window.confirm(t('confirmDelete'))) return
    await personsApi.remove(item.id)
    await persons.reload()
  }

  return (
    <>
      <PageHeader title={t('citizens')} subtitle={t('citizensSubtitle')} actions={<button className="button button--primary" onClick={() => setFormItem(null)}><Plus size={17} />{t('addCitizen')}</button>} />
      <section className="card">
        <div className="toolbar toolbar--wrap">
          <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`${t('fullName')}, ${t('nationalId')}, ${t('occupation')}…`} /></label>
          <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">{t('all')} · {t('campaigns')}</option>{campaigns.data?.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select>
        </div>
        {persons.loading ? <Loader /> : <DataTable<PersonDto> rows={filtered} keyOf={(row) => row.id} columns={[
          { key: 'person', title: t('citizens'), render: (row) => <div><strong>{row.fullName}</strong><small className="cell-subtitle">N° {row.personNumber}</small></div> },
          { key: 'sex', title: t('sex'), render: (row) => row.sex },
          { key: 'birth', title: t('birthDate'), render: (row) => row.dateOfBirth ? formatDate(row.dateOfBirth) : `${row.ageYears ?? '—'} ${t('age')}` },
          { key: 'occupation', title: t('occupation'), render: (row) => row.occupation || '—' },
          { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.recordStatus} /> },
          { key: 'actions', title: t('actions'), render: (row) => <div className="inline-actions">
            <Link className="icon-button" to={`/persons/${row.id}`} title={t('details')}><Eye size={16} /></Link>
            {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button" onClick={() => setFormItem(row)}><Pencil size={16} /></button>}
            {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button icon-button--danger" onClick={() => void remove(row)}><Trash2 size={16} /></button>}
            {row.recordStatus === 'Draft' && <button className="link-button" onClick={() => void personsApi.submit(row.id).then(persons.reload)}>{t('submit')}</button>}
            {row.recordStatus === 'Submitted' && <button className="link-button" onClick={() => void personsApi.validate(row.id).then(persons.reload)}>{t('validate')}</button>}
          </div> },
        ]} />}
      </section>

      <Modal title={formItem ? t('editCitizen') : t('addCitizen')} open={formItem !== undefined} onClose={() => setFormItem(undefined)}>
        <form className="form-grid" onSubmit={submit}>
          {!formItem && <><label className="span-2">{t('household')}<select name="householdId" required><option value="">— {t('select')} —</option>{households.data?.filter((item) => !campaignId || item.campaignId === campaignId).map((item) => <option key={item.id} value={item.id}>{item.referenceCode} — {item.headFullName}</option>)}</select></label><label>{t('citizenNumber')}<input name="personNumber" type="number" min="1" required /></label></>}
          <label>{t('sex')}<select name="sex" defaultValue={formItem?.sex ?? 'NotStated'}><option value="Female">{t('female')}</option><option value="Male">{t('male')}</option><option value="Other">{t('other')}</option><option value="NotStated">{t('notStated')}</option></select></label>
          <label>{t('firstName')}<input name="firstName" defaultValue={formItem?.firstName ?? ''} required /></label>
          <label>{t('lastName')}<input name="lastName" defaultValue={formItem?.lastName ?? ''} required /></label>
          <label>{t('birthDate')}<input name="dateOfBirth" type="date" defaultValue={formItem?.dateOfBirth ?? ''} /></label>
          <label>{t('age')}<input name="ageYears" type="number" min="0" max="130" defaultValue={formItem?.ageYears ?? ''} /></label>
          <label>{t('relationship')}<select name="relationshipToHead" defaultValue={formItem?.relationshipToHead ?? 'NonRelative'}><option>Head</option><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>OtherRelative</option><option>NonRelative</option></select></label>
          <label>{t('maritalStatus')}<select name="maritalStatus" defaultValue={formItem?.maritalStatus ?? 'NotStated'}><option>Single</option><option>Married</option><option>Cohabiting</option><option>Divorced</option><option>Widowed</option><option>Separated</option><option>NotStated</option></select></label>
          <label>{t('nationality')}<input name="nationality" defaultValue={formItem?.nationality ?? 'Malagasy'} /></label>
          <label>{t('occupation')}<input name="occupation" defaultValue={formItem?.occupation ?? ''} /></label>
          <label>{t('phone')}<input name="phoneNumber" defaultValue={formItem?.phoneNumber ?? ''} /></label>
          <label>{t('nationalId')}<input name="nationalId" defaultValue={formItem?.nationalId ?? ''} /></label>
          {error && <div className="form-error span-2">{error}</div>}
          <div className="form-actions span-2"><button type="button" className="button" onClick={() => setFormItem(undefined)}>{t('cancel')}</button><button className="button button--primary">{formItem ? t('save') : t('create')}</button></div>
        </form>
      </Modal>
    </>
  )
}
