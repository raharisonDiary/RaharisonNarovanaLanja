import {
  DynamicColorIOS,
  Platform,
  PlatformColor,
  type ViewStyle,
} from 'react-native'

function cssVariable(name: string, fallback: string): any {
  return Platform.OS === 'web' ? `var(--census-${name}, ${fallback})` : fallback
}

function iosDynamic(light: string, dark: string): any {
  if (Platform.OS === 'ios' && typeof DynamicColorIOS === 'function') {
    return DynamicColorIOS({ light, dark })
  }
  return light
}

function androidColor(token: string, fallback: string): any {
  if (Platform.OS === 'android' && typeof PlatformColor === 'function') {
    return PlatformColor(token)
  }
  return fallback
}

function semanticColor(
  variable: string,
  light: string,
  dark: string,
  androidToken?: string,
): any {
  if (Platform.OS === 'web') return cssVariable(variable, light)
  if (Platform.OS === 'ios') return iosDynamic(light, dark)
  if (Platform.OS === 'android' && androidToken) return androidColor(androidToken, light)
  return light
}

export const colors = {
  primary: semanticColor('primary', '#0176D4', '#61AFE9'),
  primaryLight: semanticColor('primary-light', '#0282E8', '#82C3F1'),
  primaryDark: semanticColor('primary-dark', '#01457D', '#B1DCF7'),
  primarySoft: semanticColor('primary-soft', '#EEF7FF', '#112A48'),
  primaryMist: semanticColor('primary-border', '#B8DDFB', '#1A4C7B'),

  secondary: semanticColor('secondary', '#F59E0B', '#E6A44C'),
  secondaryLight: semanticColor('secondary-light', '#FBD38D', '#F1BC70'),
  secondaryDark: semanticColor('secondary-dark', '#B45309', '#F8D59D'),
  secondarySoft: semanticColor('secondary-soft', '#FFF8EB', '#332719'),

  accent: semanticColor('accent', '#6C8DAB', '#82C3F1'),
  accentLight: semanticColor('accent-light', '#CBD9E6', '#B1DCF7'),
  accentDark: semanticColor('accent-dark', '#2f526f', '#DBEAFE'),
  accentSoft: semanticColor('accent-soft', '#F6F9FC', '#112A48'),

  cyan: semanticColor('info', '#7FC2F4', '#82C3F1'),
  purple: semanticColor('purple', '#0282E8', '#B1DCF7'),
  coral: semanticColor('coral', '#E11D48', '#FB7185'),
  orange: semanticColor('warning', '#F59E0B', '#E6A44C'),

  navy: semanticColor('navy', '#04396C', '#0D1625'),
  navyDark: semanticColor('navy-dark', '#032f5c', '#0D3153'),
  navySoft: semanticColor('navy-soft', '#01457D', '#121D2D'),

  success: semanticColor('success', '#10B981', '#34D399'),
  successDark: semanticColor('success-strong', '#059669', '#6EE7B7'),
  successSoft: semanticColor('success-soft', '#ECFDF5', '#073B32'),
  warning: semanticColor('warning', '#F59E0B', '#E6A44C'),
  warningDark: semanticColor('warning-strong', '#D97706', '#F8D59D'),
  warningSoft: semanticColor('warning-soft', '#FFF8EB', '#332719'),
  danger: semanticColor('danger', '#E11D48', '#FB7185'),
  dangerDark: semanticColor('danger-strong', '#BE123C', '#FDA4AF'),
  dangerSoft: semanticColor('danger-soft', '#FFF1F2', '#4C1724'),

  white: semanticColor('surface', '#FFFFFF', '#121D2D', '?android:colorBackground'),
  background: semanticColor('page', '#F7F9FB', '#0D1625', '?android:colorBackground'),
  backgroundBlue: semanticColor('page-secondary', '#EEF3F7', '#0D1625', '?android:colorBackground'),
  surface: semanticColor('surface', '#FFFFFF', '#121D2D', '?android:colorBackgroundFloating'),
  surfaceSoft: semanticColor('surface-subtle', '#F9FBFD', '#0F1928', '?android:colorBackgroundFloating'),
  surfaceMuted: semanticColor('surface-strong', '#EEF3F7', '#1C2A3D', '?android:colorBackgroundFloating'),
  border: semanticColor('border', '#DDE6EE', '#293B51', '?android:colorControlNormal'),
  muted: semanticColor('text-muted', '#6b7e8f', '#9EADBC', '?android:textColorSecondary'),
  text: semanticColor('text', '#0e1d2a', '#F7FAFC', '?android:textColorPrimary'),
  textSoft: semanticColor('text-secondary', '#4D6173', '#C0CDD9', '?android:textColorSecondary'),

  overlayBlue: semanticColor('glow-blue', 'rgba(1,118,212,0.10)', 'rgba(96,165,250,0.12)'),
  overlayIndigo: semanticColor('glow-indigo', 'rgba(245,158,11,0.07)', 'rgba(251,146,60,0.08)'),
  overlayTeal: semanticColor('glow-teal', 'rgba(2,130,232,0.06)', 'rgba(147,197,253,0.07)'),
}

export const gradients = {
  primary: ['#0282E8', '#0176D4', '#02579B'] as const,
  aurora: ['#0282E8', '#0176D4', '#02579B'] as const,
  hero: ['#0282E8', '#0176D4', '#02579B'] as const,
  soft: ['#EEF7FF', '#F7F9FB', '#FFF8EB'] as const,
  success: ['#10B981', '#059669'] as const,
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

export const shadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 14px 34px rgba(1, 69, 125, 0.11)' },
  default: {
    shadowColor: '#01457D',
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.14,
    shadowRadius: 23,
    elevation: 7,
  },
}) ?? {}

export const softShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 9px 24px rgba(1, 69, 125, 0.07)' },
  default: {
    shadowColor: '#01457D',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 17,
    elevation: 3,
  },
}) ?? {}

export const floatingShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 20px 48px rgba(1, 118, 212, 0.20)' },
  default: {
    shadowColor: '#0176D4',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 30,
    elevation: 11,
  },
}) ?? {}

export const typography = {
  hero: { fontSize: 38, lineHeight: 43, fontWeight: '900' as const },
  display: { fontSize: 30, lineHeight: 36, fontWeight: '900' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '900' as const },
  section: { fontSize: 18, lineHeight: 23, fontWeight: '900' as const },
  body: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const },
}
