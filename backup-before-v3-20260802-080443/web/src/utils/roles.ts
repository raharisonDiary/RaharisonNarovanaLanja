import type { UserRole } from '../types/api'

export const roleLabels: Record<UserRole, string> = {
  SystemAdministrator: 'Administrateur national',
  NationalCoordinator: 'Coordonnateur national',
  RegionalSupervisor: 'Responsable régional',
  Enumerator: 'Agent recenseur',
  Analyst: 'Analyste',
}

export const canManage = (role?: UserRole) => role === 'SystemAdministrator' || role === 'NationalCoordinator'
export const canValidate = (role?: UserRole) => canManage(role) || role === 'RegionalSupervisor'
