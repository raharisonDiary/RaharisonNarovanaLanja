import { ArrowLeft, QrCode, UserRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useParams } from 'react-router-dom'
import { personsApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { formatDate, formatDateTime } from '../utils/format'

export default function PersonDetailPage() {
  const { id = '' } = useParams()
  const person = useAsync(() => personsApi.get(id), [id])
  if (person.loading || !person.data) return <Loader />
  const item = person.data
  const rows = [['Nom complet', item.fullName], ['Sexe', item.sex], ['Date de naissance', formatDate(item.dateOfBirth)], ['Âge', item.ageYears ?? '—'], ['Lien avec le chef', item.relationshipToHead], ['État matrimonial', item.maritalStatus], ['Nationalité', item.nationality || '—'], ['Profession', item.occupation || '—'], ['Téléphone', item.phoneNumber || '—'], ['NIN', item.nationalId || '—'], ['Créé le', formatDateTime(item.createdAtUtc)]]
  return <><PageHeader title="Détail du citoyen" actions={<Link className="button" to="/persons"><ArrowLeft size={17}/>Retour</Link>}/><section className="person-detail"><aside className="card person-card"><span className="person-card__avatar"><UserRound size={60}/></span><QRCodeSVG value={`census://persons/${item.id}`} size={150} level="M"/><button className="button button--primary button--wide"><QrCode size={17}/>QR Code citoyen</button></aside><article className="card detail-card"><header><div><h2>{item.fullName}</h2><p>Informations personnelles</p></div><StatusBadge value={item.recordStatus}/></header><dl>{rows.map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article></section></>
}
