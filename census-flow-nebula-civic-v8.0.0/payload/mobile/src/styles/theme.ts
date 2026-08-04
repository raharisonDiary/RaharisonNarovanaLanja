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
  primary: semanticColor('primary', '#7C5CFF', '#A68CFF'),
  primaryLight: semanticColor('primary-light', '#9A6DFF', '#B89FFF'),
  primaryDark: semanticColor('primary-dark', '#5332C4', '#D0C1FF'),
  primarySoft: semanticColor('primary-soft', '#F3EFFF', '#251B4D'),
  primaryMist: semanticColor('primary-border', '#D1C0FF', '#4B397A'),

  secondary: semanticColor('secondary', '#FF5D8F', '#FF77A4'),
  secondaryLight: semanticColor('secondary-light', '#FF8DB2', '#FF9FBE'),
  secondaryDark: semanticColor('secondary-dark', '#BB315D', '#FFC0D3'),
  secondarySoft: semanticColor('secondary-soft', '#FFF0F5', '#3A182B'),

  accent: semanticColor('accent', '#19C8AD', '#43E1CA'),
  accentLight: semanticColor('accent-light', '#42DBC4', '#68EAD8'),
  accentDark: semanticColor('accent-dark', '#087967', '#A0F4E7'),
  accentSoft: semanticColor('accent-soft', '#EAFFF9', '#0B3836'),

  cyan: semanticColor('info', '#42B8F5', '#6CCBFF'),
  purple: semanticColor('purple', '#9A6DFF', '#C3B2FF'),
  coral: semanticColor('coral', '#FF6678', '#FF96A2'),
  orange: semanticColor('warning', '#F4B942', '#F4C75D'),

  navy: semanticColor('navy', '#0A2136', '#061521'),
  navyDark: semanticColor('navy-dark', '#051420', '#020B13'),
  navySoft: semanticColor('navy-soft', '#12314A', '#0B2030'),

  success: semanticColor('success', '#28C797', '#5BE0B1'),
  successDark: semanticColor('success-strong', '#169F76', '#89EBC8'),
  successSoft: semanticColor('success-soft', '#EBFFF8', '#0D352D'),
  warning: semanticColor('warning', '#F4B942', '#F4C75D'),
  warningDark: semanticColor('warning-strong', '#D49215', '#FFE19A'),
  warningSoft: semanticColor('warning-soft', '#FFF8E6', '#3B2B0E'),
  danger: semanticColor('danger', '#FF6678', '#FF8795'),
  dangerDark: semanticColor('danger-strong', '#DC3F55', '#FFB2BA'),
  dangerSoft: semanticColor('danger-soft', '#FFF0F1', '#43202B'),

  white: semanticColor('surface', '#FFFFFF', '#0B2030', '?android:colorBackground'),
  background: semanticColor('page', '#F6F4FB', '#04111C', '?android:colorBackground'),
  backgroundBlue: semanticColor('page-secondary', '#EFEBF6', '#061521', '?android:colorBackground'),
  surface: semanticColor('surface', '#FFFFFF', '#0B2030', '?android:colorBackgroundFloating'),
  surfaceSoft: semanticColor('surface-subtle', '#FBF9FE', '#0E2435', '?android:colorBackgroundFloating'),
  surfaceMuted: semanticColor('surface-strong', '#F1EDF8', '#183346', '?android:colorBackgroundFloating'),
  border: semanticColor('border', '#DED7EB', '#1B3A4E', '?android:colorControlNormal'),
  muted: semanticColor('text-muted', '#746986', '#94A9BC', '?android:textColorSecondary'),
  text: semanticColor('text', '#171124', '#F8FBFF', '?android:textColorPrimary'),
  textSoft: semanticColor('text-secondary', '#584E6A', '#D1DCE7', '?android:textColorSecondary'),

  overlayBlue: semanticColor('glow-blue', 'rgba(124,92,255,0.14)', 'rgba(166,140,255,0.16)'),
  overlayIndigo: semanticColor('glow-indigo', 'rgba(255,93,143,0.10)', 'rgba(255,119,164,0.11)'),
  overlayTeal: semanticColor('glow-teal', 'rgba(25,200,173,0.10)', 'rgba(67,225,202,0.09)'),
}

export const gradients = {
  primary: ['#7C5CFF', '#9A6DFF', '#FF5D8F'] as const,
  aurora: ['#051420', '#0A2136', '#25164A'] as const,
  hero: ['#020B13', '#071A2B', '#25164A'] as const,
  soft: ['#F3EFFF', '#FFF0F5', '#EAFFF9'] as const,
  success: ['#19C8AD', '#28C797'] as const,
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
  web: { boxShadow: '0 14px 34px rgba(65, 42, 110, 0.14)' },
  default: {
    shadowColor: '#4A2D7A',
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.14,
    shadowRadius: 23,
    elevation: 7,
  },
}) ?? {}

export const softShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 9px 24px rgba(33, 20, 59, 0.09)' },
  default: {
    shadowColor: '#4A2D7A',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 17,
    elevation: 3,
  },
}) ?? {}

export const floatingShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 20px 48px rgba(124, 92, 255, 0.28)' },
  default: {
    shadowColor: '#7C5CFF',
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
