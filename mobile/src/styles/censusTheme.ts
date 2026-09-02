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
 * Census Flow Professional palette shared by mobile and Expo Web.
 * Brand: civic blue + white. Orange is a controlled attention accent.
 * Status colors remain semantic and match Web Professional V5.
 */
export const lightCensusPalette: CensusPalette = {
  mode: 'light',
  page: '#F7F9FB',
  pageSecondary: '#EEF3F7',
  sidebar: '#02579B',
  sidebarSecondary: '#01457D',
  sidebarText: '#FFFFFF',
  sidebarMuted: '#C9D6E3',
  sidebarAccent: '#0176D4',
  topbar: '#01457D',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#F9FBFD',
  surfaceStrong: '#EEF3F7',
  border: '#DDE6EE',
  borderStrong: '#C5D2DE',
  text: '#0E1D2A',
  textSecondary: '#4D6173',
  textMuted: '#6B7E8F',
  inverseText: '#FFFFFF',
  primary: '#0176D4',
  primaryHover: '#02579B',
  primarySoft: '#EEF7FF',
  primaryBorder: '#B8DDFB',
  secondary: '#F59E0B',
  secondarySoft: '#FFF8EB',
  accent: '#6C8DAB',
  accentSoft: '#F6F9FC',
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFF8EB',
  danger: '#E11D48',
  dangerSoft: '#FFF1F2',
  info: '#7FC2F4',
  infoSoft: '#EEF7FF',
  heroStart: '#0282E8',
  heroMiddle: '#0176D4',
  heroEnd: '#02579B',
  heroText: '#FFFFFF',
  heroMuted: '#D9EDFF',
  overlay: 'rgba(3,47,92,0.68)',
  shadow: '#01457D',
  glowBlue: 'rgba(1,118,212,0.10)',
  glowIndigo: 'rgba(245,158,11,0.07)',
  glowTeal: 'rgba(2,130,232,0.06)',
}

/** Same refined night mood as the approved web Safe Polish. */
export const darkCensusPalette: CensusPalette = {
  mode: 'dark',
  page: '#0D1625',
  pageSecondary: '#0B1220',
  sidebar: '#0D3153',
  sidebarSecondary: '#09243D',
  sidebarText: '#F7FAFC',
  sidebarMuted: '#9EADBC',
  sidebarAccent: '#82C3F1',
  topbar: '#0D1625',
  surface: '#121D2D',
  surfaceRaised: '#172437',
  surfaceSubtle: '#0F1928',
  surfaceStrong: '#1C2A3D',
  border: '#293B51',
  borderStrong: '#31455C',
  text: '#F7FAFC',
  textSecondary: '#C0CDD9',
  textMuted: '#9EADBC',
  inverseText: '#FFFFFF',
  primary: '#61AFE9',
  primaryHover: '#82C3F1',
  primarySoft: '#112A48',
  primaryBorder: '#1A4C7B',
  secondary: '#E6A44C',
  secondarySoft: '#332719',
  accent: '#82C3F1',
  accentSoft: '#112A48',
  success: '#34D399',
  successSoft: '#073B32',
  warning: '#E6A44C',
  warningSoft: '#332719',
  danger: '#FB7185',
  dangerSoft: '#4C1724',
  info: '#82C3F1',
  infoSoft: '#112A48',
  heroStart: '#0E3A60',
  heroMiddle: '#0B3153',
  heroEnd: '#09243D',
  heroText: '#FFFFFF',
  heroMuted: '#C9D8E5',
  overlay: 'rgba(1,8,18,0.78)',
  shadow: '#020812',
  glowBlue: 'rgba(75,145,204,0.13)',
  glowIndigo: 'rgba(230,164,76,0.07)',
  glowTeal: 'rgba(97,175,233,0.07)',
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
          ? '0 24px 64px rgba(2, 8, 18, 0.43)'
          : '0 24px 58px rgba(1, 69, 125, 0.12)'
        : isDark
          ? '0 12px 34px rgba(2, 8, 18, 0.30)'
          : '0 12px 30px rgba(1, 69, 125, 0.07)',
    } as ViewStyle
  }

  return level === 'raised'
    ? {
        shadowColor: isDark ? '#000000' : '#01457D',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: isDark ? 0.42 : 0.17,
        shadowRadius: 26,
        elevation: 11,
      }
    : {
        shadowColor: isDark ? '#000000' : '#01457D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.28 : 0.10,
        shadowRadius: 17,
        elevation: 4,
      }
}
