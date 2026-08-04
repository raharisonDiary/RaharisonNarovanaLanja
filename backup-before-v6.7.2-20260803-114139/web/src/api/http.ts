import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ProblemDetails, SessionResponse } from '../types/api'
import { tokenStore } from './tokenStore'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'https://localhost:7001/api/v1'

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string> | null = null

http.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const refreshToken = tokenStore.getRefreshToken()
    const isSessionEndpoint = original?.url?.includes('/sessions/')

    if (error.response?.status !== 401 || !original || original._retried || !refreshToken || isSessionEndpoint) {
      return Promise.reject(error)
    }

    original._retried = true

    refreshPromise ??= axios
      .post<SessionResponse>(`${apiBaseUrl}/sessions/refresh`, {
        refreshToken,
        deviceName: 'Application web',
      })
      .then(({ data }) => {
        tokenStore.save(data.accessToken, data.refreshToken, data.user)
        return data.accessToken
      })
      .catch((refreshError) => {
        tokenStore.clear()
        window.location.assign('/login')
        throw refreshError
      })
      .finally(() => {
        refreshPromise = null
      })

    const accessToken = await refreshPromise
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
    return error.response?.data?.detail ?? error.response?.data?.title ?? error.message
  }
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'
}
