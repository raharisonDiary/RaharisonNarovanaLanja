export type UserRole =
  | 'SystemAdministrator'
  | 'NationalCoordinator'
  | 'RegionalSupervisor'
  | 'Enumerator'
  | 'Analyst'

export type RecordStatus = 'Draft' | 'Submitted' | 'Validated' | 'Rejected'
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Active' | 'Suspended' | 'Closed' | 'Archived'
export type AdministrativeAreaType = 'Country' | 'Region' | 'District' | 'Commune' | 'Fokontany' | 'EnumerationArea'
export type PersonSex = 'Female' | 'Male' | 'Other' | 'NotStated'
export type HouseholdType = 'Ordinary' | 'Collective' | 'Homeless'
export type RelationshipToHead = 'Head' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'OtherRelative' | 'NonRelative'
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated' | 'NotStated'

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
  lastLoginAtUtc?: string | null
  createdAtUtc?: string
  updatedAtUtc?: string | null
}

export interface SessionResponse {
  accessToken: string
  tokenType: string
  accessTokenExpiresAtUtc: string
  refreshToken: string
  refreshTokenExpiresAtUtc: string
  user: UserDto
}

export interface AdministrativeAreaDto {
  id: string
  code: string
  name: string
  type: AdministrativeAreaType
  parentId?: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface CampaignDto {
  id: string
  code: string
  name: string
  description?: string | null
  startDate: string
  endDate: string
  status: CampaignStatus
  scopeAdministrativeAreaId: string
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface DwellingDto {
  id: string
  campaignId: string
  enumerationAreaId: string
  referenceCode: string
  address?: string | null
  localityName?: string | null
  latitude: number
  longitude: number
  occupancyStatus: string
  recordStatus: RecordStatus
  notes?: string | null
  createdByUserId: string
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface HouseholdDto {
  id: string
  campaignId: string
  dwellingId: string
  referenceCode: string
  householdType: HouseholdType
  headFullName?: string | null
  phoneNumber?: string | null
  notes?: string | null
  recordStatus: RecordStatus
  createdByUserId: string
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface PersonDto {
  id: string
  campaignId: string
  householdId: string
  personNumber: number
  firstName: string
  lastName: string
  fullName: string
  sex: PersonSex
  dateOfBirth?: string | null
  ageYears?: number | null
  relationshipToHead: RelationshipToHead
  maritalStatus: MaritalStatus
  nationality?: string | null
  occupation?: string | null
  phoneNumber?: string | null
  nationalId?: string | null
  notes?: string | null
  recordStatus: RecordStatus
  createdByUserId: string
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface DashboardDto {
  campaignId: string
  campaignCode: string
  campaignName: string
  campaignStatus: string
  totalDwellings: number
  draftDwellings: number
  submittedDwellings: number
  validatedDwellings: number
  rejectedDwellings: number
  totalHouseholds: number
  draftHouseholds: number
  submittedHouseholds: number
  validatedHouseholds: number
  rejectedHouseholds: number
  totalPersons: number
  draftPersons: number
  submittedPersons: number
  validatedPersons: number
  rejectedPersons: number
  femalePersons: number
  malePersons: number
}

export interface AuditLogDto {
  id: string
  occurredAtUtc: string
  actorUserId?: string | null
  actorEmail?: string | null
  actorRole?: string | null
  httpMethod: string
  requestPath: string
  actionName: string
  entityType?: string | null
  entityId?: string | null
  statusCode: number
  wasSuccessful: boolean
  ipAddress?: string | null
  traceId: string
  failureType?: string | null
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface PasswordRecoveryRequestResponse {
  message: string
  expiresAtUtc?: string | null
  developmentOtp?: string | null
}

export interface PasswordRecoveryVerificationResponse {
  resetToken: string
  expiresAtUtc: string
}
