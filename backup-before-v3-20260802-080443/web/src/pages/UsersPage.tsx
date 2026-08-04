import { Plus, Power, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { territoriesApi, usersApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import type { UserDto, UserRole } from '../types/api'
import { formatDateTime } from '../utils/format'
import { roleLabels } from '../utils/roles'

const roles: UserRole[] = ['SystemAdministrator', 'NationalCoordinator', 'RegionalSupervisor', 'Enumerator', 'Analyst']

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const users = useAsync(() => usersApi.list(), [])
  const territories = useAsync(() => territoriesApi.list(), [])
  const filtered = useMemo(() => (users.data ?? []).filter((item) => `${item.fullName} ${item.email}`.toLowerCase().includes(search.toLowerCase())), [search, users.data])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const data = new FormData(event.currentTarget)
    try {
      await usersApi.create(Object.fromEntries(data.entries()))
      setOpen(false); await users.reload()
    } catch (exception) { setError(getErrorMessage(exception)) }
  }

  return <>
    <PageHeader title="Utilisateurs" subtitle="Gestion des comptes et des rôles" actions={<button className="button button--primary" onClick={() => setOpen(true)}><Plus size={17}/>Nouvel utilisateur</button>} />
    <section className="card"><div className="toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un utilisateur…"/></label></div>{users.loading ? <Loader/> : <DataTable<UserDto> rows={filtered} keyOf={(row) => row.id} columns={[
      { key: 'name', title: 'Utilisateur', render: (row) => <div className="primary-cell"><span className="avatar">{row.firstName[0]}{row.lastName[0]}</span><div><strong>{row.fullName}</strong><small>{row.email}</small></div></div> },
      { key: 'role', title: 'Rôle', render: (row) => roleLabels[row.role] },
      { key: 'status', title: 'Statut', render: (row) => <StatusBadge value={row.isActive ? 'Actif' : 'Inactif'} /> },
      { key: 'login', title: 'Dernière connexion', render: (row) => formatDateTime(row.lastLoginAtUtc) },
      { key: 'actions', title: 'Actions', render: (row) => <button className="icon-button" title={row.isActive ? 'Désactiver' : 'Activer'} onClick={() => void usersApi.setStatus(row.id, !row.isActive).then(users.reload)}><Power size={17}/></button> },
    ]}/>}</section>
    <Modal title="Nouvel utilisateur" open={open} onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label>Prénom<input name="firstName" required/></label><label>Nom<input name="lastName" required/></label><label className="span-2">Email<input name="email" type="email" required/></label><label>Téléphone<input name="phoneNumber"/></label><label>Rôle<select name="role" required>{roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label><label className="span-2">Zone administrative<select name="administrativeAreaId"><option value="">Aucune</option>{territories.data?.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label className="span-2">Mot de passe temporaire<input name="password" type="password" minLength={12} required/></label>{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>Annuler</button><button className="button button--primary">Créer</button></div></form></Modal>
  </>
}
