import { Eye, EyeOff, LockKeyhole, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
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
      await login(email, password)
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'
      navigate(destination, { replace: true })
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual__logo"><UsersRound size={30} /></div>
        <div className="login-visual__content fade-in-up">
          <span className="eyebrow">Plateforme nationale</span>
          <h1>Recensement<br />de Population</h1>
          <p>Collecter, centraliser et analyser les données démographiques avec une solution sécurisée.</p>
        </div>
        <div className="login-visual__art" aria-hidden="true">
          <span className="building b1" /><span className="building b2" /><span className="building b3" />
          <span className="person p1" /><span className="person p2" /><span className="person p3" />
        </div>
        <small>© 2026 Plateforme de Recensement</small>
      </section>
      <section className="login-panel">
        <form className="login-card scale-in" onSubmit={submit}>
          <div className="login-card__icon"><UsersRound size={27} /></div>
          <h2>Bienvenue</h2>
          <p>Connectez-vous à votre compte pour accéder à la plateforme.</p>
          <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemple@domaine.com" /></label>
          <label>Mot de passe<div className="input-with-icon"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher le mot de passe">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button--primary button--wide" disabled={isLoading}>{isLoading ? 'Connexion…' : 'Se connecter'}</button>
          <a href="mailto:administrateur@recensement.mg">Mot de passe oublié ?</a>
        </form>
      </section>
    </main>
  )
}
