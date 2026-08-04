import { Search } from 'lucide-react'
import { useState } from 'react'
import { auditApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AuditLogDto } from '../types/api'
import { formatDateTime } from '../utils/format'

export default function AuditLogsPage() {
  const { t } = useI18n()
  const [actionName, setActionName] = useState('')
  const [page, setPage] = useState(1)
  const logs = useAsync(() => auditApi.list({ actionName: actionName || undefined, page, pageSize: 50 }), [actionName, page])
  const totalPages = Math.max(logs.data?.totalPages ?? 1, 1)

  return <>
    <PageHeader title={t('auditTitle')} subtitle={t('auditSubtitle')} />
    <section className="card">
      <div className="toolbar"><label className="search-box"><Search size={17} /><input value={actionName} onChange={(event) => { setActionName(event.target.value); setPage(1) }} placeholder={t('search')} /></label></div>
      {logs.loading ? <Loader /> : <DataTable<AuditLogDto> rows={logs.data?.items ?? []} keyOf={(row) => row.id} columns={[
        { key: 'date', title: 'Date', render: (row) => formatDateTime(row.occurredAtUtc) },
        { key: 'actor', title: t('actor'), render: (row) => row.actorEmail || t('anonymous') },
        { key: 'action', title: t('action'), render: (row) => <div><strong>{row.actionName}</strong><small className="cell-subtitle">{row.httpMethod} {row.requestPath}</small></div> },
        { key: 'entity', title: t('entity'), render: (row) => row.entityType || '—' },
        { key: 'status', title: t('result'), render: (row) => <StatusBadge value={`${row.wasSuccessful ? t('success') : t('error')} ${row.statusCode}`} /> },
        { key: 'trace', title: t('trace'), render: (row) => <code>{row.traceId.slice(0, 12)}…</code> },
      ]} />}
      <div className="pagination"><button className="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t('previous')}</button><span>{t('page')} {logs.data?.page ?? page} / {totalPages}</span><button className="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>{t('next')}</button></div>
    </section>
  </>
}
