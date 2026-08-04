import type {
  AdministrativeAreaDto,
  AnalyticsDto,
  AuditLogDto,
  CampaignDto,
  CensusBundle,
  DashboardDto,
  DwellingDto,
  HouseholdDto,
  PagedResult,
  PersonDto,
  ProvisionedUserResponse,
  ProvisionUserRequest,
  PublicOverviewDto,
  SessionResponse,
  UserDto,
} from '../types/api'
import { api } from './client'

export const mobileApi = {
  login: async (email: string, password: string) => (await api.post<SessionResponse>('/sessions/login', { email, password, deviceName: 'Application mobile' })).data,
  logout: async (refreshToken: string) => api.post('/sessions/logout', { refreshToken }),
  logoutAll: async () => api.post('/sessions/logout-all'),

  requestPasswordCode: async (email: string, channel: 'Email' | 'WhatsApp') => (await api.post<{ message: string; expiresAtUtc?: string | null; channel: 'Email' | 'WhatsApp' }>('/password-recovery/request', { email, channel })).data,
  verifyPasswordCode: async (email: string, code: string) => (await api.post<{ resetToken: string; expiresAtUtc: string }>('/password-recovery/verify', { email, code })).data,
  resetPassword: async (email: string, resetToken: string, newPassword: string, confirmPassword: string) => api.post('/password-recovery/reset', { email, resetToken, newPassword, confirmPassword }),

  publicOverview: async () => (await api.get<PublicOverviewDto>('/public/overview')).data,
  profile: async () => (await api.get<UserDto>('/profile')).data,
  updateProfile: async (payload: unknown) => (await api.put<UserDto>('/profile', payload)).data,

  campaigns: async () => (await api.get<CampaignDto[]>('/campaigns')).data,
  createCampaign: async (payload: unknown) => (await api.post<CampaignDto>('/campaigns', payload)).data,
  updateCampaign: async (id: string, payload: unknown) => (await api.put<CampaignDto>(`/campaigns/${id}`, payload)).data,
  changeCampaignStatus: async (id: string, status: string) => (await api.patch<CampaignDto>(`/campaigns/${id}/status`, { status })).data,

  areas: async (params?: Record<string, unknown>) => (await api.get<AdministrativeAreaDto[]>('/administrative-areas', { params })).data,
  zones: async () => (await api.get<AdministrativeAreaDto[]>('/administrative-areas')).data,
  createArea: async (payload: unknown) => (await api.post<AdministrativeAreaDto>('/administrative-areas', payload)).data,

  dashboard: async (campaignId: string) => (await api.get<DashboardDto>(`/dashboard/campaigns/${campaignId}`)).data,
  analytics: async (campaignId: string, areaId?: string) => (await api.get<AnalyticsDto>(`/analytics/campaigns/${campaignId}`, { params: { areaId } })).data,

  dwellings: async (campaignId?: string) => (await api.get<DwellingDto[]>('/dwellings', { params: { campaignId } })).data,
  dwelling: async (id: string) => (await api.get<DwellingDto>(`/dwellings/${id}`)).data,
  createDwelling: async (payload: unknown) => (await api.post<DwellingDto>('/dwellings', payload)).data,
  updateDwelling: async (id: string, payload: unknown) => (await api.put<DwellingDto>(`/dwellings/${id}`, payload)).data,
  deleteDwelling: async (id: string) => api.delete(`/dwellings/${id}`),
  submitDwelling: async (id: string) => (await api.patch<DwellingDto>(`/dwellings/${id}/submit`)).data,
  validateDwelling: async (id: string) => (await api.patch<DwellingDto>(`/dwellings/${id}/validate`)).data,

  households: async (campaignId?: string) => (await api.get<HouseholdDto[]>('/households', { params: { campaignId } })).data,
  household: async (id: string) => (await api.get<HouseholdDto>(`/households/${id}`)).data,
  createHousehold: async (payload: unknown) => (await api.post<HouseholdDto>('/households', payload)).data,
  updateHousehold: async (id: string, payload: unknown) => (await api.put<HouseholdDto>(`/households/${id}`, payload)).data,
  deleteHousehold: async (id: string) => api.delete(`/households/${id}`),
  submitHousehold: async (id: string) => (await api.patch<HouseholdDto>(`/households/${id}/submit`)).data,
  validateHousehold: async (id: string) => (await api.patch<HouseholdDto>(`/households/${id}/validate`)).data,

  persons: async (params?: Record<string, unknown>) => (await api.get<PersonDto[]>('/persons', { params })).data,
  person: async (id: string) => (await api.get<PersonDto>(`/persons/${id}`)).data,
  createPerson: async (payload: unknown) => (await api.post<PersonDto>('/persons', payload)).data,
  updatePerson: async (id: string, payload: unknown) => (await api.put<PersonDto>(`/persons/${id}`, payload)).data,
  deletePerson: async (id: string) => api.delete(`/persons/${id}`),
  submitPerson: async (id: string) => (await api.patch<PersonDto>(`/persons/${id}/submit`)).data,
  validatePerson: async (id: string) => (await api.patch<PersonDto>(`/persons/${id}/validate`)).data,

  managedUsers: async (search = '') => (await api.get<UserDto[]>('/managed-users', { params: { search: search || undefined } })).data,
  provisionUser: async (payload: ProvisionUserRequest) => (await api.post<ProvisionedUserResponse>('/managed-users', payload)).data,
  setUserStatus: async (id: string, isActive: boolean) => (await api.patch<UserDto>(`/users/${id}/status`, { isActive })).data,

  auditLogs: async (params?: Record<string, unknown>) => (await api.get<PagedResult<AuditLogDto>>('/audit-logs', { params })).data,
  report: async (campaignId: string, resource: 'dwellings' | 'households' | 'persons') => (await api.get<string>(`/reports/campaigns/${campaignId}/${resource}.csv`, { responseType: 'text' })).data,

  async createBundle(bundle: CensusBundle) {
    const dwelling = (await api.post<DwellingDto>('/dwellings', {
      campaignId: bundle.campaignId,
      enumerationAreaId: bundle.enumerationAreaId,
      referenceCode: bundle.dwelling.referenceCode,
      address: bundle.dwelling.address,
      localityName: bundle.dwelling.localityName,
      latitude: bundle.dwelling.latitude,
      longitude: bundle.dwelling.longitude,
      notes: JSON.stringify({ location: bundle.location, photoCaptured: Boolean(bundle.dwelling.photoUri), source: 'mobile-offline' }),
    })).data
    const household = (await api.post<HouseholdDto>('/households', {
      ...bundle.household,
      dwellingId: dwelling.id,
      notes: JSON.stringify({ localId: bundle.localId, campaignName: bundle.campaignName, citizenCount: bundle.persons.length }),
    })).data
    for (let index = 0; index < bundle.persons.length; index += 1) {
      const person = bundle.persons[index]
      const dateOfBirth = person.birthDateMode === 'exact'
        ? person.dateOfBirth
        : person.birthDateMode === 'year' && person.birthYear
          ? `${person.birthYear}-01-01`
          : null
      const precision = person.birthDateMode === 'exact'
        ? 'Exact'
        : person.birthDateMode === 'year'
          ? 'YearOnly'
          : person.birthDateMode === 'age'
            ? 'DeclaredAge'
            : 'Unknown'
      const fallbackAge = person.birthDateMode === 'unknown' ? (person.ageYears ?? 0) : person.ageYears ?? null
      await api.post('/persons', {
        householdId: household.id,
        personNumber: index + 1,
        firstName: person.firstName,
        lastName: person.lastName,
        sex: person.sex,
        dateOfBirth,
        ageYears: fallbackAge,
        birthDatePrecision: precision,
        birthPlace: person.birthPlace || null,
        relationshipToHead: person.relationshipToHead,
        maritalStatus: person.maritalStatus,
        childrenCount: ['Married', 'Widowed'].includes(person.maritalStatus) ? person.childrenCount ?? 0 : null,
        nationality: person.nationality || 'Malagasy',
        occupation: person.occupation || null,
        phoneNumber: person.phoneNumber || null,
        nationalId: person.hasNoNationalId ? null : person.nationalId || null,
        nationalIdIssueDate: person.hasNoNationalId ? null : person.nationalIdIssueDate || null,
        nationalIdIssuePlace: person.hasNoNationalId ? null : person.nationalIdIssuePlace || null,
        photoDataUrl: person.photoDataUrl || null,
        notes: JSON.stringify({ source: 'mobile-offline', localCitizenId: person.localId }),
      })
    }
    return household
  },
}
