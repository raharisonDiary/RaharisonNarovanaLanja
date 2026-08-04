import { Home, Map, Plus, UserRound, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
export default function MobileBottomNav() { const { t } = useI18n(); return <nav className="mobile-bottom-nav" aria-label="Navigation mobile"><NavLink to="/dashboard"><Home size={20} /><span>{t('home')}</span></NavLink><NavLink to="/households"><UsersRound size={20} /><span>{t('households')}</span></NavLink><NavLink className="mobile-bottom-nav__create" to="/dwellings"><Plus size={23} /><span>{t('collection')}</span></NavLink><NavLink to="/map"><Map size={20} /><span>{t('map')}</span></NavLink><NavLink to="/profile"><UserRound size={20} /><span>{t('profile')}</span></NavLink></nav> }
