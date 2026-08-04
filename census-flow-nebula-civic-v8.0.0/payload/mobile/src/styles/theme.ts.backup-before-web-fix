import { DynamicColorIOS, Platform, PlatformColor, type ColorValue } from 'react-native'
const dynamic = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:colorBackground'), default: light }) ?? light
const dynamicText = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:textColorPrimary'), default: light }) ?? light
const dynamicSecondary = (light: string, dark: string): ColorValue => Platform.select({ ios: DynamicColorIOS({ light, dark }), android: PlatformColor('?android:textColorSecondary'), default: light }) ?? light
export const colors = {
  primary: '#326A4D', primaryDark: '#28563F', primarySoft: Platform.select({ ios: DynamicColorIOS({ light: '#EEF7F1', dark: '#1F3328' }), default: '#EEF7F1' }) as ColorValue,
  accent: '#3D8B70', accentSoft: Platform.select({ ios: DynamicColorIOS({ light: '#EDF8F3', dark: '#18352A' }), default: '#EDF8F3' }) as ColorValue, coral: '#C97955',
  navy: '#1D2D25', navySoft: '#294036', success: '#3D8B70', successSoft: Platform.select({ ios: DynamicColorIOS({ light: '#EDF8F3', dark: '#18352A' }), default: '#EDF8F3' }) as ColorValue,
  warning: '#D9A441', warningSoft: Platform.select({ ios: DynamicColorIOS({ light: '#FFF7E7', dark: '#3B301E' }), default: '#FFF7E7' }) as ColorValue,
  danger: '#C96052', dangerSoft: Platform.select({ ios: DynamicColorIOS({ light: '#FFF2ED', dark: '#3A2521' }), default: '#FFF2ED' }) as ColorValue,
  white: dynamic('#FFFFFF', '#15231C'), background: dynamic('#F4F8F4', '#0D1713'), surface: dynamic('#FFFFFF', '#15231C'),
  border: Platform.select({ ios: DynamicColorIOS({ light: '#D5DFD7', dark: '#2A3B32' }), android: PlatformColor('?android:colorControlNormal'), default: '#D5DFD7' }) as ColorValue,
  muted: dynamicSecondary('#68766D', '#9EB0A5'), text: dynamicText('#1D2D25', '#F1F6F2'), textSoft: dynamicSecondary('#526158', '#C5D2C9'),
}
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }
export const radius = { sm: 10, md: 14, lg: 20, xl: 28 }
export const shadow = { shadowColor: '#1D2D25', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.10, shadowRadius: 22, elevation: 5 }
