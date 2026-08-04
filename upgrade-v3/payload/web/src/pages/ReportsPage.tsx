import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { campaignsApi, reportUrl } from '../api/resources'
import { tokenStore } from '../api/tokenStore'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'

export default function ReportsPage() {
  const { t } = useI18n()
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [campaignId, setCampaignId] = useState('')
  const selected = campaignId || campaigns.data?.[0]?.id || ''

  const download = async (resource: 'dwellings' | 'households' | 'persons') => {
    const response = await fetch(reportUrl(selected, resource), {
      headers: { Authorization: `Bearer ${tokenStore.getAccessToken()}` },
    })
    if (!response.ok) throw new Error(t('exportImpossible'))
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${resource}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (campaigns.loading) return <Loader />
  const resources = [
    ['dwellings', t('dwellings')],
    ['households', t('households')],
    ['persons', t('citizens')],
  ] as const

  return <>
    <PageHeader title={t('reportsTitle')} subtitle={t('reportsSubtitle')} actions={<select className="select" value={selected} onChange={(event) => setCampaignId(event.target.value)}>{campaigns.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>} />
    <section className="report-grid">{resources.map(([resource, label]) => <article className="card report-card" key={resource}><span><FileSpreadsheet size={27} /></span><div><h2>{label}</h2><p>{t('exportAllCampaignData')}</p></div><button className="button button--primary" disabled={!selected} onClick={() => void download(resource)}><Download size={17} />{t('downloadCsv')}</button></article>)}</section>
  </>
}
