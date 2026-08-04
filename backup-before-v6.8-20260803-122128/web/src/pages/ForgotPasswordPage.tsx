import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/http'
import { passwordRecoveryApi } from '../api/resources'
import PreferencesControls from '../components/common/PreferencesControls'
import { useI18n } from '../i18n/useI18n'

type Step = 'email' | 'otp' | 'password' | 'done'

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [developmentOtp, setDevelopmentOtp] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const stepIndex = useMemo(() => ({ email: 1, otp: 2, password: 3, done: 4 }[step]), [step])

  const requestCode = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await passwordRecoveryApi.request(email.trim())
      setMessage(result.message)
      setDevelopmentOtp(result.developmentOtp ?? null)
      setStep('otp')
    } catch (exception) {
      setError(getErrorMessage(exception))
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await passwordRecoveryApi.verify(email.trim(), otp.trim())
      setResetToken(result.resetToken)
      setStep('password')
    } catch (exception) {
      setError(getErrorMessage(exception))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await passwordRecoveryApi.reset(email.trim(), resetToken, password, confirmPassword)
      setStep('done')
    } catch (exception) {
      setError(getErrorMessage(exception))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recovery-page">
      <div className="auth-preferences"><PreferencesControls /></div>
      <section className="recovery-card scale-in">
        <Link className="recovery-back" to="/login"><ArrowLeft size={17} />{t('recoveryBack')}</Link>
        <div className="recovery-head"><span><KeyRound size={24} /></span><div><h1>{t('recoverAccess')}</h1><p>{t('recoveryIntro')}</p></div></div>
        <div className="stepper" aria-label={`${t('page')} ${stepIndex} / 3`}>
          {[1, 2, 3].map((number) => <span key={number} className={number <= Math.min(stepIndex, 3) ? 'active' : ''}>{number}</span>)}
        </div>

        {step === 'email' && <form onSubmit={requestCode} className="recovery-form">
          <div className="recovery-illustration"><Mail size={28} /></div>
          <h2>{t('emailQuestion')}</h2><p>{t('emailRecoveryText')}</p>
          <label>{t('email')}<input autoFocus required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="agent@recensement.mg" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button--primary button--wide button--large" disabled={loading}>{loading ? t('sending') : <>{t('receiveCode')} <ArrowRight size={18} /></>}</button>
        </form>}

        {step === 'otp' && <form onSubmit={verifyCode} className="recovery-form">
          <div className="recovery-illustration"><ShieldCheck size={28} /></div>
          <h2>{t('enterSecurityCode')}</h2><p>{message}</p>
          {developmentOtp && <div className="dev-otp"><strong>{t('developmentMode')}</strong><span>{t('otpCode')} : <b>{developmentOtp}</b></span></div>}
          <label>{t('sixDigitCode')}<input autoFocus required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button--primary button--wide button--large" disabled={loading || otp.length !== 6}>{loading ? t('checking') : <>{t('verifyCode')} <ArrowRight size={18} /></>}</button>
          <button className="link-button" type="button" onClick={() => setStep('email')}>{t('anotherEmail')}</button>
        </form>}

        {step === 'password' && <form onSubmit={resetPassword} className="recovery-form">
          <div className="recovery-illustration"><KeyRound size={28} /></div>
          <h2>{t('createNewPassword')}</h2><p>{t('passwordAdvice')}</p>
          <label>{t('newPassword')}<div className="input-with-icon"><KeyRound size={17} /><input autoFocus required minLength={12} maxLength={128} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <label>{t('confirmPassword')}<input required minLength={12} maxLength={128} type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <PasswordStrength value={password} />
          {error && <div className="form-error">{error}</div>}
          <button className="button button--primary button--wide button--large" disabled={loading}>{loading ? t('updating') : t('changePassword')}</button>
        </form>}

        {step === 'done' && <div className="recovery-form recovery-done">
          <div className="recovery-success"><CheckCircle2 size={36} /></div><h2>{t('passwordChanged')}</h2><p>{t('passwordChangedText')}</p>
          <button className="button button--primary button--wide button--large" onClick={() => navigate('/login', { replace: true })}>{t('returnLogin')}</button>
        </div>}
      </section>
    </main>
  )
}

function PasswordStrength({ value }: { value: string }) {
  const { t } = useI18n()
  const score = [value.length >= 12, /[A-Z]/.test(value), /[a-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length
  return <div className="password-strength"><div>{[1, 2, 3, 4, 5].map((item) => <span key={item} className={item <= score ? 'active' : ''} />)}</div><small>{score < 3 ? t('weak') : score < 5 ? t('fair') : t('strong')}</small></div>
}
