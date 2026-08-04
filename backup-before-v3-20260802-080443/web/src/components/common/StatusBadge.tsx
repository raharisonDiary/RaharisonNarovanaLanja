export default function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase()
  const tone = normalized.includes('valid') || normalized.includes('active') || normalized === 'true'
    ? 'success'
    : normalized.includes('reject') || normalized.includes('suspend') || normalized === 'false'
      ? 'danger'
      : normalized.includes('submit') || normalized.includes('schedule')
        ? 'warning'
        : 'neutral'
  return <span className={`badge badge--${tone}`}>{value}</span>
}
