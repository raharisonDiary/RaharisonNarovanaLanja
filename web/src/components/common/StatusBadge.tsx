import { useI18n } from '../../i18n/useI18n'

const labels = {
  fr: { Draft: 'Brouillon', Submitted: 'Soumis', Validated: 'Validé', Rejected: 'Rejeté', Active: 'Actif', Inactive: 'Inactif', Scheduled: 'Programmé', Closed: 'Terminé', Archived: 'Archivé', Suspended: 'Suspendu', PreviewOnly: 'À envoyer', Sent: 'Envoyé', Failed: 'Échec' },
  mg: { Draft: 'Volavola', Submitted: 'Nalefa', Validated: 'Voamarina', Rejected: 'Nolavina', Active: 'Mandeha', Inactive: 'Tsy mandeha', Scheduled: 'Voalahatra', Closed: 'Vita', Archived: 'Voatahiry', Suspended: 'Naato', PreviewOnly: 'Hampitaina', Sent: 'Voalefa', Failed: 'Tsy nahomby' },
  en: { Draft: 'Draft', Submitted: 'Submitted', Validated: 'Validated', Rejected: 'Rejected', Active: 'Active', Inactive: 'Inactive', Scheduled: 'Scheduled', Closed: 'Completed', Archived: 'Archived', Suspended: 'Suspended', PreviewOnly: 'Ready to send', Sent: 'Sent', Failed: 'Failed' },
} as const

export default function StatusBadge({ value }: { value: string }) {
  const { language } = useI18n()
  const normalized = value.toLowerCase()
  const tone = normalized.includes('valid') || normalized.includes('active') || normalized === 'true' || normalized === 'sent'
    ? 'success'
    : normalized.includes('reject') || normalized.includes('suspend') || normalized === 'false' || normalized === 'failed'
      ? 'danger'
      : normalized.includes('submit') || normalized.includes('schedule') || normalized === 'previewonly'
        ? 'warning'
        : 'neutral'
  const translated = labels[language][value as keyof typeof labels.fr] ?? value
  return <span className={`badge badge--${tone}`}>{translated}</span>
}
