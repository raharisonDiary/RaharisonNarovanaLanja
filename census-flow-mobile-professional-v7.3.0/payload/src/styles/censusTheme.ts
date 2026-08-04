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

export const lightCensusPalette: CensusPalette = {
  mode: 'light',
  page: '#F4F7FB',
  pageSecondary: '#ECF2F9',
  sidebar: '#0B1930',
  sidebarSecondary: '#122440',
  sidebarText: '#F8FAFC',
  sidebarMuted: '#9FB0C8',
  sidebarAccent: '#78A9FF',
  topbar: '#0B1930',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#F7F9FC',
  surfaceStrong: '#EDF2F8',
  border: '#DCE5F0',
  borderStrong: '#C5D2E2',
  text: '#0B172A',
  textSecondary: '#4F6178',
  textMuted: '#788BA3',
  inverseText: '#FFFFFF',
  primary: '#2457D6',
  primaryHover: '#1948C2',
  primarySoft: '#EAF1FF',
  primaryBorder: '#BFD1FF',
  secondary: '#615AD9',
  secondarySoft: '#EFEEFF',
  accent: '#0E9F8F',
  accentSoft: '#E7F8F5',
  success: '#168653',
  successSoft: '#EAF8F0',
  warning: '#C06A0A',
  warningSoft: '#FFF4E2',
  danger: '#C83A46',
  dangerSoft: '#FDECEF',
  info: '#1476A8',
  infoSoft: '#E8F5FB',
  heroStart: '#0B244B',
  heroMiddle: '#2457D6',
  heroEnd: '#6257D8',
  heroText: '#FFFFFF',
  heroMuted: '#DCE8FF',
  overlay: 'rgba(2, 8, 23, 0.56)',
  shadow: '#10213D',
  glowBlue: 'rgba(36, 87, 214, 0.10)',
  glowIndigo: 'rgba(97, 90, 217, 0.09)',
  glowTeal: 'rgba(14, 159, 143, 0.09)',
}

export const darkCensusPalette: CensusPalette = {
  mode: 'dark',
  page: '#07111F',
  pageSecondary: '#0A1627',
  sidebar: '#081427',
  sidebarSecondary: '#10223B',
  sidebarText: '#F8FAFC',
  sidebarMuted: '#9FB0C8',
  sidebarAccent: '#78A9FF',
  topbar: '#081427',
  surface: '#0F1D31',
  surfaceRaised: '#13243B',
  surfaceSubtle: '#172942',
  surfaceStrong: '#1C304B',
  border: '#283C59',
  borderStrong: '#38506F',
  text: '#F7FAFF',
  textSecondary: '#C1CCDC',
  textMuted: '#91A4BD',
  inverseText: '#07111F',
  primary: '#76A9FF',
  primaryHover: '#90B9FF',
  primarySoft: '#17315A',
  primaryBorder: '#365B92',
  secondary: '#A5A0FF',
  secondarySoft: '#2A2855',
  accent: '#3AD4C2',
  accentSoft: '#123D3B',
  success: '#57D695',
  successSoft: '#12392A',
  warning: '#F4B45F',
  warningSoft: '#3E2D16',
  danger: '#FF8791',
  dangerSoft: '#43202B',
  info: '#65C5F2',
  infoSoft: '#12364A',
  heroStart: '#071A36',
  heroMiddle: '#173F8E',
  heroEnd: '#4A43A8',
  heroText: '#FFFFFF',
  heroMuted: '#D8E6FF',
  overlay: 'rgba(1, 6, 18, 0.78)',
  shadow: '#020617',
  glowBlue: 'rgba(75, 132, 255, 0.12)',
  glowIndigo: 'rgba(127, 119, 255, 0.10)',
  glowTeal: 'rgba(50, 211, 193, 0.08)',
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
          ? '0 20px 52px rgba(0, 0, 0, 0.36)'
          : '0 20px 50px rgba(30, 55, 90, 0.14)'
        : isDark
          ? '0 10px 28px rgba(0, 0, 0, 0.28)'
          : '0 10px 28px rgba(30, 55, 90, 0.09)',
    } as ViewStyle
  }

  return level === 'raised'
    ? {
        shadowColor: isDark ? '#000000' : '#17345F',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: isDark ? 0.38 : 0.16,
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: isDark ? '#000000' : '#17345F',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: isDark ? 0.25 : 0.10,
        shadowRadius: 16,
        elevation: 4,
      }
}
