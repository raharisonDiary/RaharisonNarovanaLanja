import { Home, Map, Plus, UserRound, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function MobileBottomNav() {
  return <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
    <NavLink to="/dashboard"><Home size={20} /><span>Accueil</span></NavLink>
    <NavLink to="/households"><UsersRound size={20} /><span>Ménages</span></NavLink>
    <NavLink className="mobile-bottom-nav__create" to="/dwellings"><Plus size={23} /><span>Collecter</span></NavLink>
    <NavLink to="/map"><Map size={20} /><span>Carte</span></NavLink>
    <NavLink to="/settings"><UserRound size={20} /><span>Profil</span></NavLink>
  </nav>
}
