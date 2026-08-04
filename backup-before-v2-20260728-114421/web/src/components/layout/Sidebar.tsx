import {
  BarChart3, Building2, ClipboardList, FileBarChart, Home, Map, MapPinned,
  ScrollText, Settings, ShieldCheck, UserRound, Users, UsersRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Brand from '../common/Brand'
import { useAuth } from '../../auth/useAuth'
import { canManage } from '../../utils/roles'

const coreItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: Home },
  { to: '/campaigns', label: 'Campagnes', icon: ClipboardList },
  { to: '/territories', label: 'Zones', icon: MapPinned },
  { to: '/map', label: 'Carte', icon: Map },
  { to: '/dwellings', label: 'Habitations', icon: Building2 },
  { to: '/households', label: 'Ménages', icon: UsersRound },
  { to: '/persons', label: 'Citoyens', icon: UserRound },
  { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
  { to: '/reports', label: 'Rapports', icon: FileBarChart },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const items = [...coreItems]
  if (canManage(user?.role)) items.splice(1, 0, { to: '/users', label: 'Utilisateurs', icon: Users })
  if (user?.role === 'SystemAdministrator' || user?.role === 'NationalCoordinator') items.push({ to: '/audit', label: 'Journal d’audit', icon: ScrollText })
  items.push({ to: '/settings', label: 'Paramètres', icon: Settings })

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <Brand />
      <nav>{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar__secure"><ShieldCheck size={18} /><span>Connexion sécurisée</span></div>
    </aside>
  )
}
