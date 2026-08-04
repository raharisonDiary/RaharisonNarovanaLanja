import { BarChart3, Building2, ClipboardList, FileBarChart, Home, Map, MapPinned, ScrollText, ShieldCheck, UserRound, Users, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useI18n } from '../../i18n/useI18n'
import { canProvisionUsers } from '../../utils/roles'
import Brand from '../common/Brand'

type Item = { to: string; label: string; icon: LucideIcon }
type Section = { label: string; items: Item[] }

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { t } = useI18n()
  const isAgent = user?.role === 'Enumerator'
  const sections: Section[] = [{ label: t('overview'), items: [{ to: '/dashboard', label: t('dashboard'), icon: Home }] }, { label: t('collection'), items: [{ to: '/dwellings', label: t('dwellings'), icon: Building2 }, { to: '/households', label: t('households'), icon: UsersRound }, { to: '/persons', label: t('citizens'), icon: UserRound }, { to: '/map', label: t('map'), icon: Map }] }]
  if (!isAgent) sections.push({ label: t('management'), items: [{ to: '/campaigns', label: t('campaigns'), icon: ClipboardList }, { to: '/territories', label: t('territories'), icon: MapPinned }, { to: '/statistics', label: t('statistics'), icon: BarChart3 }, { to: '/reports', label: t('reports'), icon: FileBarChart }] })
  const administration: Item[] = []
  if (canProvisionUsers(user?.role)) administration.push({ to: '/users', label: t('users'), icon: Users })
  if (user?.role === 'SystemAdministrator' || user?.role === 'NationalCoordinator') administration.push({ to: '/audit', label: t('audit'), icon: ScrollText })
  administration.push({ to: '/profile', label: t('profile'), icon: UserRound })
  sections.push({ label: t('administration'), items: administration })

  return <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}><Brand /><nav aria-label="Navigation principale">{sections.map((section) => <section className="sidebar__section" key={section.label}><span className="sidebar__label">{section.label}</span>{section.items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose}><Icon size={18} /><span>{label}</span></NavLink>)}</section>)}</nav><div className="sidebar__secure"><ShieldCheck size={18} /><div><strong>{t('secureSession')}</strong><small>{t('secureSessionHint')}</small></div></div></aside>
}
