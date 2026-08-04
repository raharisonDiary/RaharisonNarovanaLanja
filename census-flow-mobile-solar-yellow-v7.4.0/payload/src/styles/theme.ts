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
  primary: semanticColor('primary', '#F4B400', '#FFD34E'),
  primaryLight: semanticColor('primary-light', '#FFD34E', '#FFE083'),
  primaryDark: semanticColor('primary-dark', '#B77900', '#F4B400'),
  primarySoft: semanticColor('primary-soft', '#FFF4CC', '#3A2A05'),
  primaryMist: semanticColor('primary-border', '#F1D16A', '#72570F'),

  secondary: semanticColor('secondary', '#1D3557', '#93A4BF'),
  secondaryLight: semanticColor('secondary-light', '#476789', '#B7C4D8'),
  secondaryDark: semanticColor('secondary-dark', '#0B172A', '#D6DEEA'),
  secondarySoft: semanticColor('secondary-soft', '#E8EEF6', '#1C2B42'),

  accent: semanticColor('accent', '#0F766E', '#2DD4BF'),
  accentLight: semanticColor('accent-light', '#14B8A6', '#5EEAD4'),
  accentDark: semanticColor('accent-dark', '#0B5C56', '#7DE9DD'),
  accentSoft: semanticColor('accent-soft', '#E5F7F4', '#113B37'),

  cyan: semanticColor('info', '#2563EB', '#7DB4FF'),
  purple: semanticColor('purple', '#6D5BD0', '#C3B9FF'),
  coral: semanticColor('coral', '#E86657', '#FFA397'),
  orange: semanticColor('warning', '#B77900', '#FFD166'),

  navy: semanticColor('navy', '#0B172A', '#08111F'),
  navyDark: semanticColor('navy-dark', '#050B14', '#02060D'),
  navySoft: semanticColor('navy-soft', '#13233B', '#101B2D'),

  success: semanticColor('success', '#168653', '#57D695'),
  successDark: semanticColor('success-strong', '#116B43', '#78E3AC'),
  successSoft: semanticColor('success-soft', '#EAF8F0', '#12392A'),
  warning: semanticColor('warning', '#B77900', '#FFD166'),
  warningDark: semanticColor('warning-strong', '#8A5A00', '#FFE29A'),
  warningSoft: semanticColor('warning-soft', '#FFF4D6', '#3D2E10'),
  danger: semanticColor('danger', '#C83A46', '#FF8791'),
  dangerDark: semanticColor('danger-strong', '#A92E39', '#FFABB2'),
  dangerSoft: semanticColor('danger-soft', '#FDECEF', '#43202B'),

  white: semanticColor('surface', '#FFFFFF', '#0F1B2D', '?android:colorBackground'),
  background: semanticColor('page', '#F6F8FC', '#070E1A', '?android:colorBackground'),
  backgroundBlue: semanticColor('page-secondary', '#EDF1F7', '#0A1322', '?android:colorBackground'),
  surface: semanticColor('surface', '#FFFFFF', '#0F1B2D', '?android:colorBackgroundFloating'),
  surfaceSoft: semanticColor('surface-subtle', '#F8FAFD', '#17273F', '?android:colorBackgroundFloating'),
  surfaceMuted: semanticColor('surface-strong', '#EEF2F7', '#1D2F4A', '?android:colorBackgroundFloating'),
  border: semanticColor('border', '#E1E7EF', '#2A3B55', '?android:colorControlNormal'),
  muted: semanticColor('text-muted', '#718096', '#9AA9BE', '?android:textColorSecondary'),
  text: semanticColor('text', '#0F172A', '#F8FAFC', '?android:textColorPrimary'),
  textSoft: semanticColor('text-secondary', '#475569', '#CBD5E1', '?android:textColorSecondary'),

  overlayBlue: semanticColor('glow-blue', 'rgba(244,180,0,0.11)', 'rgba(255,211,78,0.10)'),
  overlayIndigo: semanticColor('glow-indigo', 'rgba(29,53,87,0.08)', 'rgba(108,130,163,0.08)'),
  overlayTeal: semanticColor('glow-teal', 'rgba(15,118,110,0.08)', 'rgba(45,212,191,0.07)'),
}

export const gradients = {
  primary: ['#FFD34E', '#F4B400', '#D99F00'] as const,
  aurora: ['#07111F', '#13233B', '#1D3557'] as const,
  hero: ['#030812', '#0B172A', '#1D3557'] as const,
  soft: ['#FFF8DE', '#FFF4CC', '#E8EEF6'] as const,
  success: ['#0F766E', '#168653'] as const,
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
  web: { boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)' },
  default: {
    shadowColor: '#0B172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
}) ?? {}

export const softShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)' },
  default: {
    shadowColor: '#0B172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
}) ?? {}

export const floatingShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 18px 42px rgba(183, 121, 0, 0.20)' },
  default: {
    shadowColor: '#B77900',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.20,
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
