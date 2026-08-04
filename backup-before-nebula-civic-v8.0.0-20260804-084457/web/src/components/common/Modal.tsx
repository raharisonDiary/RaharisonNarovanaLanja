import { X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

export default function Modal({ title, open, onClose, children, footer }: PropsWithChildren<{ title: string; open: boolean; onClose: () => void; footer?: ReactNode }>) {
  if (!open) return null
  return (
    <div className="modal-backdrop fade-in" role="presentation" onMouseDown={onClose}>
      <section className="modal scale-in" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={20} /></button></header>
        <div className="modal__body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  )
}
