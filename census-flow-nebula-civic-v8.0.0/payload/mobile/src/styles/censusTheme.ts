import { Platform, useColorScheme, type ViewStyle } from 'react-native'
import { usePreferences } from '../preferences/PreferencesContext'

export type CensusPalette = {
  mode: 'light' | 'dark'
  page: string
  pageSecondary: string
  sidebar: string
  sidebarSecondary: string
  sidebarText: string
  sidebarMuted: string
  sidebarAccent: string
  topbar: string
  surface: string
  surfaceRaised: string
  surfaceSubtle: string
  surfaceStrong: string
  border: string
  borderStrong: string
  text: string
  textSecondary: string
  textMuted: string
  inverseText: string
  primary: string
  primaryHover: string
  primarySoft: string
  primaryBorder: string
  secondary: string
  secondarySoft: string
  accent: string
  accentSoft: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  danger: string
  dangerSoft: string
  info: string
  infoSoft: string
  heroStart: string
  heroMiddle: string
  heroEnd: string
  heroText: string
  heroMuted: string
  overlay: string
  shadow: string
  glowBlue: string
  glowIndigo: string
  glowTeal: string
}

/**
 * Nebula Civic palette shared by mobile and Expo Web.
 * Structure: midnight lagoon. Signature: ultraviolet + electric coral.
 * Accent: glacier mint. Amber is reserved for warnings and validation cues.
 */
export const lightCensusPalette: CensusPalette = {
  mode: 'light',
  page: '#F6F4FB',
  pageSecondary: '#EFEBF6',
  sidebar: '#071A2B',
  sidebarSecondary: '#102B43',
  sidebarText: '#F8FBFF',
  sidebarMuted: '#A8BCD1',
  sidebarAccent: '#7C5CFF',
  topbar: '#071A2B',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#FBF9FE',
  surfaceStrong: '#F1EDF8',
  border: '#DED7EB',
  borderStrong: '#C8BCE0',
  text: '#171124',
  textSecondary: '#584E6A',
  textMuted: '#746986',
  inverseText: '#FFFFFF',
  primary: '#7C5CFF',
  primaryHover: '#6945EF',
  primarySoft: '#F3EFFF',
  primaryBorder: '#D1C0FF',
  secondary: '#FF5D8F',
  secondarySoft: '#FFF0F5',
  accent: '#19C8AD',
  accentSoft: '#EAFFF9',
  success: '#28C797',
  successSoft: '#EBFFF8',
  warning: '#F4B942',
  warningSoft: '#FFF8E6',
  danger: '#FF6678',
  dangerSoft: '#FFF0F1',
  info: '#42B8F5',
  infoSoft: '#EAF7FF',
  heroStart: '#051420',
  heroMiddle: '#0A2136',
  heroEnd: '#25164A',
  heroText: '#FFFFFF',
  heroMuted: '#D7E2EF',
  overlay: 'rgba(3, 10, 20, 0.66)',
  shadow: '#21143B',
  glowBlue: 'rgba(124, 92, 255, 0.14)',
  glowIndigo: 'rgba(255, 93, 143, 0.10)',
  glowTeal: 'rgba(25, 200, 173, 0.10)',
}

export const darkCensusPalette: CensusPalette = {
  mode: 'dark',
  page: '#04111C',
  pageSecondary: '#061521',
  sidebar: '#03101B',
  sidebarSecondary: '#0B2030',
  sidebarText: '#F8FBFF',
  sidebarMuted: '#9FB3C8',
  sidebarAccent: '#A68CFF',
  topbar: '#061521',
  surface: '#0B2030',
  surfaceRaised: '#10283B',
  surfaceSubtle: '#0E2435',
  surfaceStrong: '#183346',
  border: '#1B3A4E',
  borderStrong: '#2A4C63',
  text: '#F8FBFF',
  textSecondary: '#D1DCE7',
  textMuted: '#94A9BC',
  inverseText: '#FFFFFF',
  primary: '#A68CFF',
  primaryHover: '#8E75FF',
  primarySoft: '#251B4D',
  primaryBorder: '#4B397A',
  secondary: '#FF77A4',
  secondarySoft: '#3A182B',
  accent: '#43E1CA',
  accentSoft: '#0B3836',
  success: '#5BE0B1',
  successSoft: '#0D352D',
  warning: '#F4C75D',
  warningSoft: '#3B2B0E',
  danger: '#FF8795',
  dangerSoft: '#43202B',
  info: '#6CCBFF',
  infoSoft: '#12354B',
  heroStart: '#020B13',
  heroMiddle: '#071A2B',
  heroEnd: '#25164A',
  heroText: '#FFFFFF',
  heroMuted: '#C9D5E3',
  overlay: 'rgba(1, 5, 13, 0.84)',
  shadow: '#000000',
  glowBlue: 'rgba(166, 140, 255, 0.16)',
  glowIndigo: 'rgba(255, 119, 164, 0.11)',
  glowTeal: 'rgba(67, 225, 202, 0.09)',
}

export function useCensusTheme() {
  const systemScheme = useColorScheme()
  const preferences = usePreferences()
  const isDark =
    preferences.theme === 'dark' ||
    (preferences.theme === 'system' && systemScheme === 'dark')
  const palette = isDark ? darkCensusPalette : lightCensusPalette
  return { isDark, palette, resolvedTheme: isDark ? 'dark' as const : 'light' as const }
}

export function surfaceShadow(isDark: boolean, level: 'soft' | 'raised' = 'soft'): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: level === 'raised'
        ? isDark
          ? '0 24px 64px rgba(0, 0, 0, 0.46)'
          : '0 24px 58px rgba(65, 42, 110, 0.16)'
        : isDark
          ? '0 12px 34px rgba(0, 0, 0, 0.34)'
          : '0 12px 30px rgba(33, 20, 59, 0.10)',
    } as ViewStyle
  }

  return level === 'raised'
    ? {
        shadowColor: isDark ? '#000000' : '#4A2D7A',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: isDark ? 0.42 : 0.17,
        shadowRadius: 26,
        elevation: 11,
      }
    : {
        shadowColor: isDark ? '#000000' : '#4A2D7A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.28 : 0.10,
        shadowRadius: 17,
        elevation: 4,
      }
}
