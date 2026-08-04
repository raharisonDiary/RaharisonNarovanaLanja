import { campaignsApi, dashboardApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../utils/format'

export default function StatisticsPage() {
  const campaigns = useAsync(() => campaignsApi.list(), [])
  const campaign = campaigns.data?.find((item) => item.status === 'Active') ?? campaigns.data?.[0]
  const dashboard = useAsync(() => campaign ? dashboardApi.get(campaign.id) : Promise.resolve(null), [campaign?.id])
  if (campaigns.loading || dashboard.loading || !dashboard.data) return <Loader/>
  const d = dashboard.data
  const statusData = [{ name: 'Brouillon', value: d.draftPersons }, { name: 'Soumis', value: d.submittedPersons }, { name: 'Validé', value: d.validatedPersons }, { name: 'Rejeté', value: d.rejectedPersons }]
  return <><PageHeader title="Statistiques démographiques" subtitle={d.campaignName}/><section className="statistics-kpis"><article className="card"><small>Population totale</small><strong>{formatNumber(d.totalPersons)}</strong></article><article className="card"><small>Hommes</small><strong>{formatNumber(d.malePersons)}</strong></article><article className="card"><small>Femmes</small><strong>{formatNumber(d.femalePersons)}</strong></article></section><section className="statistics-grid"><article className="card chart-card"><h2>Répartition par statut</h2><div className="chart-height"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></article><article className="card chart-card"><h2>Répartition par sexe</h2><div className="chart-height"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{name:'Femmes',value:d.femalePersons},{name:'Hommes',value:d.malePersons}]} dataKey="value" outerRadius={100} label><Cell fill="#2563eb"/><Cell fill="#93c5fd"/></Pie><Tooltip/></PieChart></ResponsiveContainer></div></article></section></>
}
