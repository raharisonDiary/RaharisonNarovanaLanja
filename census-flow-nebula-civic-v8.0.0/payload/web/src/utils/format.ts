export const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value)) : '—'
export const formatDateTime = (value?: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
export const labelize = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ')
