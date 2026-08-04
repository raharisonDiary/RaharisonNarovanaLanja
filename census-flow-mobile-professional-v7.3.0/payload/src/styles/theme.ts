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

/**
 * Semantic Aurora palette.
 * On web, colors are CSS variables so every existing StyleSheet updates live
 * when the user switches theme. On iOS, DynamicColorIOS provides the same
 * behavior. Android uses system semantic colors for the most important
 * surfaces and text values.
 */
export const colors = {
  primary: semanticColor('primary', '#2457D6', '#76A9FF'),
  primaryLight: semanticColor('primary-light', '#3B82F6', '#90B9FF'),
  primaryDark: semanticColor('primary-dark', '#1948C2', '#AFCBFF'),
  primarySoft: semanticColor('primary-soft', '#EAF1FF', '#17315A'),
  primaryMist: semanticColor('primary-border', '#BFD1FF', '#365B92'),

  secondary: semanticColor('secondary', '#615AD9', '#A5A0FF'),
  secondaryLight: semanticColor('secondary-light', '#818CF8', '#BCB8FF'),
  secondaryDark: semanticColor('secondary-dark', '#4F46E5', '#C7C4FF'),
  secondarySoft: semanticColor('secondary-soft', '#EFEEFF', '#2A2855'),

  accent: semanticColor('accent', '#0E9F8F', '#3AD4C2'),
  accentLight: semanticColor('accent-light', '#2DD4BF', '#67E8D6'),
  accentDark: semanticColor('accent-dark', '#0B7E73', '#7AE9DC'),
  accentSoft: semanticColor('accent-soft', '#E7F8F5', '#123D3B'),

  cyan: semanticColor('info', '#1476A8', '#65C5F2'),
  purple: semanticColor('purple', '#7C3AED', '#C4B5FD'),
  coral: semanticColor('coral', '#E86657', '#FFA397'),
  orange: semanticColor('warning', '#C06A0A', '#F4B45F'),

  navy: semanticColor('navy', '#0B1930', '#081427'),
  navyDark: semanticColor('navy-dark', '#061226', '#030B17'),
  navySoft: semanticColor('navy-soft', '#122440', '#10223B'),

  success: semanticColor('success', '#168653', '#57D695'),
  successDark: semanticColor('success-strong', '#116B43', '#78E3AC'),
  successSoft: semanticColor('success-soft', '#EAF8F0', '#12392A'),
  warning: semanticColor('warning', '#C06A0A', '#F4B45F'),
  warningDark: semanticColor('warning-strong', '#995006', '#FFD08A'),
  warningSoft: semanticColor('warning-soft', '#FFF4E2', '#3E2D16'),
  danger: semanticColor('danger', '#C83A46', '#FF8791'),
  dangerDark: semanticColor('danger-strong', '#A92E39', '#FFABB2'),
  dangerSoft: semanticColor('danger-soft', '#FDECEF', '#43202B'),

  white: semanticColor('surface', '#FFFFFF', '#0F1D31', '?android:colorBackground'),
  background: semanticColor('page', '#F4F7FB', '#07111F', '?android:colorBackground'),
  backgroundBlue: semanticColor('page-secondary', '#ECF2F9', '#0A1627', '?android:colorBackground'),
  surface: semanticColor('surface', '#FFFFFF', '#0F1D31', '?android:colorBackgroundFloating'),
  surfaceSoft: semanticColor('surface-subtle', '#F7F9FC', '#172942', '?android:colorBackgroundFloating'),
  surfaceMuted: semanticColor('surface-strong', '#EDF2F8', '#1C304B', '?android:colorBackgroundFloating'),
  border: semanticColor('border', '#DCE5F0', '#283C59', '?android:colorControlNormal'),
  muted: semanticColor('text-muted', '#788BA3', '#91A4BD', '?android:textColorSecondary'),
  text: semanticColor('text', '#0B172A', '#F7FAFF', '?android:textColorPrimary'),
  textSoft: semanticColor('text-secondary', '#4F6178', '#C1CCDC', '?android:textColorSecondary'),

  overlayBlue: semanticColor('glow-blue', 'rgba(36,87,214,0.10)', 'rgba(75,132,255,0.12)'),
  overlayIndigo: semanticColor('glow-indigo', 'rgba(97,90,217,0.09)', 'rgba(127,119,255,0.10)'),
  overlayTeal: semanticColor('glow-teal', 'rgba(14,159,143,0.09)', 'rgba(50,211,193,0.08)'),
}

export const gradients = {
  primary: ['#2457D6', '#615AD9'] as const,
  aurora: ['#2457D6', '#615AD9', '#0E9F8F'] as const,
  hero: ['#0B244B', '#2457D6', '#6257D8'] as const,
  soft: ['#EAF1FF', '#EFEEFF', '#E7F8F5'] as const,
  success: ['#0E9F8F', '#168653'] as const,
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
  web: { boxShadow: '0 12px 28px rgba(30, 55, 90, 0.12)' },
  default: {
    shadowColor: '#17345F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
}) ?? {}

export const softShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 8px 22px rgba(30, 55, 90, 0.08)' },
  default: {
    shadowColor: '#17345F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
}) ?? {}

export const floatingShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 18px 42px rgba(29, 78, 216, 0.16)' },
  default: {
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
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
