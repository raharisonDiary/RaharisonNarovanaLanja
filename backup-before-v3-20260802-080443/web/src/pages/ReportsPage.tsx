import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { campaignsApi, reportUrl } from '../api/resources'
import { tokenStore } from '../api/tokenStore'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import { useAsync } from '../hooks/useAsync'

export default function ReportsPage() {
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [campaignId, setCampaignId] = useState('')
  const selected = campaignId || campaigns.data?.[0]?.id || ''
  const download = async (resource: 'dwellings'|'households'|'persons') => {
    const response = await fetch(reportUrl(selected, resource), { headers: { Authorization: `Bearer ${tokenStore.getAccessToken()}` } })
    if (!response.ok) throw new Error('Export impossible.')
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${resource}.csv`; link.click(); URL.revokeObjectURL(url)
  }
  if (campaigns.loading) return <Loader/>
  return <><PageHeader title="Rapports et exports" subtitle="Extraction des données au format CSV" actions={<select className="select" value={selected} onChange={(event) => setCampaignId(event.target.value)}>{campaigns.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}/><section className="report-grid">{([['dwellings','Habitations'],['households','Ménages'],['persons','Personnes']] as const).map(([resource,label]) => <article className="card report-card" key={resource}><span><FileSpreadsheet size={27}/></span><div><h2>{label}</h2><p>Exporter toutes les données de la campagne sélectionnée.</p></div><button className="button button--primary" disabled={!selected} onClick={() => void download(resource)}><Download size={17}/>Télécharger CSV</button></article>)}</section></>
}
