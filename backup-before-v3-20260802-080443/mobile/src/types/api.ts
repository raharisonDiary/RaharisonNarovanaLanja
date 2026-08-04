export type UserRole = 'SystemAdministrator' | 'NationalCoordinator' | 'RegionalSupervisor' | 'Enumerator' | 'Analyst'
export type RecordStatus = 'Draft' | 'Submitted' | 'Validated' | 'Rejected'

export interface UserDto {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber?: string | null
  role: UserRole
  administrativeAreaId?: string | null
  isActive: boolean
}

export interface SessionResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAtUtc: string
  refreshTokenExpiresAtUtc: string
  user: UserDto
}

export interface CampaignDto { id: string; code: string; name: string; status: string; scopeAdministrativeAreaId: string }
export interface AdministrativeAreaDto { id: string; code: string; name: string; type: string; parentId?: string | null }
export interface DashboardDto { campaignId: string; campaignName: string; campaignStatus: string; totalDwellings: number; totalHouseholds: number; totalPersons: number; validatedHouseholds: number; submittedHouseholds: number; femalePersons: number; malePersons: number }
export interface HouseholdDto { id: string; campaignId: string; dwellingId: string; referenceCode: string; householdType: string; headFullName?: string | null; phoneNumber?: string | null; recordStatus: RecordStatus }
export interface DwellingDto { id: string; campaignId: string; enumerationAreaId: string; referenceCode: string; localityName?: string | null; address?: string | null; latitude: number; longitude: number; recordStatus: RecordStatus }

export interface CensusBundle {
  localId: string
  campaignId: string
  enumerationAreaId: string
  dwelling: { referenceCode: string; address: string; localityName: string; latitude: number; longitude: number; photoUri?: string | null }
  household: { referenceCode: string; householdType: string; headFullName: string; phoneNumber: string }
  person: { personNumber: number; firstName: string; lastName: string; sex: string; dateOfBirth?: string | null; ageYears?: number | null; relationshipToHead: string; maritalStatus: string; nationality?: string; occupation?: string }
}
