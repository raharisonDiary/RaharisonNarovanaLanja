import { Camera, Check, Globe2, Mail, Moon, Phone, Save, ShieldCheck, Sun, UserRound } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { profileApi } from '../api/resources'
import { useAuth } from '../auth/useAuth'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n/useI18n'
import type { Language } from '../i18n/I18nContext'
import { useTheme } from '../theme/useTheme'
import type { ThemeMode } from '../theme/ThemeContext'
import { getRoleLabel } from '../utils/roles'

export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth()
  const { t, language, setLanguage } = useI18n()
  const { mode, setMode } = useTheme()
  const [photo, setPhoto] = useState(() => localStorage.getItem(`census.profile.photo.${user?.id}`) ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user?.id) setPhoto(localStorage.getItem(`census.profile.photo.${user.id}`) ?? '') }, [user?.id])
  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    if (file.size > 1_500_000) { setError('La photo doit peser moins de 1,5 Mo.'); return }
    const reader = new FileReader()
    reader.onload = () => { const value = String(reader.result); setPhoto(value); localStorage.setItem(`census.profile.photo.${user.id}`, value) }
    reader.readAsDataURL(file)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true)
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const updated = await profileApi.update({ firstName: String(values.firstName), lastName: String(values.lastName), email: String(values.email), phoneNumber: String(values.phoneNumber || '') })
      updateCurrentUser(updated); setMessage(t('profileUpdated'))
    } catch (exception) { setError(getErrorMessage(exception)) } finally { setSaving(false) }
  }
  if (!user) return null

  return <><PageHeader title={t('profile')} subtitle={t('profileSubtitle')} />
    <section className="profile-layout"><aside className="card profile-identity"><div className="profile-photo">{photo ? <img src={photo} alt={user.fullName} /> : <UserRound size={58} />}<label><Camera size={17} /><input type="file" accept="image/*" onChange={choosePhoto} /></label></div><h2>{user.fullName}</h2><span className="role-pill"><ShieldCheck size={15} />{getRoleLabel(user.role, language)}</span><dl><div><Mail size={16} /><span>{user.email}</span></div><div><Phone size={16} /><span>{user.phoneNumber || '—'}</span></div></dl><small>{t('profileProtected')}</small></aside>
      <div className="profile-panels"><form className="card profile-form" onSubmit={submit}><header><div><h2>{t('editProfile')}</h2><p>{t('keepContactsUpdated')}</p></div><Save size={22} /></header><div className="form-grid"><label>{t('firstName')}<input name="firstName" defaultValue={user.firstName} required /></label><label>{t('lastName')}<input name="lastName" defaultValue={user.lastName} required /></label><label className="span-2">{t('email')}<input name="email" type="email" defaultValue={user.email} required /></label><label className="span-2">{t('whatsapp')}<input name="phoneNumber" defaultValue={user.phoneNumber ?? ''} inputMode="tel" /></label>{message && <div className="form-success span-2"><Check size={16} />{message}</div>}{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button className="button button--primary" disabled={saving}>{saving ? t('loading') : t('save')}</button></div></div></form>
        <section className="card preferences-panel"><header><div><h2>{t('appearance')}</h2><p>{t('preferencesSavedDevice')}</p></div><Globe2 size={22} /></header><div className="preference-row"><div><strong>{t('language')}</strong><small>Malagasy · Français · English</small></div><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="mg">Malagasy</option><option value="fr">Français</option><option value="en">English</option></select></div><div className="preference-row"><div><strong>{t('theme')}</strong><small>{t('adaptDisplay')}</small></div><div className="segmented-control"><button className={mode === 'light' ? 'active' : ''} onClick={() => setMode('light')}><Sun size={16} />{t('light')}</button><button className={mode === 'dark' ? 'active' : ''} onClick={() => setMode('dark')}><Moon size={16} />{t('dark')}</button><button className={mode === 'system' ? 'active' : ''} onClick={() => setMode('system' as ThemeMode)}>{t('system')}</button></div></div></section></div></section>
  </>
}
