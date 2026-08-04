import { ArrowRight, BarChart3, Building2, CheckCircle2, ClipboardList, MapPinned, Plus, Users, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { campaignsApi, dashboardApi } from '../api/resources'
import EmptyState from '../components/common/EmptyState'
import Loader from '../components/common/Loader'
import MetricCard from '../components/common/MetricCard'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import { formatNumber } from '../utils/format'

export default function DashboardPage() {
  const { t } = useI18n()
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [selectedId, setSelectedId] = useState('')
  const campaignId = selectedId || campaigns.data?.find((item) => item.status === 'Active')?.id || campaigns.data?.[0]?.id || ''
  const dashboard = useAsync(() => campaignId ? dashboardApi.get(campaignId) : Promise.resolve(null), [campaignId])

  const progress = useMemo(() => {
    const item = dashboard.data
    if (!item) return []
    return [
      { name: t('draftPlural'), value: item.draftHouseholds },
      { name: t('submittedPlural'), value: item.submittedHouseholds },
      { name: t('validatedPlural'), value: item.validatedHouseholds },
      { name: t('rejectedPlural'), value: item.rejectedHouseholds },
    ]
  }, [dashboard.data, t])

  if (campaigns.loading) return <Loader />
  if (!campaigns.data?.length) return <><PageHeader title={t('dashboard')} /><EmptyState text={t('createCampaignFirst')} /></>
  const data = dashboard.data

  return (
    <>
      <PageHeader title={t('dashboardGreeting')} subtitle={t('dashboardHint')} actions={<select className="select" value={campaignId} onChange={(event) => setSelectedId(event.target.value)}>{campaigns.data.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select>} />
      {dashboard.loading || !data ? <Loader /> : <div className="dashboard-grid">
        <section className="dashboard-hero card">
          <div><span className="eyebrow">{t('currentCampaign')}</span><h2>{data.campaignName}</h2><p>{t('dashboardHeroText')}</p><div className="dashboard-hero__actions"><Link className="button button--primary" to="/dwellings"><Plus size={17} /> {t('newCollection')}</Link><Link className="button" to="/map"><MapPinned size={17} /> {t('openMap')}</Link></div></div>
          <div className="campaign-score"><span>{data.totalHouseholds ? Math.round(data.validatedHouseholds / data.totalHouseholds * 100) : 0}%</span><small>{t('validatedHouseholds')}</small><StatusBadge value={data.campaignStatus} /></div>
        </section>

        <section className="metric-grid">
          <MetricCard label={t('campaign')} value={1} icon={ClipboardList} />
          <MetricCard label={t('dwellings')} value={data.totalDwellings} icon={Building2} tone="orange" />
          <MetricCard label={t('households')} value={data.totalHouseholds} icon={UsersRound} tone="green" />
          <MetricCard label={t('population')} value={data.totalPersons} icon={Users} tone="purple" />
        </section>

        <section className="card workflow-card">
          <header><div><h2>{t('simplifiedWorkflow')}</h2><p>{t('workflowText')}</p></div></header>
          <div className="workflow-steps">
            <Link to="/dwellings"><span>1</span><Building2 size={20} /><div><strong>{t('dwelling')}</strong><small>{t('positionAddress')}</small></div><ArrowRight size={17} /></Link>
            <Link to="/households"><span>2</span><UsersRound size={20} /><div><strong>{t('household')}</strong><small>{t('householdComposition')}</small></div><ArrowRight size={17} /></Link>
            <Link to="/persons"><span>3</span><Users size={20} /><div><strong>{t('citizens')}</strong><small>{t('householdMembers')}</small></div><ArrowRight size={17} /></Link>
            <Link to="/statistics"><span>4</span><CheckCircle2 size={20} /><div><strong>{t('control')}</strong><small>{t('validationStatistics')}</small></div><ArrowRight size={17} /></Link>
          </div>
        </section>

        <section className="card chart-card chart-card--wide">
          <header><div><h2>{t('householdProgress')}</h2><p>{t('processingStatus')}</p></div><BarChart3 size={20} /></header>
          <div className="chart-height"><ResponsiveContainer width="100%" height="100%"><AreaChart data={progress}><defs><linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4BDB" stopOpacity={0.32}/><stop offset="95%" stopColor="#5B4BDB" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Area type="monotone" dataKey="value" stroke="#5B4BDB" fill="url(#primaryGradient)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
        </section>

        <section className="card chart-card">
          <header><div><h2>{t('sexDistribution')}</h2><p>{formatNumber(data.totalPersons)} personnes</p></div></header>
          <div className="gender-chart"><ResponsiveContainer width="62%" height={220}><PieChart><Pie data={[{ name: t('women'), value: data.femalePersons }, { name: t('men'), value: data.malePersons }]} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3}><Cell fill="#5B4BDB"/><Cell fill="#16B3A3"/></Pie><Tooltip/></PieChart></ResponsiveContainer><div><strong>{data.totalPersons ? Math.round(data.femalePersons / data.totalPersons * 100) : 0}%</strong><span>{t('women')}</span><strong>{data.totalPersons ? Math.round(data.malePersons / data.totalPersons * 100) : 0}%</strong><span>{t('men')}</span></div></div>
        </section>

        <section className="card status-summary"><h2>{t('dataQuality')}</h2><div className="status-summary__rows"><span>{t('validatedDwellings')} <strong>{data.validatedDwellings}</strong></span><span>{t('validatedHouseholds')} <strong>{data.validatedHouseholds}</strong></span><span>{t('validatedPersons')} <strong>{data.validatedPersons}</strong></span><span>{t('itemsToFix')} <strong>{data.rejectedDwellings + data.rejectedHouseholds + data.rejectedPersons}</strong></span></div></section>
      </div>}
    </>
  )
}
