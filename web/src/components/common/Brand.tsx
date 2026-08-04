import { UsersRound } from 'lucide-react'

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__mark"><UsersRound size={24} /></span>
      {!compact && <span><strong>Recensement</strong><small>de Population</small></span>}
    </div>
  )
}
