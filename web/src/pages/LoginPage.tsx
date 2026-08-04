import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UsersRound, Wifi } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { useAuth } from '../auth/useAuth'
import PreferencesControls from '../components/common/PreferencesControls'
import { useI18n } from '../i18n/useI18n'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    try { await login(email.trim(), password); const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'; navigate(destination, { replace: true }) }
    catch (exception) { setError(getErrorMessage(exception)) }
  }

  return <main className="auth-page">
    <section className="auth-story"><div className="auth-story__glow auth-story__glow--one" /><div className="auth-story__glow auth-story__glow--two" /><Link to="/" className="auth-brand"><span><UsersRound size={24} /></span><div><strong>Census Flow</strong><small>{t('brandTagline')}</small></div></Link><div className="auth-story__content fade-in-up"><span className="auth-kicker"><Sparkles size={14} /> {t('publicPortal')}</span><h1>{t('fieldReady')}<br /><em>{t('liveMonitoring')}</em></h1><p>{t('publicIntro')}</p><div className="auth-benefits"><article><ShieldCheck size={19} /><div><strong>{t('privacy')}</strong><small>{t('privacyText')}</small></div></article><article><Wifi size={19} /><div><strong>{t('offlineFirst')}</strong><small>{t('offlineFirstText')}</small></div></article></div><figure className="auth-showcase"><img src="/images/census-flow-analytics.webp" alt="Tableau de bord responsive Census Flow" /></figure></div><div className="auth-story__footer"><span className="live-dot" /> Census Flow · API sécurisée</div></section>
    <section className="auth-panel"><div className="auth-panel__top"><Link to="/" className="recovery-back"><ArrowLeft size={16} />{t('backHome')}</Link><PreferencesControls /></div><form className="auth-card scale-in" onSubmit={submit}><div className="auth-card__header"><span className="auth-card__icon"><LockKeyhole size={22} /></span><div><h2>{t('welcomeBack')}</h2><p>{t('loginHint')}</p></div></div><label>{t('email')}<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="agent@census.mg" /></label><label>{t('password')}<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} required minLength={12} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('password')} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer' : 'Afficher'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><div className="auth-row"><label className="remember"><input type="checkbox" /> <span>{t('rememberMe')}</span></label><Link to="/forgot-password">{t('forgotPassword')}</Link></div>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button--primary button--wide button--large" disabled={isLoading}>{isLoading ? t('signingIn') : <><span>{t('signIn')}</span><ArrowRight size={18} /></>}</button><p className="auth-help">Census Flow · Web sécurisé pour administrateurs, responsables régionaux et agents.</p></form></section>
  </main>
}
