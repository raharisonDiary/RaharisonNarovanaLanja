import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { roleLabels } from '../../utils/roles'

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  return (
    <header className="topbar">
      <button className="icon-button topbar__menu" onClick={onMenu} aria-label="Menu"><Menu size={20} /></button>
      <label className="topbar__search"><Search size={17} /><input placeholder="Rechercher dans la plateforme…" /></label>
      <div className="topbar__right">
        <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
        <div className="user-chip"><span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span><div><strong>{user?.fullName}</strong><small>{user ? roleLabels[user.role] : ''}</small></div></div>
        <button className="icon-button" onClick={() => void logout()} aria-label="Se déconnecter"><LogOut size={19} /></button>
      </div>
    </header>
  )
}
