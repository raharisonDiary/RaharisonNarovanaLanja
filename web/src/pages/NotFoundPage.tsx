import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

export default function NotFoundPage() {
  const { t } = useI18n()
  return <main className="not-found"><strong>404</strong><h1>{t('notFoundTitle')}</h1><p>{t('notFoundText')}</p><Link className="button button--primary" to="/dashboard">{t('backDashboard')}</Link></main>
}
