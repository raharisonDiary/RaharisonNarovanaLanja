import { Eye, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { dwellingsApi, householdsApi } from '../api/resources'
import { getErrorMessage } from '../api/http'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import type { HouseholdDto } from '../types/api'
import { formatDate } from '../utils/format'

export default function HouseholdsPage() {
  const households = useAsync(() => householdsApi.list(), []); const dwellings = useAsync(() => dwellingsApi.list(), [])
  const [search, setSearch] = useState(''); const [open, setOpen] = useState(false); const [error, setError] = useState('')
  const filtered = useMemo(() => (households.data ?? []).filter((item) => `${item.referenceCode} ${item.headFullName ?? ''}`.toLowerCase().includes(search.toLowerCase())), [households.data, search])
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); try { await householdsApi.create(payload); setOpen(false); await households.reload() } catch (exception) { setError(getErrorMessage(exception)) } }
  return <><PageHeader title="Ménages" subtitle="Liste des ménages enregistrés" actions={<button className="button button--primary" onClick={() => setOpen(true)}><Plus size={17}/>Nouveau ménage</button>}/><section className="card"><div className="toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un ménage…"/></label></div>{households.loading ? <Loader/> : <DataTable<HouseholdDto> rows={filtered} keyOf={(row) => row.id} columns={[{ key: 'ref', title: 'Code ménage', render: (row) => <strong>{row.referenceCode}</strong> }, { key: 'head', title: 'Chef de ménage', render: (row) => row.headFullName || '—' }, { key: 'type', title: 'Type', render: (row) => row.householdType }, { key: 'phone', title: 'Téléphone', render: (row) => row.phoneNumber || '—' }, { key: 'status', title: 'Statut', render: (row) => <StatusBadge value={row.recordStatus}/> }, { key: 'date', title: 'Créé le', render: (row) => formatDate(row.createdAtUtc) }, { key: 'actions', title: 'Actions', render: (row) => <div className="inline-actions"><button className="icon-button"><Eye size={16}/></button>{row.recordStatus === 'Draft' && <button className="link-button" onClick={() => void householdsApi.submit(row.id).then(households.reload)}>Soumettre</button>}{row.recordStatus === 'Submitted' && <button className="link-button" onClick={() => void householdsApi.validate(row.id).then(households.reload)}>Valider</button>}</div> }]}/>}</section><Modal title="Nouveau ménage" open={open} onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2">Habitation<select name="dwellingId" required><option value="">Sélectionner</option>{dwellings.data?.map((item) => <option key={item.id} value={item.id}>{item.referenceCode} — {item.localityName}</option>)}</select></label><label>Référence<input name="referenceCode" required/></label><label>Type<select name="householdType"><option>Ordinary</option><option>Collective</option><option>Homeless</option></select></label><label>Chef de ménage<input name="headFullName"/></label><label>Téléphone<input name="phoneNumber"/></label>{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>Annuler</button><button className="button button--primary">Créer</button></div></form></Modal></>
}
