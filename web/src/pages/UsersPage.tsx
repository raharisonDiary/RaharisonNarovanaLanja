import {
  Check,
  Mail,
  MessageCircle,
  Plus,
  Power,
  Search,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react'
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
import type {
  AdministrativeAreaDto,
  ProvisionedUserResponse,
  UserDto,
} from '../types/api'
import { formatDateTime } from '../utils/format'
import { getRoleLabel } from '../utils/roles'

const descendantsOf = (
  areas: AdministrativeAreaDto[],
  rootId?: string | null,
) => {
  if (!rootId) return areas

  const allowed = new Set<string>([rootId])
  let changed = true

  while (changed) {
    changed = false

    for (const area of areas) {
      if (
        area.parentId &&
        allowed.has(area.parentId) &&
        !allowed.has(area.id)
      ) {
        allowed.add(area.id)
        changed = true
      }
    }
  }

  return areas.filter((area) => allowed.has(area.id))
}

const deliveryLabel = (status: string) => {
  if (status === 'Sent') return 'Envoyé'
  if (status === 'NotConfigured') return 'Non configuré'
  return 'Échec de l’envoi'
}

export default function UsersPage() {
  const { user } = useAuth()
  const { t, language } = useI18n()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] =
    useState<ProvisionedUserResponse | null>(null)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const [userView, setUserView] =
    useState<'current' | 'deleted'>('current')

  const users = useAsync(
    () => managedUsersApi.list(),
    [],
  )

  const territories = useAsync(
    () => territoriesApi.list(),
    [],
  )

  const targetRole =
    user?.role === 'RegionalSupervisor'
      ? 'Enumerator'
      : 'RegionalSupervisor'

  const possibleAreas = useMemo(() => {
    const all = descendantsOf(
      territories.data ?? [],
      user?.role === 'RegionalSupervisor'
        ? user.administrativeAreaId
        : null,
    )

    return targetRole === 'RegionalSupervisor'
      ? all.filter((area) => area.type === 'Region')
      : all.filter((area) =>
          [
            'Commune',
            'Fokontany',
            'EnumerationArea',
          ].includes(area.type),
        )
  }, [
    targetRole,
    territories.data,
    user?.administrativeAreaId,
    user?.role,
  ])

  const currentUsers = useMemo(
    () =>
      (users.data ?? []).filter(
        (item) =>
          !item.email
            .toLowerCase()
            .endsWith("@deleted.local"),
      ),
    [users.data],
  )

  const deletedUsers = useMemo(
    () =>
      (users.data ?? []).filter((item) =>
        item.email
          .toLowerCase()
          .endsWith("@deleted.local"),
      ),
    [users.data],
  )

  const filtered = useMemo(() => {
    const source =
      userView === "deleted"
        ? deletedUsers
        : currentUsers

    const query = search.trim().toLowerCase()

    if (!query) return source

    return source.filter((item) =>
      `${item.fullName} ${item.email} ${
        item.phoneNumber ?? ""
      }`
        .toLowerCase()
        .includes(query),
    )
  }, [search, userView, currentUsers, deletedUsers])

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setError('')

    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    )

    try {
      const result = await managedUsersApi.create({
        firstName: String(values.firstName),
        lastName: String(values.lastName),
        email: String(values.email),
        whatsAppNumber: String(
          values.whatsAppNumber,
        ),
        role: targetRole,
        administrativeAreaId: String(
          values.administrativeAreaId,
        ),
      })

      setOpen(false)
      setCreated(result)

      await users.reload()
    } catch (exception) {
      setError(getErrorMessage(exception))
    }
  }

  const changeStatus = async (row: UserDto) => {
    try {
      await usersApi.setStatus(
        row.id,
        !row.isActive,
      )

      await users.reload()
    } catch (exception) {
      window.alert(getErrorMessage(exception))
    }
  }

  const deleteUser = async (row: UserDto) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le compte de ${row.fullName} ?\n\n` +
        `Cette personne ne pourra plus se connecter et son adresse e-mail pourra être réutilisée pour créer un nouveau compte.`,
    )

    if (!confirmed) return

    try {
      setDeletingId(row.id)

      await managedUsersApi.remove(row.id)

      await users.reload()
    } catch (exception) {
      window.alert(getErrorMessage(exception))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title={t('users')}
        subtitle={t('usersSubtitle')}
        actions={
          <button
            className="button button--primary"
            onClick={() => {
              setError('')
              setOpen(true)
            }}
          >
            <UserPlus size={17} />
            {targetRole === 'RegionalSupervisor'
              ? t('createRegionalChief')
              : t('createAgent')}
          </button>
        }
      />

      <section className="role-flow card">
        <div>
          <span>1</span>
          <strong>Administrateur</strong>
          <small>crée les chefs de région</small>
        </div>

        <i />

        <div>
          <span>2</span>
          <strong>Chef de région</strong>
          <small>
            crée et supervise les agents
          </small>
        </div>

        <i />

        <div>
          <span>3</span>
          <strong>Agent</strong>
          <small>
            collecte et synchronise le terrain
          </small>
        </div>
      </section>

      <section className="card">
        <div
          className="segmented-control"
          style={{ marginBottom: 16 }}
        >
          <button
            type="button"
            className={
              userView === "current"
                ? "active"
                : ""
            }
            onClick={() => {
              setUserView("current")
              setSearch("")
            }}
          >
            Utilisateurs actuels
            <span>{currentUsers.length}</span>
          </button>

          <button
            type="button"
            className={
              userView === "deleted"
                ? "active"
                : ""
            }
            onClick={() => {
              setUserView("deleted")
              setSearch("")
            }}
          >
            Utilisateurs supprimés
            <span>{deletedUsers.length}</span>
          </button>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={t('search')}
            />
          </label>

          <span className="toolbar-count">
            <UsersRound size={16} />
            {filtered.length}
          </span>
        </div>

        {users.loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState text={t('noUsers')} />
        ) : (
          <DataTable<UserDto>
            rows={filtered}
            keyOf={(row) => row.id}
            columns={[
              {
                key: 'name',
                title: t('users'),
                render: (row) => (
                  <div className="primary-cell">
                    <span className="avatar">
                      {row.firstName[0]}
                      {row.lastName[0]}
                    </span>

                    <div>
                      <strong>
                        {row.fullName}
                      </strong>

                      <small>
                        {row.email}
                      </small>

                      <small>
                        {row.phoneNumber}
                      </small>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                title: t('role'),
                render: (row) =>
                  getRoleLabel(
                    row.role,
                    language,
                  ),
              },
              {
                key: 'status',
                title: t('status'),
                render: (row) => (
                  <StatusBadge
                    value={
                      row.isActive
                        ? t('active')
                        : t('inactive')
                    }
                  />
                ),
              },
              {
                key: 'login',
                title: t('lastLogin'),
                render: (row) =>
                  formatDateTime(
                    row.lastLoginAtUtc,
                  ),
              },
              {
                key: 'actions',
                title: t('actions'),
                render: (row) =>
                  userView === "deleted" ? (
                    <span
                      style={{
                        fontSize: 13,
                        opacity: 0.7,
                      }}
                    >
                      Archivé
                    </span>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        className="icon-button"
                        title={
                          row.isActive
                            ? "Désactiver"
                            : "Activer"
                        }
                        onClick={() =>
                          void changeStatus(row)
                        }
                      >
                        <Power size={17} />
                      </button>

                      <button
                        className="icon-button"
                        title="Supprimer"
                        disabled={
                          deletingId === row.id
                        }
                        onClick={() =>
                          void deleteUser(row)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        title={t('newAccount')}
        open={open}
        onClose={() => {
          setOpen(false)
          setError('')
        }}
      >
        <form
          className="form-grid account-form"
          onSubmit={submit}
        >
          <div className="form-intro span-2">
            <span>
              <Plus size={20} />
            </span>

            <div>
              <strong>
                {targetRole ===
                'RegionalSupervisor'
                  ? t(
                      'createRegionalChief',
                    )
                  : t('createAgent')}
              </strong>

              <p>
                Un seul clic crée le compte et
                envoie automatiquement
                l’identifiant et le mot de passe
                temporaire par e-mail et par
                WhatsApp.
              </p>
            </div>
          </div>

          <label>
            {t('firstName')}
            <input
              name="firstName"
              required
              autoFocus
            />
          </label>

          <label>
            {t('lastName')}
            <input
              name="lastName"
              required
            />
          </label>

          <label className="span-2">
            Adresse e-mail réelle
            <input
              name="email"
              type="email"
              placeholder="agent@exemple.com"
              required
            />
          </label>

          <label className="span-2">
            {t('whatsapp')}
            <input
              name="whatsAppNumber"
              inputMode="tel"
              placeholder="261 34 00 000 00"
              minLength={8}
              required
            />
          </label>

          <label className="span-2">
            {t('assignment')}

            <select
              name="administrativeAreaId"
              required
            >
              <option value="">
                — {t('assignment')} —
              </option>

              {possibleAreas.map((area) => (
                <option
                  key={area.id}
                  value={area.id}
                >
                  {area.name} · {area.type}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="form-error span-2">
              {error}
            </div>
          )}

          <div className="form-actions span-2">
            <button
              type="button"
              className="button"
              onClick={() => {
                setOpen(false)
                setError('')
              }}
            >
              {t('cancel')}
            </button>

            <button className="button button--primary">
              <Mail size={17} />
              Créer et envoyer les identifiants
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Envoi des identifiants"
        open={Boolean(created)}
        onClose={() => setCreated(null)}
      >
        {created && (
          <div className="credentials-card">
            <span
              className={`credentials-success ${
                created.allNotificationsSent
                  ? ''
                  : 'credentials-success--warning'
              }`}
            >
              <Check size={28} />
            </span>

            <h3>
              {t('accountCreated')}
            </h3>

            <p>
              {created.allNotificationsSent
                ? 'Le compte a été créé et les identifiants ont été envoyés automatiquement sur les deux canaux.'
                : 'Le compte a été créé, mais au moins un canal n’a pas confirmé l’envoi. Vérifiez la configuration SMTP et WhatsApp.'}
            </p>

            <dl>
              <div>
                <dt>
                  {t('fullName')}
                </dt>
                <dd>
                  {created.user.fullName}
                </dd>
              </div>

              <div>
                <dt>Identifiant</dt>
                <dd>
                  {created.generatedEmail}
                </dd>
              </div>

              <div>
                <dt>
                  <Mail size={15} />
                  E-mail
                </dt>
                <dd>
                  {deliveryLabel(
                    created.emailNotificationStatus,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  <MessageCircle
                    size={15}
                  />
                  WhatsApp
                </dt>
                <dd>
                  {deliveryLabel(
                    created.whatsAppNotificationStatus,
                  )}
                </dd>
              </div>

              {created.temporaryPasswordFallback && (
                <div>
                  <dt>
                    Mot de passe de secours
                  </dt>
                  <dd>
                    <code>
                      {
                        created.temporaryPasswordFallback
                      }
                    </code>
                  </dd>
                </div>
              )}
            </dl>

            <div className="form-actions">
              <button
                className="button button--primary"
                onClick={() =>
                  setCreated(null)
                }
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
