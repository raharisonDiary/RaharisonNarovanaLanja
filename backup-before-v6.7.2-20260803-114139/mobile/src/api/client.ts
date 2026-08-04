import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { notifySessionExpired } from '../auth/sessionEvents'
import { sessionStore } from '../storage/sessionStore'
import type { SessionResponse } from '../types/api'

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://localhost:7001/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string> | null = null

function isSessionEndpoint(url?: string): boolean {
  return Boolean(url?.includes('/sessions/'))
}

function expiresSoon(expiresAtUtc: string | null): boolean {
  if (!expiresAtUtc) return false

  const expiresAt = Date.parse(expiresAtUtc)
  if (Number.isNaN(expiresAt)) return false

  return expiresAt <= Date.now() + 30_000
}

async function expireLocalSession(): Promise<void> {
  await sessionStore.clear()
  notifySessionExpired()
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  const refreshToken = await sessionStore.getRefreshToken()
  const refreshExpiresAtUtc =
    await sessionStore.getRefreshTokenExpiresAtUtc()

  if (!refreshToken || expiresSoon(refreshExpiresAtUtc)) {
    await expireLocalSession()
    throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
  }

  refreshPromise = axios
    .post<SessionResponse>(
      `${baseURL}/sessions/refresh`,
      {
        refreshToken,
        deviceName: 'Application mobile',
      },
      { timeout: 15000 },
    )
    .then(async ({ data }) => {
      await sessionStore.save(data)
      return data.accessToken
    })
    .catch(async (error: unknown) => {
      await expireLocalSession()
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.request.use(async (config) => {
  if (isSessionEndpoint(config.url)) return config

  let token = await sessionStore.getAccessToken()
  const expiresAtUtc =
    await sessionStore.getAccessTokenExpiresAtUtc()

  if (token && expiresSoon(expiresAtUtc)) {
    token = await refreshAccessToken()
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      isSessionEndpoint(original.url)
    ) {
      throw error
    }

    original._retried = true

    try {
      const accessToken = await refreshAccessToken()
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch {
      throw error
    }
  },
)

export const messageFromError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Le serveur met trop de temps à répondre. Réessayez après quelques secondes.'
    }

    return (
      (error.response?.data as { detail?: string } | undefined)
        ?.detail ??
      (error.response?.data as { title?: string } | undefined)
        ?.title ??
      error.message
    )
  }

  return error instanceof Error
    ? error.message
    : 'Une erreur est survenue.'
}
