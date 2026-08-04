import { ArrowLeft, QrCode, UserRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useParams } from 'react-router-dom'
import { personsApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import { formatDate, formatDateTime } from '../utils/format'

export default function PersonDetailPage() {
  const { t } = useI18n()
  const { id = '' } = useParams()
  const person = useAsync(() => personsApi.get(id), [id])
  if (person.loading || !person.data) return <Loader />
  const item = person.data
  const rows = [
    [t('fullName'), item.fullName], [t('sex'), item.sex],
    [t('birthDate'), formatDate(item.dateOfBirth)], [t('age'), item.ageYears ?? '—'],
    [t('relationship'), item.relationshipToHead], [t('maritalStatus'), item.maritalStatus],
    [t('nationality'), item.nationality || '—'], [t('occupation'), item.occupation || '—'],
    [t('phone'), item.phoneNumber || '—'], [t('nationalId'), item.nationalId || '—'],
    [t('createdOn'), formatDateTime(item.createdAtUtc)],
  ]
  return <>
    <PageHeader title={t('citizenDetail')} actions={<Link className="button" to="/persons"><ArrowLeft size={17} />{t('back')}</Link>} />
    <section className="person-detail">
      <aside className="card person-card"><span className="person-card__avatar"><UserRound size={60} /></span><QRCodeSVG value={`census://persons/${item.id}`} size={150} level="M" /><button className="button button--primary button--wide"><QrCode size={17} />{t('citizenQr')}</button></aside>
      <article className="card detail-card"><header><div><h2>{item.fullName}</h2><p>{t('personalInfo')}</p></div><StatusBadge value={item.recordStatus} /></header><dl>{rows.map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
    </section>
  </>
}
