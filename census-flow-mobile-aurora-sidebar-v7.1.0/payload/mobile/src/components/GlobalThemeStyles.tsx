import { Platform } from 'react-native'

/**
 * Expo Web keeps many React Native colors as inline styles. These focused
 * overrides make the existing Aurora screens readable in dark mode without
 * touching their business logic or form state.
 */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root { color-scheme: light; }
    :root[data-census-theme="dark"] { color-scheme: dark; }
    :root[data-census-theme="dark"] body,
    :root[data-census-theme="dark"] #root {
      background: #07111f !important;
      color: #f8fafc !important;
    }
    :root[data-census-theme="dark"] [style*="background-color: rgb(245, 247, 250)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(242, 246, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(248, 250, 255)"] {
      background-color: #07111f !important;
    }
    :root[data-census-theme="dark"] [style*="background-color: rgb(255, 255, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: white"] {
      background-color: #0f1c2e !important;
    }
    :root[data-census-theme="dark"] [style*="background-color: rgb(241, 245, 249)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(239, 246, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(238, 242, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(240, 253, 250)"] {
      background-color: #14233a !important;
    }
    :root[data-census-theme="dark"] [style*="color: rgb(15, 23, 42)"],
    :root[data-census-theme="dark"] [style*="color: rgb(15, 39, 71)"] {
      color: #f8fafc !important;
    }
    :root[data-census-theme="dark"] [style*="color: rgb(71, 85, 105)"],
    :root[data-census-theme="dark"] [style*="color: rgb(100, 116, 139)"] {
      color: #aebed2 !important;
    }
    :root[data-census-theme="dark"] [style*="border-color: rgb(227, 234, 245)"],
    :root[data-census-theme="dark"] [style*="border-color: rgb(226, 232, 240)"] {
      border-color: #263750 !important;
    }
    :root[data-census-theme="dark"] input,
    :root[data-census-theme="dark"] textarea,
    :root[data-census-theme="dark"] select {
      background: #101f33 !important;
      color: #f8fafc !important;
      border-color: #2a3e5c !important;
    }
    :root[data-census-theme="dark"] input::placeholder,
    :root[data-census-theme="dark"] textarea::placeholder {
      color: #8293aa !important;
    }
    * { scrollbar-width: thin; scrollbar-color: #64748b transparent; }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
