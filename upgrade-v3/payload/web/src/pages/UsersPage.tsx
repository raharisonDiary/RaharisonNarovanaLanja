import { Check, Copy, ExternalLink, Plus, Power, Search, UserPlus, UsersRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../api/http'
import { managedUsersApi, territoriesApi, usersApi } from '../api/resources'
import { useAuth } from '../auth/useAuth'
import DataTable from '../components/common/DataTable'
import EmptyState from '../components/common/EmptyState'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import type { AdministrativeAreaDto, ProvisionedUserResponse, UserDto } from '../types/api'
import { formatDateTime } from '../utils/format'
import { getRoleLabel } from '../utils/roles'

const descendantsOf = (areas: AdministrativeAreaDto[], rootId?: string | null) => {
  if (!rootId) return areas
  const allowed = new Set<string>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const area of areas) if (area.parentId && allowed.has(area.parentId) && !allowed.has(area.id)) { allowed.add(area.id); changed = true }
  }
  return areas.filter((area) => allowed.has(area.id))
}

export default function UsersPage() {
  const { user } = useAuth()
  const { t, language } = useI18n()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<ProvisionedUserResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const users = useAsync(() => managedUsersApi.list(), [])
  const territories = useAsync(() => territoriesApi.list(), [])
  const targetRole = user?.role === 'RegionalSupervisor' ? 'Enumerator' : 'RegionalSupervisor'
  const possibleAreas = useMemo(() => {
    const all = descendantsOf(territories.data ?? [], user?.role === 'RegionalSupervisor' ? user.administrativeAreaId : null)
    return targetRole === 'RegionalSupervisor'
      ? all.filter((area) => area.type === 'Region')
      : all.filter((area) => ['Commune', 'Fokontany', 'EnumerationArea'].includes(area.type))
  }, [targetRole, territories.data, user?.administrativeAreaId, user?.role])
  const filtered = useMemo(() => (users.data ?? []).filter((item) => `${item.fullName} ${item.email} ${item.phoneNumber ?? ''}`.toLowerCase().includes(search.toLowerCase())), [search, users.data])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const result = await managedUsersApi.create({
        firstName: String(values.firstName), lastName: String(values.lastName), email: String(values.email || '') || undefined,
        whatsAppNumber: String(values.whatsAppNumber), role: targetRole, administrativeAreaId: String(values.administrativeAreaId),
      })
      setOpen(false)
      setCreated(result)
      await users.reload()
    } catch (exception) { setError(getErrorMessage(exception)) }
  }

  const copyCredentials = async () => {
    if (!created) return
    await navigator.clipboard.writeText(`${t('email')}: ${created.generatedEmail}\n${t('password')}: ${created.temporaryPassword}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <>
    <PageHeader title={t('users')} subtitle={t('usersSubtitle')} actions={<button className="button button--primary" onClick={() => setOpen(true)}><UserPlus size={17} />{targetRole === 'RegionalSupervisor' ? t('createRegionalChief') : t('createAgent')}</button>} />
    <section className="role-flow card"><div><span>1</span><strong>Administrateur</strong><small>crée les chefs de région</small></div><i /><div><span>2</span><strong>Chef de région</strong><small>crée et supervise les agents</small></div><i /><div><span>3</span><strong>Agent</strong><small>collecte et synchronise le terrain</small></div></section>
    <section className="card"><div className="toolbar"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('search')} /></label><span className="toolbar-count"><UsersRound size={16} />{filtered.length}</span></div>{users.loading ? <Loader /> : filtered.length === 0 ? <EmptyState text={t('noUsers')} /> : <DataTable<UserDto> rows={filtered} keyOf={(row) => row.id} columns={[
      { key: 'name', title: t('users'), render: (row) => <div className="primary-cell"><span className="avatar">{row.firstName[0]}{row.lastName[0]}</span><div><strong>{row.fullName}</strong><small>{row.email}</small><small>{row.phoneNumber}</small></div></div> },
      { key: 'role', title: t('role'), render: (row) => getRoleLabel(row.role, language) },
      { key: 'status', title: t('status'), render: (row) => <StatusBadge value={row.isActive ? t('active') : t('inactive')} /> },
      { key: 'login', title: t('lastLogin'), render: (row) => formatDateTime(row.lastLoginAtUtc) },
      { key: 'actions', title: t('actions'), render: (row) => <button className="icon-button" title={row.isActive ? t('inactive') : t('active')} onClick={() => void usersApi.setStatus(row.id, !row.isActive).then(users.reload)}><Power size={17} /></button> },
    ]} />}</section>

    <Modal title={t('newAccount')} open={open} onClose={() => setOpen(false)}><form className="form-grid account-form" onSubmit={submit}><div className="form-intro span-2"><span><Plus size={20} /></span><div><strong>{targetRole === 'RegionalSupervisor' ? t('createRegionalChief') : t('createAgent')}</strong><p>L’e-mail et le mot de passe seront générés automatiquement puis transmis sur WhatsApp.</p></div></div><label>{t('firstName')}<input name="firstName" required autoFocus /></label><label>{t('lastName')}<input name="lastName" required /></label><label className="span-2">{t('whatsapp')}<input name="whatsAppNumber" inputMode="tel" placeholder="261 34 00 000 00" minLength={8} required /></label><label className="span-2">{t('optionalEmail')}<input name="email" type="email" placeholder="Laisser vide pour générer automatiquement" /></label><label className="span-2">{t('assignment')}<select name="administrativeAreaId" required><option value="">— {t('assignment')} —</option>{possibleAreas.map((area) => <option key={area.id} value={area.id}>{area.name} · {area.type}</option>)}</select></label>{error && <div className="form-error span-2">{error}</div>}<div className="form-actions span-2"><button type="button" className="button" onClick={() => setOpen(false)}>{t('cancel')}</button><button className="button button--primary">{t('create')}</button></div></form></Modal>

    <Modal title={t('generatedCredentials')} open={Boolean(created)} onClose={() => setCreated(null)}>{created && <div className="credentials-card"><span className="credentials-success"><Check size={28} /></span><h3>{t('accountCreated')}</h3><p>{t('credentialsWarning')}</p><dl><div><dt>{t('fullName')}</dt><dd>{created.user.fullName}</dd></div><div><dt>{t('email')}</dt><dd>{created.generatedEmail}</dd></div><div><dt>{t('password')}</dt><dd><code>{created.temporaryPassword}</code></dd></div><div><dt>WhatsApp</dt><dd>{created.notificationStatus}</dd></div></dl><div className="form-actions"><button className="button" onClick={() => void copyCredentials()}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copié' : 'Copier'}</button><a className="button button--primary" href={created.whatsAppPreviewUrl} target="_blank" rel="noreferrer">{t('sendWhatsApp')}<ExternalLink size={17} /></a></div></div>}</Modal>
  </>
}
