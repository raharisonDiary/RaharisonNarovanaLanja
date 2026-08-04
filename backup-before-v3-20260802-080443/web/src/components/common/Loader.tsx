export default function Loader({ label = 'Chargement…' }: { label?: string }) {
  return <div className="loader"><span className="loader__spinner" />{label}</div>
}
