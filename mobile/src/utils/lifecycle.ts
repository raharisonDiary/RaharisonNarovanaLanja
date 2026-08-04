import type { CampaignStatus, RecordStatus } from '../types/api'

const campaignTransitions: Record<CampaignStatus, CampaignStatus[]> = {
  Draft: ['Scheduled', 'Active'],
  Scheduled: ['Draft', 'Active', 'Closed'],
  Active: ['Suspended', 'Closed'],
  Suspended: ['Active', 'Closed'],
  Closed: ['Archived'],
  Archived: [],
}

export const nextCampaignStatuses = (
  status: CampaignStatus,
): CampaignStatus[] => campaignTransitions[status]

export const canEditRecord = (status: RecordStatus) =>
  status === 'Draft' || status === 'Rejected'

export const canSubmitRecord = (status: RecordStatus) =>
  status === 'Draft' || status === 'Rejected'

export const canValidateRecord = (status: RecordStatus) =>
  status === 'Submitted'

export const canDeleteRecord = (status: RecordStatus) =>
  status === 'Draft' || status === 'Rejected'
