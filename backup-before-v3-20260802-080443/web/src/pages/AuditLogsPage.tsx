import { Search } from 'lucide-react'
import { useState } from 'react'
import { auditApi } from '../api/resources'
import DataTable from '../components/common/DataTable'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import type { AuditLogDto } from '../types/api'
import { formatDateTime } from '../utils/format'

export default function AuditLogsPage() {
  const [actionName, setActionName] = useState('')
  const [page, setPage] = useState(1)
  const logs = useAsync(() => auditApi.list({ actionName: actionName || undefined, page, pageSize: 50 }), [actionName, page])
  return <><PageHeader title="Journal d’audit" subtitle="Traçabilité des actions sensibles"/><section className="card"><div className="toolbar"><label className="search-box"><Search size={17}/><input value={actionName} onChange={(event) => {setActionName(event.target.value); setPage(1)}} placeholder="Rechercher une action…"/></label></div>{logs.loading ? <Loader/> : <DataTable<AuditLogDto> rows={logs.data?.items ?? []} keyOf={(row) => row.id} columns={[{ key:'date',title:'Date',render:(row)=>formatDateTime(row.occurredAtUtc)},{key:'actor',title:'Acteur',render:(row)=>row.actorEmail||'Anonyme'},{key:'action',title:'Action',render:(row)=><div><strong>{row.actionName}</strong><small className="cell-subtitle">{row.httpMethod} {row.requestPath}</small></div>},{key:'entity',title:'Entité',render:(row)=>row.entityType||'—'},{key:'status',title:'Résultat',render:(row)=><StatusBadge value={row.wasSuccessful?`Succès ${row.statusCode}`:`Erreur ${row.statusCode}`}/>},{key:'trace',title:'Trace',render:(row)=><code>{row.traceId.slice(0,12)}…</code>}]}/>}<div className="pagination"><button className="button" disabled={page<=1} onClick={()=>setPage((value)=>value-1)}>Précédent</button><span>Page {logs.data?.page ?? page} / {Math.max(logs.data?.totalPages ?? 1,1)}</span><button className="button" disabled={page>=(logs.data?.totalPages??1)} onClick={()=>setPage((value)=>value+1)}>Suivant</button></div></section></>
}
