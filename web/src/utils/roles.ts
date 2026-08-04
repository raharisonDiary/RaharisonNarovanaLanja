import type { Language } from '../i18n/I18nContext'
import type { UserRole } from '../types/api'

const labels: Record<Language, Record<UserRole, string>> = {
  fr: {
    SystemAdministrator: 'Administrateur national',
    NationalCoordinator: 'Coordonnateur national',
    RegionalSupervisor: 'Chef de région',
    Enumerator: 'Agent recenseur',
    Analyst: 'Analyste',
  },
  mg: {
    SystemAdministrator: 'Mpitantana nasionaly',
    NationalCoordinator: 'Mpandrindra nasionaly',
    RegionalSupervisor: 'Lehiben’ny faritra',
    Enumerator: 'Mpanao fanisana',
    Analyst: 'Mpanadihady',
  },
  en: {
    SystemAdministrator: 'National administrator',
    NationalCoordinator: 'National coordinator',
    RegionalSupervisor: 'Regional supervisor',
    Enumerator: 'Enumerator',
    Analyst: 'Analyst',
  },
}

export const getRoleLabel = (role: UserRole, language: Language = 'fr') => labels[language][role]
export const canManage = (role?: UserRole) => role === 'SystemAdministrator' || role === 'NationalCoordinator'
export const canValidate = (role?: UserRole) => canManage(role) || role === 'RegionalSupervisor'
export const canProvisionUsers = (role?: UserRole) => role === 'SystemAdministrator' || role === 'RegionalSupervisor'
