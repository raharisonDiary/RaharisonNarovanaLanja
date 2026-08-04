import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ProblemDetails, SessionResponse } from '../types/api'
import { tokenStore } from './tokenStore'

const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  'https://localhost:7001/api/v1'

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

type RuntimeState = typeof globalThis & {
  __censusWebRefreshPromise?: Promise<string> | null
}

const runtime = globalThis as RuntimeState

function isSessionEndpoint(url?: string): boolean {
  return Boolean(url?.includes('/sessions/'))
}

async function refreshAccessToken(): Promise<string> {
  const activeRefresh = runtime.__censusWebRefreshPromise
  if (activeRefresh) return activeRefresh

  const task = (async () => {
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      throw new Error('Session expiree.')
    }

    const { data } = await axios.post<SessionResponse>(
      `${apiBaseUrl}/sessions/refresh`,
      {
        refreshToken,
        deviceName: 'Application web',
      },
      { timeout: 15000 },
    )

    tokenStore.save(
      data.accessToken,
      data.refreshToken,
      data.user,
    )

    return data.accessToken
  })()

  const guarded = task
    .catch((error: unknown) => {
      tokenStore.clear()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
      throw error
    })
    .finally(() => {
      if (runtime.__censusWebRefreshPromise === guarded) {
        runtime.__censusWebRefreshPromise = null
      }
    })

  runtime.__censusWebRefreshPromise = guarded
  return guarded
}

http.interceptors.request.use(async (config) => {
  if (isSessionEndpoint(config.url)) return config

  const activeRefresh = runtime.__censusWebRefreshPromise
  const accessToken = activeRefresh
    ? await activeRefresh
    : tokenStore.getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
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
    return http(original)
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    const validation = error.response?.data?.errors
    if (validation) {
      return Object.values(validation).flat().join(' ')
    }

    return (
      error.response?.data?.detail ??
      error.response?.data?.title ??
      error.message
    )
  }

  return error instanceof Error
    ? error.message
    : 'Une erreur inattendue est survenue.'
}
