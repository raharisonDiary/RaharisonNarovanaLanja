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
import { formatNumber } from '../utils/format'

export default function DashboardPage() {
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const [selectedId, setSelectedId] = useState('')
  const campaignId = selectedId || campaigns.data?.find((item) => item.status === 'Active')?.id || campaigns.data?.[0]?.id || ''
  const dashboard = useAsync(() => campaignId ? dashboardApi.get(campaignId) : Promise.resolve(null), [campaignId])

  const progress = useMemo(() => {
    const item = dashboard.data
    if (!item) return []
    return [
      { name: 'Brouillons', value: item.draftHouseholds },
      { name: 'Soumis', value: item.submittedHouseholds },
      { name: 'Validés', value: item.validatedHouseholds },
      { name: 'Rejetés', value: item.rejectedHouseholds },
    ]
  }, [dashboard.data])

  if (campaigns.loading) return <Loader />
  if (!campaigns.data?.length) return <><PageHeader title="Tableau de bord" /><EmptyState text="Créez une campagne pour afficher les statistiques." /></>
  const data = dashboard.data

  return (
    <>
      <PageHeader title="Bonjour, prêt pour la collecte ?" subtitle="Les informations essentielles et les prochaines actions sont regroupées ici." actions={<select className="select" value={campaignId} onChange={(event) => setSelectedId(event.target.value)}>{campaigns.data.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select>} />
      {dashboard.loading || !data ? <Loader /> : <div className="dashboard-grid">
        <section className="dashboard-hero card">
          <div><span className="eyebrow">Campagne en cours</span><h2>{data.campaignName}</h2><p>Commencez une nouvelle collecte ou reprenez le contrôle de la qualité des données.</p><div className="dashboard-hero__actions"><Link className="button button--primary" to="/dwellings"><Plus size={17} /> Nouvelle collecte</Link><Link className="button" to="/map"><MapPinned size={17} /> Ouvrir la carte</Link></div></div>
          <div className="campaign-score"><span>{data.totalHouseholds ? Math.round(data.validatedHouseholds / data.totalHouseholds * 100) : 0}%</span><small>Ménages validés</small><StatusBadge value={data.campaignStatus} /></div>
        </section>

        <section className="metric-grid">
          <MetricCard label="Campagne" value={1} icon={ClipboardList} />
          <MetricCard label="Habitations" value={data.totalDwellings} icon={Building2} tone="orange" />
          <MetricCard label="Ménages" value={data.totalHouseholds} icon={UsersRound} tone="green" />
          <MetricCard label="Population" value={data.totalPersons} icon={Users} tone="purple" />
        </section>

        <section className="card workflow-card">
          <header><div><h2>Parcours de collecte simplifié</h2><p>Suivez toujours le même ordre pour éviter les erreurs.</p></div></header>
          <div className="workflow-steps">
            <Link to="/dwellings"><span>1</span><Building2 size={20} /><div><strong>Habitation</strong><small>Position et adresse</small></div><ArrowRight size={17} /></Link>
            <Link to="/households"><span>2</span><UsersRound size={20} /><div><strong>Ménage</strong><small>Composition et contact</small></div><ArrowRight size={17} /></Link>
            <Link to="/persons"><span>3</span><Users size={20} /><div><strong>Personnes</strong><small>Membres du ménage</small></div><ArrowRight size={17} /></Link>
            <Link to="/statistics"><span>4</span><CheckCircle2 size={20} /><div><strong>Contrôle</strong><small>Validation et statistiques</small></div><ArrowRight size={17} /></Link>
          </div>
        </section>

        <section className="card chart-card chart-card--wide">
          <header><div><h2>Progression des ménages</h2><p>Répartition par état de traitement</p></div><BarChart3 size={20} /></header>
          <div className="chart-height"><ResponsiveContainer width="100%" height="100%"><AreaChart data={progress}><defs><linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B4BDB" stopOpacity={0.32}/><stop offset="95%" stopColor="#5B4BDB" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Area type="monotone" dataKey="value" stroke="#5B4BDB" fill="url(#primaryGradient)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div>
        </section>

        <section className="card chart-card">
          <header><div><h2>Répartition par sexe</h2><p>{formatNumber(data.totalPersons)} personnes</p></div></header>
          <div className="gender-chart"><ResponsiveContainer width="62%" height={220}><PieChart><Pie data={[{ name: 'Femmes', value: data.femalePersons }, { name: 'Hommes', value: data.malePersons }]} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3}><Cell fill="#5B4BDB"/><Cell fill="#16B3A3"/></Pie><Tooltip/></PieChart></ResponsiveContainer><div><strong>{data.totalPersons ? Math.round(data.femalePersons / data.totalPersons * 100) : 0}%</strong><span>Femmes</span><strong>{data.totalPersons ? Math.round(data.malePersons / data.totalPersons * 100) : 0}%</strong><span>Hommes</span></div></div>
        </section>

        <section className="card status-summary"><h2>Qualité des données</h2><div className="status-summary__rows"><span>Habitations validées <strong>{data.validatedDwellings}</strong></span><span>Ménages validés <strong>{data.validatedHouseholds}</strong></span><span>Personnes validées <strong>{data.validatedPersons}</strong></span><span>Éléments à corriger <strong>{data.rejectedDwellings + data.rejectedHouseholds + data.rejectedPersons}</strong></span></div></section>
      </div>}
    </>
  )
}
