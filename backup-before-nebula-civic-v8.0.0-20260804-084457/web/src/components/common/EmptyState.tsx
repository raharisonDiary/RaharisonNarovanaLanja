import { Inbox } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'

export default function EmptyState({ text }: { text?: string }) {
  const { t } = useI18n()
  return <div className="empty-state"><Inbox size={34} /><p>{text ?? t('noData')}</p></div>
}
