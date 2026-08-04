import {
  BarChart3, Building2, ClipboardList, FileBarChart, Home, Map, MapPinned,
  ScrollText, Settings, ShieldCheck, UserRound, Users, UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Brand from '../common/Brand'
import { useAuth } from '../../auth/useAuth'
import { canManage } from '../../utils/roles'

type Item = { to: string; label: string; icon: LucideIcon }
type Section = { label: string; items: Item[] }

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const sections: Section[] = [
    { label: 'Vue d’ensemble', items: [{ to: '/dashboard', label: 'Tableau de bord', icon: Home }] },
    { label: 'Collecte', items: [
      { to: '/dwellings', label: 'Habitations', icon: Building2 },
      { to: '/households', label: 'Ménages', icon: UsersRound },
      { to: '/persons', label: 'Citoyens', icon: UserRound },
      { to: '/map', label: 'Carte terrain', icon: Map },
    ] },
    { label: 'Pilotage', items: [
      { to: '/campaigns', label: 'Campagnes', icon: ClipboardList },
      { to: '/territories', label: 'Territoires', icon: MapPinned },
      { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
      { to: '/reports', label: 'Rapports', icon: FileBarChart },
    ] },
  ]

  const administration: Item[] = []
  if (canManage(user?.role)) administration.push({ to: '/users', label: 'Utilisateurs', icon: Users })
  if (user?.role === 'SystemAdministrator' || user?.role === 'NationalCoordinator') administration.push({ to: '/audit', label: 'Journal d’audit', icon: ScrollText })
  administration.push({ to: '/settings', label: 'Paramètres', icon: Settings })
  sections.push({ label: 'Administration', items: administration })

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <Brand />
      <nav aria-label="Navigation principale">
        {sections.map((section) => <section className="sidebar__section" key={section.label}>
          <span className="sidebar__label">{section.label}</span>
          {section.items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose}><Icon size={18} /><span>{label}</span></NavLink>)}
        </section>)}
      </nav>
      <div className="sidebar__secure"><ShieldCheck size={18} /><div><strong>Session sécurisée</strong><small>Chiffrement et journalisation actifs</small></div></div>
    </aside>
  )
}
