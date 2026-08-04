import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { sessionStore } from '../storage/sessionStore'
import type { SessionResponse } from '../types/api'

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'https://localhost:7001/api/v1'
export const api = axios.create({ baseURL, timeout: 30000, headers: { 'Content-Type': 'application/json' } })
let refreshPromise: Promise<string> | null = null

api.interceptors.request.use(async (config) => {
  const token = await sessionStore.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  if (error.response?.status !== 401 || !original || original._retried || original.url?.includes('/sessions/')) throw error
  const refreshToken = await sessionStore.getRefreshToken()
  if (!refreshToken) throw error
  original._retried = true
  refreshPromise ??= axios.post<SessionResponse>(`${baseURL}/sessions/refresh`, { refreshToken, deviceName: 'Application mobile' })
    .then(async ({ data }) => { await sessionStore.save(data); return data.accessToken })
    .finally(() => { refreshPromise = null })
  original.headers.Authorization = `Bearer ${await refreshPromise}`
  return api(original)
})

export const messageFromError = (error: unknown) => axios.isAxiosError(error)
  ? ((error.response?.data as { detail?: string; title?: string } | undefined)?.detail ?? (error.response?.data as { title?: string } | undefined)?.title ?? error.message)
  : error instanceof Error ? error.message : 'Une erreur est survenue.'
