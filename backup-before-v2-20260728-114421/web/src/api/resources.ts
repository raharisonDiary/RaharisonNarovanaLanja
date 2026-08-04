import type {
  AdministrativeAreaDto,
  AuditLogDto,
  CampaignDto,
  DashboardDto,
  DwellingDto,
  HouseholdDto,
  PagedResult,
  PersonDto,
  SessionResponse,
  UserDto,
} from '../types/api'
import { http } from './http'

export const sessionApi = {
  login: async (email: string, password: string) =>
    (await http.post<SessionResponse>('/sessions/login', { email, password, deviceName: 'Application web' })).data,
  logout: async (refreshToken: string) => http.post('/sessions/logout', { refreshToken }),
  logoutAll: async () => http.post('/sessions/logout-all'),
}

export const usersApi = {
  list: async (search = '') => (await http.get<UserDto[]>('/users', { params: { search: search || undefined } })).data,
  create: async (payload: unknown) => (await http.post<UserDto>('/users', payload)).data,
  setStatus: async (id: string, isActive: boolean) => (await http.patch<UserDto>(`/users/${id}/status`, { isActive })).data,
}

export const territoriesApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<AdministrativeAreaDto[]>('/administrative-areas', { params })).data,
  create: async (payload: unknown) => (await http.post<AdministrativeAreaDto>('/administrative-areas', payload)).data,
}

export const campaignsApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<CampaignDto[]>('/campaigns', { params })).data,
  create: async (payload: unknown) => (await http.post<CampaignDto>('/campaigns', payload)).data,
  changeStatus: async (id: string, status: string) => (await http.patch<CampaignDto>(`/campaigns/${id}/status`, { status })).data,
}

export const dwellingsApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<DwellingDto[]>('/dwellings', { params })).data,
  create: async (payload: unknown) => (await http.post<DwellingDto>('/dwellings', payload)).data,
  submit: async (id: string) => (await http.patch<DwellingDto>(`/dwellings/${id}/submit`)).data,
  validate: async (id: string) => (await http.patch<DwellingDto>(`/dwellings/${id}/validate`)).data,
}

export const householdsApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<HouseholdDto[]>('/households', { params })).data,
  create: async (payload: unknown) => (await http.post<HouseholdDto>('/households', payload)).data,
  submit: async (id: string) => (await http.patch<HouseholdDto>(`/households/${id}/submit`)).data,
  validate: async (id: string) => (await http.patch<HouseholdDto>(`/households/${id}/validate`)).data,
}

export const personsApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<PersonDto[]>('/persons', { params })).data,
  get: async (id: string) => (await http.get<PersonDto>(`/persons/${id}`)).data,
  create: async (payload: unknown) => (await http.post<PersonDto>('/persons', payload)).data,
  submit: async (id: string) => (await http.patch<PersonDto>(`/persons/${id}/submit`)).data,
  validate: async (id: string) => (await http.patch<PersonDto>(`/persons/${id}/validate`)).data,
}

export const dashboardApi = {
  get: async (campaignId: string) => (await http.get<DashboardDto>(`/dashboard/campaigns/${campaignId}`)).data,
}

export const auditApi = {
  list: async (params?: Record<string, unknown>) => (await http.get<PagedResult<AuditLogDto>>('/audit-logs', { params })).data,
}

export const reportUrl = (campaignId: string, resource: 'dwellings' | 'households' | 'persons') =>
  `${http.defaults.baseURL}/reports/campaigns/${campaignId}/${resource}.csv`
