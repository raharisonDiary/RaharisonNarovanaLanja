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
  if (Platform.OS === 'ios') return iosDynamic('#E2E8F0', '#233047')
  if (Platform.OS === 'android') {
    return androidSystemColor('?android:colorControlNormal', '#E2E8F0')
  }
  return '#E2E8F0'
}

export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: softColor('#EFF6FF', '#172554'),
  secondary: '#6366F1',
  secondaryDark: '#4F46E5',
  secondarySoft: softColor('#EEF2FF', '#25245E'),
  accent: '#14B8A6',
  accentDark: '#0D9488',
  accentSoft: softColor('#F0FDFA', '#123B39'),
  cyan: '#38BDF8',
  purple: '#8B5CF6',
  coral: '#EF4444',
  navy: '#0F2747',
  navyDark: '#081A33',
  navySoft: '#17345D',
  success: '#22C55E',
  successSoft: softColor('#F0FDF4', '#143521'),
  warning: '#F59E0B',
  warningSoft: softColor('#FFFBEB', '#3B2C0F'),
  danger: '#EF4444',
  dangerSoft: softColor('#FEF2F2', '#3A1D25'),
  white: dynamicBackground('#FFFFFF', '#121D2E'),
  background: dynamicBackground('#F5F7FA', '#0B1322'),
  surface: dynamicBackground('#FFFFFF', '#121D2E'),
  surfaceSoft: dynamicBackground('#F8FAFC', '#111C2E'),
  border: borderColor(),
  muted: dynamicSecondary('#64748B', '#94A3B8'),
  text: dynamicText('#0F172A', '#F8FAFC'),
  textSoft: dynamicSecondary('#475569', '#B7C3D4'),
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
}

export const shadow = {
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.10,
  shadowRadius: 22,
  elevation: 5,
}

export const softShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 3,
}
