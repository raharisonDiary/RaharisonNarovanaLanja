import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '../../utils/format'

export default function MetricCard({ label, value, icon: Icon, tone = 'primary' }: { label: string; value: number; icon: LucideIcon; tone?: string }) {
  return <article className="metric-card fade-in-up"><div><small>{label}</small><strong>{formatNumber(value)}</strong></div><span className={`metric-card__icon metric-card__icon--${tone}`}><Icon size={20} /></span></article>
}
