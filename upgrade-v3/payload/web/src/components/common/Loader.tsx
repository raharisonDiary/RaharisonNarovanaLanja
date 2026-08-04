import { useI18n } from '../../i18n/useI18n'

export default function Loader({ label }: { label?: string }) {
  const { t } = useI18n()
  return <div className="loader"><span className="loader__spinner" />{label ?? t('loading')}</div>
}
