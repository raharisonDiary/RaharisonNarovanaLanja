import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UsersRound, Wifi } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await login(email.trim(), password)
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'
      navigate(destination, { replace: true })
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story__glow auth-story__glow--one" />
        <div className="auth-story__glow auth-story__glow--two" />
        <div className="auth-brand"><span><UsersRound size={24} /></span><div><strong>Census Flow</strong><small>Recensement intelligent</small></div></div>
        <div className="auth-story__content fade-in-up">
          <span className="auth-kicker"><Sparkles size={14} /> Plateforme nationale unifiée</span>
          <h1>Des données fiables.<br /><em>Des décisions plus justes.</em></h1>
          <p>Une expérience claire pour collecter, contrôler et analyser les données démographiques, sur le web comme sur le terrain.</p>
          <div className="auth-benefits">
            <article><ShieldCheck size={19} /><div><strong>Sécurisée</strong><small>Accès par rôle et traçabilité</small></div></article>
            <article><Wifi size={19} /><div><strong>Terrain d’abord</strong><small>Collecte mobile et synchronisation</small></div></article>
          </div>
        </div>
        <div className="auth-story__footer"><span className="live-dot" /> Système opérationnel</div>
      </section>

      <section className="auth-panel">
        <form className="auth-card scale-in" onSubmit={submit}>
          <div className="auth-card__header">
            <span className="auth-card__icon"><LockKeyhole size={22} /></span>
            <div><h2>Heureux de vous revoir</h2><p>Accédez à votre espace de travail.</p></div>
          </div>

          <label>Adresse e-mail
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="agent@recensement.mg" />
          </label>

          <label>Mot de passe
            <div className="input-with-icon">
              <LockKeyhole size={17} />
              <input type={showPassword ? 'text' : 'password'} required minLength={12} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </label>

          <div className="auth-row"><label className="remember"><input type="checkbox" /> <span>Rester connecté</span></label><Link to="/forgot-password">Mot de passe oublié ?</Link></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button--primary button--wide button--large" disabled={isLoading}>{isLoading ? 'Connexion en cours…' : <><span>Se connecter</span><ArrowRight size={18} /></>}</button>
          <p className="auth-help">Besoin d’aide ? Contactez votre administrateur national.</p>
        </form>
      </section>
    </main>
  )
}
