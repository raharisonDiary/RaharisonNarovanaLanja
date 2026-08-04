import {
  DynamicColorIOS,
  Platform,
  PlatformColor,
  type ColorValue,
} from 'react-native'

function iosDynamic(light: string, dark: string): ColorValue {
  if (Platform.OS === 'ios' && typeof DynamicColorIOS === 'function') {
    return DynamicColorIOS({ light, dark })
  }
  return light
}

function androidSystemColor(token: string, fallback: string): ColorValue {
  if (Platform.OS === 'android' && typeof PlatformColor === 'function') {
    return PlatformColor(token)
  }
  return fallback
}

function dynamicBackground(light: string, dark: string): ColorValue {
  if (Platform.OS === 'ios') return iosDynamic(light, dark)
  if (Platform.OS === 'android') {
    return androidSystemColor('?android:colorBackground', light)
  }
  return light
}

function dynamicText(light: string, dark: string): ColorValue {
  if (Platform.OS === 'ios') return iosDynamic(light, dark)
  if (Platform.OS === 'android') {
    return androidSystemColor('?android:textColorPrimary', light)
  }
  return light
}

function dynamicSecondary(light: string, dark: string): ColorValue {
  if (Platform.OS === 'ios') return iosDynamic(light, dark)
  if (Platform.OS === 'android') {
    return androidSystemColor('?android:textColorSecondary', light)
  }
  return light
}

function softColor(light: string, dark: string): ColorValue {
  return Platform.OS === 'ios' ? iosDynamic(light, dark) : light
}

function borderColor(): ColorValue {
  if (Platform.OS === 'ios') return iosDynamic('#E3EAF5', '#243149')
  if (Platform.OS === 'android') {
    return androidSystemColor('?android:colorControlNormal', '#E3EAF5')
  }
  return '#E3EAF5'
}

/**
 * Aurora Civic palette.
 * It deliberately mirrors the web application: mineral blue, indigo,
 * digital teal, clean neutral surfaces and restrained success/warning tones.
 */
export const colors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primarySoft: softColor('#EFF6FF', '#172554'),
  primaryMist: '#DBEAFE',

  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  secondarySoft: softColor('#EEF2FF', '#25245E'),

  accent: '#14B8A6',
  accentLight: '#2DD4BF',
  accentDark: '#0D9488',
  accentSoft: softColor('#F0FDFA', '#123B39'),

  cyan: '#38BDF8',
  purple: '#8B5CF6',
  coral: '#F97360',
  orange: '#F59E0B',

  navy: '#0F2747',
  navyDark: '#081A33',
  navySoft: '#17345D',

  success: '#22C55E',
  successDark: '#15803D',
  successSoft: softColor('#F0FDF4', '#143521'),
  warning: '#F59E0B',
  warningDark: '#B45309',
  warningSoft: softColor('#FFFBEB', '#3B2C0F'),
  danger: '#EF4444',
  dangerDark: '#B91C1C',
  dangerSoft: softColor('#FEF2F2', '#3A1D25'),

  white: dynamicBackground('#FFFFFF', '#121D2E'),
  background: dynamicBackground('#F5F7FA', '#0B1322'),
  backgroundBlue: dynamicBackground('#F2F6FF', '#0B1322'),
  surface: dynamicBackground('#FFFFFF', '#121D2E'),
  surfaceSoft: dynamicBackground('#F8FAFF', '#111C2E'),
  surfaceMuted: dynamicBackground('#F1F5F9', '#172337'),
  border: borderColor(),
  muted: dynamicSecondary('#64748B', '#94A3B8'),
  text: dynamicText('#0F172A', '#F8FAFC'),
  textSoft: dynamicSecondary('#475569', '#B7C3D4'),

  overlayBlue: 'rgba(37, 99, 235, 0.10)',
  overlayIndigo: 'rgba(99, 102, 241, 0.10)',
  overlayTeal: 'rgba(20, 184, 166, 0.10)',
}

export const gradients = {
  primary: ['#2563EB', '#4F46E5'] as const,
  aurora: ['#2563EB', '#6366F1', '#14B8A6'] as const,
  hero: ['#0F2747', '#2563EB', '#6366F1'] as const,
  soft: ['#EFF6FF', '#EEF2FF', '#F0FDFA'] as const,
  success: ['#14B8A6', '#22C55E'] as const,
}

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
}

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 34,
  pill: 999,
}

export const shadow = {
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.14,
  shadowRadius: 24,
  elevation: 7,
}

export const softShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.07,
  shadowRadius: 16,
  elevation: 3,
}

export const floatingShadow = {
  shadowColor: '#1D4ED8',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.20,
  shadowRadius: 28,
  elevation: 10,
}

export const typography = {
  hero: { fontSize: 38, lineHeight: 43, fontWeight: '900' as const },
  display: { fontSize: 30, lineHeight: 36, fontWeight: '900' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '900' as const },
  section: { fontSize: 18, lineHeight: 23, fontWeight: '900' as const },
  body: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
}
