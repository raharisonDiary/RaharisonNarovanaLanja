import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { Platform } from 'react-native'
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

type RuntimeState = typeof globalThis & {
  __censusMobileRefreshPromise?: Promise<string> | null
  __censusMobileExpirePromise?: Promise<void> | null
}

const runtime = globalThis as RuntimeState

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
  if (runtime.__censusMobileExpirePromise) {
    return runtime.__censusMobileExpirePromise
  }

  const task = (async () => {
    await sessionStore.clear()
    notifySessionExpired()

    if (Platform.OS === 'web') {
      const browser = globalThis as typeof globalThis & {
        location?: {
          pathname: string
          replace(url: string): void
        }
      }

      if (
        browser.location &&
        browser.location.pathname !== '/login'
      ) {
        browser.location.replace('/login')
      }
    }
  })()

  const guarded = task.finally(() => {
    if (runtime.__censusMobileExpirePromise === guarded) {
      runtime.__censusMobileExpirePromise = null
    }
  })

  runtime.__censusMobileExpirePromise = guarded
  return guarded
}

async function refreshAccessToken(): Promise<string> {
  const activeRefresh = runtime.__censusMobileRefreshPromise
  if (activeRefresh) return activeRefresh

  /*
   * Important : la promesse est creee et publiee immediatement.
   * L'ancienne version attendait d'abord SecureStore/localStorage.
   * Deux requetes simultanees pouvaient donc utiliser le meme
   * refresh token, alors que ce jeton est rotatif et a usage unique.
   */
  const task = (async () => {
    const refreshToken = await sessionStore.getRefreshToken()
    const refreshExpiresAtUtc =
      await sessionStore.getRefreshTokenExpiresAtUtc()

    if (!refreshToken || expiresSoon(refreshExpiresAtUtc)) {
      throw new Error(
        'Votre session a expire. Veuillez vous reconnecter.',
      )
    }

    const { data } = await axios.post<SessionResponse>(
      `${baseURL}/sessions/refresh`,
      {
        refreshToken,
        deviceName:
          Platform.OS === 'web'
            ? 'Expo Web'
            : 'Application mobile',
      },
      { timeout: 15000 },
    )

    await sessionStore.save(data)
    return data.accessToken
  })()

  const guarded = task
    .catch(async (error: unknown) => {
      await expireLocalSession()
      throw error
    })
    .finally(() => {
      if (runtime.__censusMobileRefreshPromise === guarded) {
        runtime.__censusMobileRefreshPromise = null
      }
    })

  runtime.__censusMobileRefreshPromise = guarded
  return guarded
}

api.interceptors.request.use(async (config) => {
  if (isSessionEndpoint(config.url)) return config

  const activeRefresh = runtime.__censusMobileRefreshPromise
  if (activeRefresh) {
    const refreshedToken = await activeRefresh
    config.headers.Authorization = `Bearer ${refreshedToken}`
    return config
  }

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

    const accessToken = await refreshAccessToken()
    original.headers.Authorization = `Bearer ${accessToken}`
    return api(original)
  },
)

export const messageFromError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Le serveur met trop de temps a repondre. Reessayez apres quelques secondes.'
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
