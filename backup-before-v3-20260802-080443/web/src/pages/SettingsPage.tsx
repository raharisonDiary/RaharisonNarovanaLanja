import { LogOut, MonitorCog, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../auth/useAuth'
import { roleLabels } from '../utils/roles'

export default function SettingsPage() {
  const { user, logoutAll } = useAuth()
  return <><PageHeader title="Paramètres" subtitle="Compte et préférences de sécurité"/><section className="settings-grid"><article className="card settings-card"><span><MonitorCog size={25}/></span><div><h2>Profil</h2><p>{user?.fullName}</p><small>{user?.email} · {user ? roleLabels[user.role] : ''}</small></div></article><article className="card settings-card"><span><ShieldCheck size={25}/></span><div><h2>Sécurité</h2><p>Les access tokens expirent automatiquement et les sessions peuvent être révoquées.</p><button className="button button--danger" onClick={() => void logoutAll()}><LogOut size={17}/>Déconnecter tous les appareils</button></div></article></section></>
}
