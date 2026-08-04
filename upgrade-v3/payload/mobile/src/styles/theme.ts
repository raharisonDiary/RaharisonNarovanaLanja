import { DynamicColorIOS, Platform, PlatformColor, type ColorValue } from 'react-native'
const dynamic = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:colorBackground'), default: light }) ?? light
const dynamicText = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:textColorPrimary'), default: light }) ?? light
const dynamicSecondary = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:textColorSecondary'), default: light }) ?? light
export const colors = {
  primary: '#5B4BDB', primaryDark: '#4938BD', primarySoft: Platform.select({ ios: DynamicColorIOS({ light: '#F3F1FF', dark: '#242044' }), default: '#F3F1FF' }) as ColorValue,
  accent: '#16B3A3', accentSoft: Platform.select({ ios: DynamicColorIOS({ light: '#EAFBF7', dark: '#123732' }), default: '#EAFBF7' }) as ColorValue, coral: '#FF7A59',
  navy: '#10172A', navySoft: '#1B2440', success: '#16B3A3', successSoft: Platform.select({ ios: DynamicColorIOS({ light: '#EAFBF7', dark: '#123732' }), default: '#EAFBF7' }) as ColorValue,
  warning: '#EAA72C', warningSoft: Platform.select({ ios: DynamicColorIOS({ light: '#FFF8E8', dark: '#3B2F16' }), default: '#FFF8E8' }) as ColorValue,
  danger: '#E85D5D', dangerSoft: Platform.select({ ios: DynamicColorIOS({ light: '#FFF0EE', dark: '#3B2020' }), default: '#FFF0EE' }) as ColorValue,
  white: dynamic('#FFFFFF', '#111A2B'), background: dynamic('#F6F7FB', '#0C1220'), surface: dynamic('#FFFFFF', '#111A2B'),
  border: Platform.select({ ios: DynamicColorIOS({ light: '#DDE1EB', dark: '#2A3650' }), android: PlatformColor('?android:colorControlNormal'), default: '#DDE1EB' }) as ColorValue,
  muted: dynamicSecondary('#6D7588', '#9AA6BC'), text: dynamicText('#171D2D', '#F4F7FB'), textSoft: dynamicSecondary('#525B70', '#C4CDDB'),
}
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }
export const radius = { sm: 10, md: 14, lg: 20, xl: 28 }
export const shadow = { shadowColor: '#10172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.10, shadowRadius: 22, elevation: 5 }
