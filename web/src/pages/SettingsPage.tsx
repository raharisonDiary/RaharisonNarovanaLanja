import { LogOut, MonitorCog, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n/useI18n'
import { getRoleLabel } from '../utils/roles'

export default function SettingsPage() {
  const { user, logoutAll } = useAuth()
  const { t, language } = useI18n()
  return <>
    <PageHeader title={t('settings')} subtitle={t('accountPreferences')} />
    <section className="settings-grid">
      <article className="card settings-card"><span><MonitorCog size={25} /></span><div><h2>{t('profile')}</h2><p>{user?.fullName}</p><small>{user?.email} · {user ? getRoleLabel(user.role, language) : ''}</small></div></article>
      <article className="card settings-card"><span><ShieldCheck size={25} /></span><div><h2>{t('security')}</h2><p>{t('securityText')}</p><button className="button button--danger" onClick={() => void logoutAll()}><LogOut size={17} />{t('logoutAllDevices')}</button></div></article>
    </section>
  </>
}
