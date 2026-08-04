import { Bell, ChevronDown, LogOut, Menu, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { roleLabels } from '../../utils/roles'

const destinations = [
  ['Tableau de bord', '/dashboard'], ['Habitations', '/dwellings'], ['Ménages', '/households'],
  ['Citoyens', '/persons'], ['Carte terrain', '/map'], ['Campagnes', '/campaigns'],
  ['Territoires', '/territories'], ['Statistiques', '/statistics'], ['Rapports', '/reports'],
] as const

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const results = useMemo(() => query.trim() ? destinations.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [], [query])

  return (
    <header className="topbar">
      <button className="icon-button topbar__menu" onClick={onMenu} aria-label="Ouvrir le menu"><Menu size={20} /></button>
      <div className="topbar__search-wrap">
        <label className="topbar__search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Aller rapidement vers…" /></label>
        {results.length > 0 && <div className="search-results">{results.map(([label, to]) => <button key={to} onClick={() => { navigate(to); setQuery('') }}><Search size={15} /><span>{label}</span></button>)}</div>}
      </div>
      <div className="topbar__right">
        <Link className="button button--primary topbar__create" to="/dwellings"><Plus size={17} /> Nouvelle collecte</Link>
        <button className="icon-button topbar__notification" aria-label="Notifications"><Bell size={19} /><span /></button>
        <div className="profile-menu">
          <button className="user-chip" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
            <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span><div><strong>{user?.fullName}</strong><small>{user ? roleLabels[user.role] : ''}</small></div><ChevronDown size={15} />
          </button>
          {profileOpen && <div className="profile-popover"><div><strong>{user?.fullName}</strong><small>{user?.email}</small></div><Link to="/settings" onClick={() => setProfileOpen(false)}>Mon profil et paramètres</Link><button onClick={() => void logout()}><LogOut size={16} /> Se déconnecter</button></div>}
        </div>
      </div>
    </header>
  )
}
