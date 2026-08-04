import type { AdministrativeAreaDto, AnalyticsDto, CampaignDto, CensusBundle, DashboardDto, DwellingDto, HouseholdDto, PublicOverviewDto, SessionResponse } from '../types/api'
import { api } from './client'

export const mobileApi = {
  login: async (email: string, password: string) => (await api.post<SessionResponse>('/sessions/login', { email, password, deviceName: 'Application mobile' })).data,
  logout: async (refreshToken: string) => api.post('/sessions/logout', { refreshToken }),
  requestPasswordCode: async (email: string) => (await api.post<{ message: string; expiresAtUtc?: string | null; developmentOtp?: string | null }>('/password-recovery/request', { email })).data,
  verifyPasswordCode: async (email: string, code: string) => (await api.post<{ resetToken: string; expiresAtUtc: string }>('/password-recovery/verify', { email, code })).data,
  resetPassword: async (email: string, resetToken: string, newPassword: string, confirmPassword: string) => api.post('/password-recovery/reset', { email, resetToken, newPassword, confirmPassword }),
  publicOverview: async () => (await api.get<PublicOverviewDto>('/public/overview')).data,
  campaigns: async () => (await api.get<CampaignDto[]>('/campaigns')).data,
  areas: async () => (await api.get<AdministrativeAreaDto[]>('/administrative-areas')).data,
  zones: async () => (await api.get<AdministrativeAreaDto[]>('/administrative-areas')).data,
  dashboard: async (campaignId: string) => (await api.get<DashboardDto>(`/dashboard/campaigns/${campaignId}`)).data,
  analytics: async (campaignId: string, areaId?: string) => (await api.get<AnalyticsDto>(`/analytics/campaigns/${campaignId}`, { params: { areaId } })).data,
  households: async (campaignId?: string) => (await api.get<HouseholdDto[]>('/households', { params: { campaignId } })).data,
  dwellings: async (campaignId?: string) => (await api.get<DwellingDto[]>('/dwellings', { params: { campaignId } })).data,
  profile: async () => (await api.get('/profile')).data,
  updateProfile: async (payload: unknown) => (await api.put('/profile', payload)).data,
  async createBundle(bundle: CensusBundle) {
    const dwelling = (await api.post<DwellingDto>('/dwellings', {
      campaignId: bundle.campaignId, enumerationAreaId: bundle.enumerationAreaId, referenceCode: bundle.dwelling.referenceCode,
      address: bundle.dwelling.address, localityName: bundle.dwelling.localityName, latitude: bundle.dwelling.latitude, longitude: bundle.dwelling.longitude,
      notes: JSON.stringify({ location: bundle.location, photoCaptured: Boolean(bundle.dwelling.photoUri), source: 'mobile-offline' }),
    })).data
    const household = (await api.post<HouseholdDto>('/households', {
      ...bundle.household, dwellingId: dwelling.id,
      notes: JSON.stringify({ localId: bundle.localId, campaignName: bundle.campaignName, citizenCount: bundle.persons.length }),
    })).data
    for (let index = 0; index < bundle.persons.length; index += 1) {
      const person = bundle.persons[index]
      const dateOfBirth = person.birthDateMode === 'exact' ? person.dateOfBirth : person.birthDateMode === 'year' && person.birthYear ? `${person.birthYear}-01-01` : null
      await api.post('/persons', {
        householdId: household.id, personNumber: index + 1, firstName: person.firstName, lastName: person.lastName,
        sex: person.sex, dateOfBirth, ageYears: person.ageYears ?? null, relationshipToHead: person.relationshipToHead,
        maritalStatus: person.maritalStatus, nationality: person.nationality || 'Malagasy', occupation: person.occupation || null,
        phoneNumber: person.phoneNumber || null, nationalId: person.hasNoNationalId ? null : person.nationalId || null,
        notes: JSON.stringify({ birthDateMode: person.birthDateMode, birthYear: person.birthYear, birthPlace: person.birthPlace, nationalIdIssueDate: person.nationalIdIssueDate, nationalIdIssuePlace: person.nationalIdIssuePlace, hasNoNationalId: person.hasNoNationalId, childrenCount: person.childrenCount, photoCaptured: Boolean(person.photoUri) }),
      })
    }
    return household
  },
}
