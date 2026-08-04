import { Bell, ChevronDown, LogOut, Menu, Plus, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useI18n } from '../../i18n/useI18n'
import { getRoleLabel } from '../../utils/roles'
import PreferencesControls from '../common/PreferencesControls'

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const destinations = useMemo(() => [[t('dashboard'), '/dashboard'], [t('dwellings'), '/dwellings'], [t('households'), '/households'], [t('citizens'), '/persons'], [t('map'), '/map'], [t('campaigns'), '/campaigns'], [t('statistics'), '/statistics'], [t('profile'), '/profile']] as const, [t])
  const results = useMemo(() => query.trim() ? destinations.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [], [destinations, query])
  return <header className="topbar"><button className="icon-button topbar__menu" onClick={onMenu} aria-label={t('menu')}><Menu size={20} /></button><div className="topbar__search-wrap"><label className="topbar__search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} /></label>{results.length > 0 && <div className="search-results">{results.map(([label, to]) => <button key={to} onClick={() => { navigate(to); setQuery('') }}><Search size={15} /><span>{label}</span></button>)}</div>}</div><div className="topbar__right"><PreferencesControls compact /><Link className="button button--primary topbar__create" to="/dwellings"><Plus size={17} />{t('newCollection')}</Link><button className="icon-button topbar__notification" aria-label={t('notifications')}><Bell size={19} /><span /></button><div className="profile-menu"><button className="user-chip" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}><span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span><div><strong>{user?.fullName}</strong><small>{user ? getRoleLabel(user.role, language) : ''}</small></div><ChevronDown size={15} /></button>{profileOpen && <div className="profile-popover"><div><strong>{user?.fullName}</strong><small>{user?.email}</small></div><Link to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={16} />{t('profile')}</Link><button onClick={() => void logout()}><LogOut size={16} />{t('logout')}</button></div>}</div></div></header>
}
