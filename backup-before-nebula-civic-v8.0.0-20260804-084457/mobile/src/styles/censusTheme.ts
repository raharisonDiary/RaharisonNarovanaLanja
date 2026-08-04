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
 * Signature palette: graphite/navy structure + solar yellow accents.
 * Yellow is reserved for primary actions, focus and selected navigation.
 * Large surfaces stay neutral to preserve readability and a professional look.
 */
export const lightCensusPalette: CensusPalette = {
  mode: 'light',
  page: '#F6F8FC',
  pageSecondary: '#EDF1F7',
  sidebar: '#0B172A',
  sidebarSecondary: '#13233B',
  sidebarText: '#F8FAFC',
  sidebarMuted: '#B5C1D2',
  sidebarAccent: '#F4B400',
  topbar: '#0B172A',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#F8FAFD',
  surfaceStrong: '#EEF2F7',
  border: '#E1E7EF',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#718096',
  inverseText: '#0B172A',
  primary: '#F4B400',
  primaryHover: '#D99F00',
  primarySoft: '#FFF4CC',
  primaryBorder: '#F1D16A',
  secondary: '#1D3557',
  secondarySoft: '#E8EEF6',
  accent: '#0F766E',
  accentSoft: '#E5F7F4',
  success: '#168653',
  successSoft: '#EAF8F0',
  warning: '#B77900',
  warningSoft: '#FFF4D6',
  danger: '#C83A46',
  dangerSoft: '#FDECEF',
  info: '#2563EB',
  infoSoft: '#EAF1FF',
  heroStart: '#07111F',
  heroMiddle: '#0B172A',
  heroEnd: '#1D3557',
  heroText: '#FFFFFF',
  heroMuted: '#D6DFEC',
  overlay: 'rgba(2, 8, 23, 0.60)',
  shadow: '#0B172A',
  glowBlue: 'rgba(244, 180, 0, 0.11)',
  glowIndigo: 'rgba(29, 53, 87, 0.08)',
  glowTeal: 'rgba(15, 118, 110, 0.08)',
}

export const darkCensusPalette: CensusPalette = {
  mode: 'dark',
  page: '#070E1A',
  pageSecondary: '#0A1322',
  sidebar: '#050B14',
  sidebarSecondary: '#101B2D',
  sidebarText: '#F8FAFC',
  sidebarMuted: '#AEBBD0',
  sidebarAccent: '#FFD34E',
  topbar: '#08111F',
  surface: '#0F1B2D',
  surfaceRaised: '#132139',
  surfaceSubtle: '#17273F',
  surfaceStrong: '#1D2F4A',
  border: '#2A3B55',
  borderStrong: '#3B506E',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#9AA9BE',
  inverseText: '#07111F',
  primary: '#FFD34E',
  primaryHover: '#F4B400',
  primarySoft: '#3A2A05',
  primaryBorder: '#72570F',
  secondary: '#93A4BF',
  secondarySoft: '#1C2B42',
  accent: '#2DD4BF',
  accentSoft: '#113B37',
  success: '#57D695',
  successSoft: '#12392A',
  warning: '#FFD166',
  warningSoft: '#3D2E10',
  danger: '#FF8791',
  dangerSoft: '#43202B',
  info: '#7DB4FF',
  infoSoft: '#17315A',
  heroStart: '#030812',
  heroMiddle: '#081427',
  heroEnd: '#172B47',
  heroText: '#FFFFFF',
  heroMuted: '#C9D5E6',
  overlay: 'rgba(1, 5, 13, 0.82)',
  shadow: '#020617',
  glowBlue: 'rgba(255, 211, 78, 0.10)',
  glowIndigo: 'rgba(108, 130, 163, 0.08)',
  glowTeal: 'rgba(45, 212, 191, 0.07)',
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
          ? '0 22px 54px rgba(0, 0, 0, 0.42)'
          : '0 20px 48px rgba(15, 23, 42, 0.14)'
        : isDark
          ? '0 12px 30px rgba(0, 0, 0, 0.30)'
          : '0 10px 28px rgba(15, 23, 42, 0.09)',
    } as ViewStyle
  }

  return level === 'raised'
    ? {
        shadowColor: isDark ? '#000000' : '#0B172A',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: isDark ? 0.40 : 0.15,
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: isDark ? '#000000' : '#0B172A',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: isDark ? 0.26 : 0.09,
        shadowRadius: 16,
        elevation: 4,
      }
}
