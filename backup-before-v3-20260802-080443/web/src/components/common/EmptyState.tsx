import { Inbox } from 'lucide-react'
export default function EmptyState({ text = 'Aucune donnée disponible.' }: { text?: string }) {
  return <div className="empty-state"><Inbox size={34} /><p>{text}</p></div>
}
