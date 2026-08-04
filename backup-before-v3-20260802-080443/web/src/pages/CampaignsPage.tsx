import { Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { campaignsApi, territoriesApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import type { CampaignDto, CampaignStatus } from '../types/api'
import { formatDate } from '../utils/format'

const statuses: CampaignStatus[] = ['Draft', 'Scheduled', 'Active', 'Suspended', 'Closed', 'Archived']

export default function CampaignsPage() {
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const territories = useAsync(() => territoriesApi.list(), [])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const filtered = useMemo(() => (campaigns.data ?? []).filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase())), [campaigns.data, search])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    try { await campaignsApi.create(data); setOpen(false); await campaigns.reload() } catch (exception) { setError(getErrorMessage(exception)) }
  }
  return <>
    <PageHeader title="Campagnes" subtitle="Planification et suivi des opérations de recensement" actions={<button className="button button--primary" onClick={() => setOpen(true)}><Plus size={17}/>Nouvelle campagne</button>}/>
    <section className="card"><div className="toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une campagne…"/></label></div>{campaigns.loading ? <Loader/> : <DataTable<CampaignDto> rows={filtered} keyOf={(row) => row.id} columns={[
      { key: 'code', title: 'Code', render: (row) => <strong>{row.code}</strong> }, { key: 'name', title: 'Campagne', render: (row) => <div><strong>{row.name}</strong><small className="cell-subtitle">{row.description}</small></div> }, { key: 'dates', title: 'Période', render: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}` }, { key: 'status', title: 'Statut', render: (row) => <StatusBadge value={row.status}/> }, { key: 'action', title: 'Changer le statut', render: (row) => <select className="select select--small" value={row.status} onChange={(event) => void campaignsApi.changeStatus(row.id, event.target.value).then(campaigns.reload)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select> },
    ]}/>}</section>
    <Modal title="Nouvelle campagne" open={open} onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label>Code<input name="code" required/></label><label>Nom<input name="name" required/></label><label>Date de début<input name="startDate" type="date" required/></label><label>Date de fin<input name="endDate" type="date" required/></label><label className="span-2">Zone couverte<select name="scopeAdministrativeAreaId" required><option value="">Sélectionner</option>{territories.data?.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label className="span-2">Description<textarea name="description" rows={4}/></label>{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>Annuler</button><button className="button button--primary">Créer</button></div></form></Modal>
  </>
}
