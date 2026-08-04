import { Check, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { campaignsApi, householdsApi, personsApi } from '../api/resources'
import CitizenPhotoCapture from '../components/common/CitizenPhotoCapture'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import SearchableSelect from '../components/common/SearchableSelect'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type {
  BirthDatePrecision,
  MaritalStatus,
  PersonDto,
  PersonSex,
  RelationshipToHead,
} from '../types/api'

interface CitizenForm {
  householdId: string
  photoDataUrl: string
  firstName: string
  lastName: string
  sex: PersonSex
  birthMode: 'exact' | 'year' | 'age' | 'unknown'
  dateOfBirth: string
  birthYear: string
  declaredAge: string
  unknownAdult: boolean
  birthPlace: string
  relationshipToHead: RelationshipToHead
  hasNationalId: boolean
  nationalId: string
  nationalIdIssueDate: string
  nationalIdIssuePlace: string
  maritalStatus: MaritalStatus
  childrenCount: string
  occupation: string
  phoneNumber: string
  nationality: string
}

const emptyForm = (householdId = ''): CitizenForm => ({
  householdId,
  photoDataUrl: '',
  firstName: '',
  lastName: '',
  sex: 'Female',
  birthMode: 'exact',
  dateOfBirth: '',
  birthYear: '',
  declaredAge: '',
  unknownAdult: false,
  birthPlace: '',
  relationshipToHead: 'Head',
  hasNationalId: true,
  nationalId: '',
  nationalIdIssueDate: '',
  nationalIdIssuePlace: '',
  maritalStatus: 'Single',
  childrenCount: '',
  occupation: '',
  phoneNumber: '',
  nationality: 'Malagasy',
})

const ageFromDate = (date: string) => {
  const birth = new Date(`${date}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const anniversary = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (now < anniversary) age -= 1
  return age
}


export default function PersonsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const persons = useAsync(() => personsApi.list(), [])
  const households = useAsync(() => householdsApi.list(), [])
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [search, setSearch] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [householdFilter, setHouseholdFilter] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editing, setEditing] = useState<PersonDto | null>(null)
  const [detail, setDetail] = useState<PersonDto | null>(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CitizenForm>(() => emptyForm())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredHouseholds = (households.data ?? []).filter(
    (item) => !campaignId || item.campaignId === campaignId,
  )

  const computedAge = useMemo(() => {
    if (form.birthMode === 'exact') return form.dateOfBirth ? ageFromDate(form.dateOfBirth) : null
    if (form.birthMode === 'year') {
      const year = Number(form.birthYear)
      return year > 1800 ? new Date().getFullYear() - year : null
    }
    if (form.birthMode === 'age') {
      const age = Number(form.declaredAge)
      return Number.isFinite(age) && form.declaredAge !== '' ? age : null
    }
    return form.unknownAdult ? 18 : 0
  }, [form.birthMode, form.birthYear, form.dateOfBirth, form.declaredAge, form.unknownAdult])

  const adult = (computedAge ?? 0) >= 18
  const totalSteps = 6

  const filtered = useMemo(
    () => (persons.data ?? []).filter((person) => {
      const byCampaign = !campaignId || person.campaignId === campaignId
      const byHousehold = !householdFilter || person.householdId === householdFilter
      const text = `${person.fullName} ${person.nationalId ?? ''} ${person.occupation ?? ''}`
        .toLocaleLowerCase()
      return byCampaign && byHousehold && text.includes(search.toLocaleLowerCase())
    }),
    [campaignId, householdFilter, persons.data, search],
  )

  const openCreate = (householdId = '') => {
    setEditing(null)
    setForm(emptyForm(householdId))
    setStep(0)
    setError('')
    setWizardOpen(true)
  }

  useEffect(() => {
    const requestedHousehold = params.get('householdId') ?? ''
    if (params.get('new') === '1' && requestedHousehold && households.data) {
      openCreate(requestedHousehold)
      setParams({}, { replace: true })
    }
  }, [households.data, params, setParams])

  const openEdit = (person: PersonDto) => {
    const precisionToMode: Record<BirthDatePrecision, CitizenForm['birthMode']> = {
      Exact: 'exact',
      YearOnly: 'year',
      DeclaredAge: 'age',
      Unknown: 'unknown',
    }
    setEditing(person)
    setForm({
      householdId: person.householdId,
      photoDataUrl: person.photoDataUrl ?? '',
      firstName: person.firstName,
      lastName: person.lastName,
      sex: person.sex,
      birthMode: precisionToMode[person.birthDatePrecision] ?? 'exact',
      dateOfBirth: person.dateOfBirth ?? '',
      birthYear: person.birthDatePrecision === 'YearOnly' && person.dateOfBirth
        ? person.dateOfBirth.slice(0, 4)
        : '',
      declaredAge: person.ageYears?.toString() ?? '',
      unknownAdult: (person.ageYears ?? 0) >= 18,
      birthPlace: person.birthPlace ?? '',
      relationshipToHead: person.relationshipToHead,
      hasNationalId: Boolean(person.nationalId),
      nationalId: person.nationalId ?? '',
      nationalIdIssueDate: person.nationalIdIssueDate ?? '',
      nationalIdIssuePlace: person.nationalIdIssuePlace ?? '',
      maritalStatus: person.maritalStatus,
      childrenCount: person.childrenCount?.toString() ?? '',
      occupation: person.occupation ?? '',
      phoneNumber: person.phoneNumber ?? '',
      nationality: person.nationality ?? 'Malagasy',
    })
    setStep(0)
    setError('')
    setWizardOpen(true)
  }

  const setValue = <K extends keyof CitizenForm>(key: K, value: CitizenForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const canContinue = () => {
    if (step === 0) return Boolean(form.householdId && form.photoDataUrl)
    if (step === 1) return Boolean(form.lastName.trim() && form.firstName.trim() && form.birthPlace.trim())
    if (step === 2) return computedAge !== null && computedAge >= 0 && computedAge <= 130
    if (step === 3) return !adult || !form.hasNationalId || Boolean(form.nationalId.trim())
    if (step === 4) {
      if (['Married', 'Widowed'].includes(form.maritalStatus)) return form.childrenCount !== ''
      return true
    }
    return Boolean(form.occupation.trim())
  }

  const toPayload = () => {
    const precision: Record<CitizenForm['birthMode'], BirthDatePrecision> = {
      exact: 'Exact',
      year: 'YearOnly',
      age: 'DeclaredAge',
      unknown: 'Unknown',
    }
    const dateOfBirth = form.birthMode === 'exact'
      ? form.dateOfBirth || null
      : form.birthMode === 'year' && form.birthYear
        ? `${form.birthYear}-01-01`
        : null
    const householdPersons = (persons.data ?? []).filter((item) => item.householdId === form.householdId)
    const personNumber = editing?.personNumber ?? Math.max(0, ...householdPersons.map((item) => item.personNumber)) + 1

    return {
      householdId: form.householdId,
      personNumber,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      sex: form.sex,
      dateOfBirth,
      ageYears: computedAge,
      birthDatePrecision: precision[form.birthMode],
      birthPlace: form.birthPlace.trim(),
      relationshipToHead: form.relationshipToHead,
      maritalStatus: form.maritalStatus,
      childrenCount: ['Married', 'Widowed'].includes(form.maritalStatus)
        ? Number(form.childrenCount || 0)
        : null,
      nationality: form.nationality.trim() || null,
      occupation: form.occupation.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      nationalId: adult && form.hasNationalId ? form.nationalId.trim() || null : null,
      nationalIdIssueDate: adult && form.hasNationalId ? form.nationalIdIssueDate || null : null,
      nationalIdIssuePlace: adult && form.hasNationalId ? form.nationalIdIssuePlace.trim() || null : null,
      photoDataUrl: form.photoDataUrl || null,
      notes: null,
    }
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = toPayload()
      if (editing) await personsApi.update(editing.id, payload)
      else await personsApi.create(payload)
      await persons.reload()

      if (!editing && window.confirm(t('addAnotherCitizenQuestion'))) {
        setForm(emptyForm(form.householdId))
        setStep(0)
      } else {
        setWizardOpen(false)
      }
    } catch (exception) {
      setError(getErrorMessage(exception))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (person: PersonDto) => {
    if (!window.confirm(t('confirmDelete'))) return
    await personsApi.remove(person.id)
    await persons.reload()
  }

  if (persons.loading || households.loading || campaigns.loading) return <Loader />

  return (
    <>
      <PageHeader
        title={t('citizens')}
        subtitle={t('citizensSubtitle')}
        actions={(
          <button className="button button--primary" onClick={() => openCreate()}>
            <Plus size={17} />
            {t('addCitizen')}
          </button>
        )}
      />

      <section className="card">
        <div className="toolbar toolbar--wrap">
          <label className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`${t('fullName')}, ${t('nationalId')}, ${t('occupation')}…`} />
          </label>
          <select value={campaignId} onChange={(event) => { setCampaignId(event.target.value); setHouseholdFilter('') }}>
            <option value="">{t('all')} · {t('campaigns')}</option>
            {campaigns.data?.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
          </select>
          <select value={householdFilter} onChange={(event) => setHouseholdFilter(event.target.value)}>
            <option value="">{t('all')} · {t('households')}</option>
            {filteredHouseholds.map((household) => <option key={household.id} value={household.id}>{household.referenceCode} — {household.headFullName}</option>)}
          </select>
        </div>

        <DataTable<PersonDto>
          rows={filtered}
          keyOf={(row) => row.id}
          columns={[
            {
              key: 'citizen',
              title: t('citizens'),
              render: (row) => (
                <div className="person-cell">
                  {row.photoDataUrl
                    ? <img className="person-avatar" src={row.photoDataUrl} alt="" />
                    : <span className="person-avatar" />}
                  <div><strong>{row.fullName}</strong><small className="cell-subtitle">#{row.personNumber} · {row.occupation || t('occupationMissing')}</small></div>
                </div>
              ),
            },
            { key: 'sex', title: t('sex'), render: (row) => row.sex },
            { key: 'age', title: t('age'), render: (row) => row.ageYears ?? '—' },
            { key: 'cin', title: t('nationalId'), render: (row) => row.nationalId || '—' },
            { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.recordStatus} /> },
            {
              key: 'actions',
              title: t('actions'),
              render: (row) => (
                <div className="inline-actions">
                  <button className="icon-button" title={t('details')} onClick={() => setDetail(row)}><Eye size={16} /></button>
                  {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button" title={t('edit')} onClick={() => openEdit(row)}><Pencil size={16} /></button>}
                  {['Draft', 'Rejected'].includes(row.recordStatus) && <button className="icon-button icon-button--danger" title={t('delete')} onClick={() => void remove(row)}><Trash2 size={16} /></button>}
                  {row.recordStatus === 'Draft' && <button className="link-button" onClick={() => void personsApi.submit(row.id).then(persons.reload)}>{t('submit')}</button>}
                  {row.recordStatus === 'Submitted' && <button className="link-button" onClick={() => void personsApi.validate(row.id).then(persons.reload)}>{t('validate')}</button>}
                </div>
              ),
            },
          ]}
        />
      </section>

      <Modal title={editing ? t('editCitizen') : t('addCitizen')} open={wizardOpen} onClose={() => setWizardOpen(false)}>
        <div className="wizard-progress">
          {Array.from({ length: totalSteps }, (_, index) => <span key={index} className={index <= step ? 'is-active' : ''} />)}
        </div>

        <div className="wizard-panel">
          {step === 0 && (
            <>
              <h3>1. {t('citizenPhoto')}</h3>
              <SearchableSelect
                label={t('household')}
                value={form.householdId}
                onChange={(value) => setValue('householdId', value)}
                required
                disabled={Boolean(editing)}
                placeholder={t('typeToSearchHousehold')}
                options={(households.data ?? []).map((household) => ({
                  value: household.id,
                  label: `${household.referenceCode} — ${household.headFullName || t('householdHead')}`,
                  description: campaigns.data?.find((campaign) => campaign.id === household.campaignId)?.name,
                }))}
              />
              <CitizenPhotoCapture
                value={form.photoDataUrl}
                onChange={(value) => setValue('photoDataUrl', value)}
                onError={setError}
                labels={{
                  empty: t('citizenPhoto'),
                  take: t('takePhotoNow'),
                  import: t('importPhoto'),
                  retake: t('retakePhoto'),
                  remove: t('removePhoto'),
                  cancel: t('cancel'),
                  capture: t('capturePhoto'),
                  help: t('photoQualityHint'),
                  cameraUnavailable: t('cameraUnavailable'),
                  cameraStarting: t('cameraStarting'),
                }}
              />
            </>
          )}

          {step === 1 && (
            <>
              <h3>2. {t('citizenIdentity')}</h3>
              <div className="form-grid">
                <label>{t('lastName')}<input value={form.lastName} onChange={(event) => setValue('lastName', event.target.value)} /></label>
                <label>{t('firstNames')}<input value={form.firstName} onChange={(event) => setValue('firstName', event.target.value)} /></label>
                <label>{t('sex')}<select value={form.sex} onChange={(event) => setValue('sex', event.target.value as PersonSex)}><option value="Female">{t('female')}</option><option value="Male">{t('male')}</option><option value="NotStated">{t('notStated')}</option></select></label>
                <label>{t('birthPlace')}<input value={form.birthPlace} onChange={(event) => setValue('birthPlace', event.target.value)} /></label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3>3. {t('citizenBirthAge')}</h3>
              <div className="wizard-choice-grid">
                {([
                  ['exact', t('exactDate')],
                  ['year', t('yearOnly')],
                  ['age', t('declaredAge')],
                  ['unknown', t('unknown')],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" className={`wizard-choice ${form.birthMode === value ? 'is-active' : ''}`} onClick={() => setValue('birthMode', value)}>{label}</button>
                ))}
              </div>
              {form.birthMode === 'exact' && <label>{t('birthDate')}<input type="date" value={form.dateOfBirth} onChange={(event) => setValue('dateOfBirth', event.target.value)} /></label>}
              {form.birthMode === 'year' && <label>{t('birthYear')}<input type="number" min="1890" max={new Date().getFullYear()} value={form.birthYear} onChange={(event) => setValue('birthYear', event.target.value)} /></label>}
              {form.birthMode === 'age' && <label>{t('declaredAge')}<input type="number" min="0" max="130" value={form.declaredAge} onChange={(event) => setValue('declaredAge', event.target.value)} /></label>}
              {form.birthMode === 'unknown' && (
                <div className="wizard-choice-grid">
                  <button type="button" className={`wizard-choice ${!form.unknownAdult ? 'is-active' : ''}`} onClick={() => setValue('unknownAdult', false)}>{t('under18')}</button>
                  <button type="button" className={`wizard-choice ${form.unknownAdult ? 'is-active' : ''}`} onClick={() => setValue('unknownAdult', true)}>{t('adult18')}</button>
                </div>
              )}
              <div className="reference-preview">{t('automaticFilter')} : {adult ? t('adultLabel') : t('minorLabel')} · {computedAge ?? '—'} {t('years')}</div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>4. {t('nationalIdCard')}</h3>
              {!adult ? <p>{t('cinMinorText')}</p> : (
                <>
                  <div className="wizard-choice-grid">
                    <button type="button" className={`wizard-choice ${form.hasNationalId ? 'is-active' : ''}`} onClick={() => setValue('hasNationalId', true)}>{t('hasId')}</button>
                    <button type="button" className={`wizard-choice ${!form.hasNationalId ? 'is-active' : ''}`} onClick={() => setValue('hasNationalId', false)}>{t('noId')}</button>
                  </div>
                  {form.hasNationalId && (
                    <div className="form-grid">
                      <label>{t('nationalId')}<input value={form.nationalId} onChange={(event) => setValue('nationalId', event.target.value)} /></label>
                      <label>{t('issueDate')}<input type="date" value={form.nationalIdIssueDate} onChange={(event) => setValue('nationalIdIssueDate', event.target.value)} /></label>
                      <label className="span-2">{t('issuePlace')}<input value={form.nationalIdIssuePlace} onChange={(event) => setValue('nationalIdIssuePlace', event.target.value)} /></label>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <h3>5. {t('familySituation')}</h3>
              <div className="form-grid">
                <label>{t('maritalStatus')}<select value={form.maritalStatus} onChange={(event) => setValue('maritalStatus', event.target.value as MaritalStatus)}><option value="Single">{t('single')}</option><option value="Married">{t('married')}</option><option value="Widowed">{t('widowed')}</option><option value="Divorced">{t('divorced')}</option><option value="Separated">{t('separated')}</option><option value="NotStated">{t('neutral')}</option></select></label>
                {['Married', 'Widowed'].includes(form.maritalStatus) && <label>{t('childrenCount')}<input type="number" min="0" max="50" value={form.childrenCount} onChange={(event) => setValue('childrenCount', event.target.value)} /></label>}
                <label className="span-2">{t('relationship')}<select value={form.relationshipToHead} onChange={(event) => setValue('relationshipToHead', event.target.value as RelationshipToHead)}><option value="Head">{t('head')}</option><option value="Spouse">{t('spouse')}</option><option value="Child">{t('child')}</option><option value="Parent">{t('parent')}</option><option value="Sibling">{t('sibling')}</option><option value="OtherRelative">{t('otherRelative')}</option><option value="NonRelative">{t('nonRelative')}</option></select></label>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h3>6. {t('professionAndReview')}</h3>
              <div className="form-grid">
                <label className="span-2">{t('occupation')}<input value={form.occupation} onChange={(event) => setValue('occupation', event.target.value)} placeholder={t('occupationPlaceholder')} /></label>
                <label>{t('phone')} ({t('optional')})<input type="tel" value={form.phoneNumber} onChange={(event) => setValue('phoneNumber', event.target.value)} /></label>
                <label>{t('nationality')}<input value={form.nationality} onChange={(event) => setValue('nationality', event.target.value)} /></label>
              </div>
              <div className="reference-preview">{form.firstName} {form.lastName} · {computedAge ?? '—'} {t('years')} · {form.occupation || '—'}</div>
            </>
          )}

          {error && <div className="form-error">{error}</div>}
          <div className="wizard-actions">
            <button type="button" className="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ChevronLeft size={17} />{t('previous')}</button>
            {step < totalSteps - 1
              ? <button type="button" className="button button--primary" disabled={!canContinue()} onClick={() => setStep((value) => value + 1)}>{t('continue')}<ChevronRight size={17} /></button>
              : <button type="button" className="button button--primary" disabled={!canContinue() || saving} onClick={() => void save()}><Check size={17} />{saving ? t('saving') : t('saveCitizen')}</button>}
          </div>
        </div>
      </Modal>

      <Modal title={t('citizenDetail')} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && (
          <div className="wizard-panel">
            {detail.photoDataUrl && <img className="wizard-photo" src={detail.photoDataUrl} alt="" />}
            <dl className="detail-list">
              <div><dt>{t('fullName')}</dt><dd>{detail.fullName}</dd></div>
              <div><dt>{t('birthPlace')}</dt><dd>{detail.birthPlace || '—'}</dd></div>
              <div><dt>{t('age')}</dt><dd>{detail.ageYears ?? '—'}</dd></div>
              <div><dt>{t('nationalId')}</dt><dd>{detail.nationalId || '—'}</dd></div>
              <div><dt>{t('maritalStatus')}</dt><dd>{detail.maritalStatus}</dd></div>
              <div><dt>{t('occupation')}</dt><dd>{detail.occupation || '—'}</dd></div>
            </dl>
            <button className="button" onClick={() => navigate(`/persons/${detail.id}`)}><Eye size={16} />{t('view')}</button>
          </div>
        )}
      </Modal>
    </>
  )
}
