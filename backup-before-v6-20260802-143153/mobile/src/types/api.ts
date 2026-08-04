export type UserRole = 'SystemAdministrator' | 'NationalCoordinator' | 'RegionalSupervisor' | 'Enumerator' | 'Analyst'
export type RecordStatus = 'Draft' | 'Submitted' | 'Validated' | 'Rejected'
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'NotStated'
export type PersonSex = 'Female' | 'Male' | 'Other' | 'NotStated'
export type BirthDatePrecision = 'Exact' | 'YearOnly' | 'DeclaredAge' | 'Unknown'
export type RelationshipToHead = 'Head' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'OtherRelative' | 'NonRelative'

export interface UserDto { id: string; firstName: string; lastName: string; fullName: string; email: string; phoneNumber?: string | null; role: UserRole; administrativeAreaId?: string | null; isActive: boolean }
export interface SessionResponse { accessToken: string; refreshToken: string; accessTokenExpiresAtUtc: string; refreshTokenExpiresAtUtc: string; user: UserDto }
export interface CampaignDto { id: string; code: string; name: string; description?: string | null; startDate?: string; endDate?: string; status: string; scopeAdministrativeAreaId: string }
export interface AdministrativeAreaDto { id: string; code: string; name: string; type: string; parentId?: string | null }


export interface PublicOverviewDto {
  completedCampaigns: number
  validatedHouseholds: number
  validatedCitizens: number
  campaigns: { id: string; name: string; startDate: string; endDate: string; status: string }[]
}

export interface AnalyticsDto {
  campaignId: string; campaignName: string; areaId: string; areaName: string; areaType: string
  totalDwellings: number; totalHouseholds: number; totalCitizens: number
  femaleCitizens: number; maleCitizens: number; children: number; youth: number
  adults: number; seniors: number; students: number
  topAreas: { areaId: string; areaName: string; areaType: string; citizens: number }[]
}

export interface DashboardDto { campaignId: string; campaignName: string; campaignStatus: string; totalDwellings: number; totalHouseholds: number; totalPersons: number; validatedHouseholds: number; submittedHouseholds: number; femalePersons: number; malePersons: number }
export interface HouseholdDto { id: string; campaignId: string; dwellingId: string; referenceCode: string; householdType: string; headFullName?: string | null; phoneNumber?: string | null; recordStatus: RecordStatus }
export interface DwellingDto { id: string; campaignId: string; enumerationAreaId: string; referenceCode: string; localityName?: string | null; address?: string | null; latitude: number; longitude: number; recordStatus: RecordStatus }

export interface LocationDraft {
  countryId: string; countryName: string
  regionId: string; regionName: string
  districtId: string; districtName: string
  communeId: string; communeName: string
  fokontanyId: string; fokontanyName: string
  latitude: number; longitude: number; accuracy?: number | null
}

export interface CitizenDraft {
  localId: string
  photoUri?: string | null
  photoDataUrl?: string | null
  firstName: string
  lastName: string
  sex: PersonSex
  birthDateMode: 'exact' | 'year' | 'age' | 'unknown'
  dateOfBirth?: string | null
  birthYear?: number | null
  ageYears?: number | null
  birthPlace: string
  relationshipToHead: RelationshipToHead
  nationalId?: string
  nationalIdIssueDate?: string
  nationalIdIssuePlace?: string
  hasNoNationalId?: boolean
  maritalStatus: MaritalStatus
  childrenCount?: number | null
  occupation?: string
  nationality?: string
  phoneNumber?: string
}

export interface CensusBundle {
  localId: string
  campaignId: string
  campaignName: string
  enumerationAreaId: string
  location: LocationDraft
  dwelling: { referenceCode: string; address: string; localityName: string; latitude: number; longitude: number; photoUri?: string | null }
  household: { referenceCode: string; householdType: string; headFullName: string; phoneNumber: string }
  persons: CitizenDraft[]
  createdAt: string
  updatedAt: string
}
