import {
  DynamicColorIOS,
  Platform,
  PlatformColor,
  type ColorValue,
} from 'react-native'

function iosDynamic(light: string, dark: string): ColorValue {
  if (
    Platform.OS === 'ios' &&
    typeof DynamicColorIOS === 'function'
  ) {
    return DynamicColorIOS({ light, dark })
  }

  return light
}

function androidSystemColor(
  token: string,
  fallback: string,
): ColorValue {
  if (
    Platform.OS === 'android' &&
    typeof PlatformColor === 'function'
  ) {
    return PlatformColor(token)
  }

  return fallback
}

function dynamicBackground(
  light: string,
  dark: string,
): ColorValue {
  if (Platform.OS === 'ios') {
    return iosDynamic(light, dark)
  }

  if (Platform.OS === 'android') {
    return androidSystemColor(
      '?android:colorBackground',
      light,
    )
  }

  return light
}

function dynamicText(
  light: string,
  dark: string,
): ColorValue {
  if (Platform.OS === 'ios') {
    return iosDynamic(light, dark)
  }

  if (Platform.OS === 'android') {
    return androidSystemColor(
      '?android:textColorPrimary',
      light,
    )
  }

  return light
}

function dynamicSecondary(
  light: string,
  dark: string,
): ColorValue {
  if (Platform.OS === 'ios') {
    return iosDynamic(light, dark)
  }

  if (Platform.OS === 'android') {
    return androidSystemColor(
      '?android:textColorSecondary',
      light,
    )
  }

  return light
}

function softColor(
  light: string,
  dark: string,
): ColorValue {
  return Platform.OS === 'ios'
    ? iosDynamic(light, dark)
    : light
}

function borderColor(): ColorValue {
  if (Platform.OS === 'ios') {
    return iosDynamic('#D5DFD7', '#2A3B32')
  }

  if (Platform.OS === 'android') {
    return androidSystemColor(
      '?android:colorControlNormal',
      '#D5DFD7',
    )
  }

  return '#D5DFD7'
}

export const colors = {
  primary: '#326A4D',
  primaryDark: '#28563F',
  primarySoft: softColor('#EEF7F1', '#1F3328'),

  accent: '#3D8B70',
  accentSoft: softColor('#EDF8F3', '#18352A'),
  coral: '#C97955',

  navy: '#1D2D25',
  navySoft: '#294036',

  success: '#3D8B70',
  successSoft: softColor('#EDF8F3', '#18352A'),

  warning: '#D9A441',
  warningSoft: softColor('#FFF7E7', '#3B301E'),

  danger: '#C96052',
  dangerSoft: softColor('#FFF2ED', '#3A2521'),

  white: dynamicBackground('#FFFFFF', '#15231C'),
  background: dynamicBackground('#F4F8F4', '#0D1713'),
  surface: dynamicBackground('#FFFFFF', '#15231C'),

  border: borderColor(),

  muted: dynamicSecondary('#68766D', '#9EB0A5'),
  text: dynamicText('#1D2D25', '#F1F6F2'),
  textSoft: dynamicSecondary('#526158', '#C5D2C9'),
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
  shadowColor: '#1D2D25',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.1,
  shadowRadius: 22,
  elevation: 5,
}