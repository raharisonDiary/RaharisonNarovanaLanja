import type { UserRole } from '../types/api'

export const canManageCampaigns = (role?: UserRole) => role !== 'Enumerator'
export const canValidate = (role?: UserRole) => role === 'SystemAdministrator' || role === 'NationalCoordinator' || role === 'RegionalSupervisor'
export const canProvisionUsers = (role?: UserRole) => role === 'SystemAdministrator' || role === 'RegionalSupervisor'
export const canSeeAudit = (role?: UserRole) => role === 'SystemAdministrator' || role === 'NationalCoordinator'
export const canCreateTerritories = (role?: UserRole) => role === 'SystemAdministrator' || role === 'NationalCoordinator'
