import type { AdministrativeAreaDto, CampaignDto, CensusBundle, DashboardDto, DwellingDto, HouseholdDto, SessionResponse } from '../types/api'
import { api } from './client'

export const mobileApi = {
  login: async (email: string, password: string) => (await api.post<SessionResponse>('/sessions/login', { email, password, deviceName: 'Application mobile' })).data,
  logout: async (refreshToken: string) => api.post('/sessions/logout', { refreshToken }),
  campaigns: async () => (await api.get<CampaignDto[]>('/campaigns')).data,
  zones: async () => (await api.get<AdministrativeAreaDto[]>('/administrative-areas', { params: { type: 'EnumerationArea' } })).data,
  dashboard: async (campaignId: string) => (await api.get<DashboardDto>(`/dashboard/campaigns/${campaignId}`)).data,
  households: async (campaignId?: string) => (await api.get<HouseholdDto[]>('/households', { params: { campaignId } })).data,
  dwellings: async (campaignId?: string) => (await api.get<DwellingDto[]>('/dwellings', { params: { campaignId } })).data,
  async createBundle(bundle: CensusBundle) {
    const dwelling = (await api.post<DwellingDto>('/dwellings', {
      campaignId: bundle.campaignId, enumerationAreaId: bundle.enumerationAreaId,
      referenceCode: bundle.dwelling.referenceCode, address: bundle.dwelling.address,
      localityName: bundle.dwelling.localityName, latitude: bundle.dwelling.latitude, longitude: bundle.dwelling.longitude,
    })).data
    const household = (await api.post<HouseholdDto>('/households', { ...bundle.household, dwellingId: dwelling.id })).data
    await api.post('/persons', { ...bundle.person, householdId: household.id })
    return household
  },
}
