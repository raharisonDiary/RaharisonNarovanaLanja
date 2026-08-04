import { Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, AdministrativeAreaType } from '../types/api'
import { formatDate } from '../utils/format'

const types: AdministrativeAreaType[] = ['Country', 'Region', 'District', 'Commune', 'Fokontany', 'EnumerationArea']

export default function TerritoriesPage() {
  const { t } = useI18n()
  const areas = useAsync(() => territoriesApi.list({ includeInactive: true }), [])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const filtered = useMemo(() => (areas.data ?? []).filter((item) =>
    `${item.code} ${item.name} ${item.type}`.toLowerCase().includes(search.toLowerCase())), [areas.data, search])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    if (!data.parentId) delete data.parentId
    try {
      await territoriesApi.create(data)
      setOpen(false)
      await areas.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  return <>
    <PageHeader title={t('administrativeAreas')} subtitle={t('territoriesSubtitle')} actions={<button className="button button--primary" onClick={() => setOpen(true)}><Plus size={17} />{t('newArea')}</button>} />
    <section className="card">
      <div className="toolbar"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`${t('code')}, ${t('name')}…`} /></label></div>
      {areas.loading ? <Loader /> : <DataTable<AdministrativeAreaDto> rows={filtered} keyOf={(row) => row.id} columns={[
        { key: 'code', title: t('code'), render: (row) => <strong>{row.code}</strong> },
        { key: 'name', title: t('name'), render: (row) => row.name },
        { key: 'type', title: t('type'), render: (row) => row.type },
        { key: 'parent', title: t('parentArea'), render: (row) => areas.data?.find((item) => item.id === row.parentId)?.name ?? '—' },
        { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.isActive ? t('active') : t('inactive')} /> },
        { key: 'created', title: t('createdOn'), render: (row) => formatDate(row.createdAtUtc) },
      ]} />}
    </section>
    <Modal title={t('newArea')} open={open} onClose={() => setOpen(false)}>
      <form className="form-grid" onSubmit={submit}>
        <label>{t('code')}<input name="code" required /></label>
        <label>{t('name')}<input name="name" required /></label>
        <label>{t('type')}<select name="type" required>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>{t('parentArea')}<select name="parentId"><option value="">{t('none')}</option>{areas.data?.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
        {error && <div className="form-error span-2">{error}</div>}
        <div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>{t('cancel')}</button><button className="button button--primary">{t('create')}</button></div>
      </form>
    </Modal>
  </>
}
