import { Platform } from 'react-native'

/**
 * Web-only polish for styles that are created once by React Native Web.
 * The resolved theme is written to data-census-theme by PreferencesContext.
 */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root {
      color-scheme: light;
      --census-page: #F4F7FB;
      --census-surface: #FFFFFF;
      --census-surface-subtle: #F7F9FC;
      --census-border: #DCE5F0;
      --census-text: #0B172A;
      --census-muted: #61738B;
    }

    :root[data-census-theme="dark"] {
      color-scheme: dark;
      --census-page: #07111F;
      --census-surface: #0F1D31;
      --census-surface-subtle: #172942;
      --census-border: #283C59;
      --census-text: #F7FAFF;
      --census-muted: #9FB0C8;
    }

    html, body, #root {
      min-height: 100%;
      background: var(--census-page) !important;
    }

    body {
      margin: 0;
      color: var(--census-text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    :root[data-census-theme="dark"] [style*="background-color: rgb(245, 247, 250)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(244, 247, 251)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(242, 246, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(248, 250, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(248, 250, 252)"] {
      background-color: #07111F !important;
    }

    :root[data-census-theme="dark"] [style*="background-color: rgb(255, 255, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: white"] {
      background-color: #0F1D31 !important;
    }

    :root[data-census-theme="dark"] [style*="background-color: rgb(241, 245, 249)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(239, 246, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(238, 242, 255)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(240, 253, 250)"],
    :root[data-census-theme="dark"] [style*="background-color: rgb(247, 249, 252)"] {
      background-color: #172942 !important;
    }

    :root[data-census-theme="dark"] [style*="color: rgb(15, 23, 42)"],
    :root[data-census-theme="dark"] [style*="color: rgb(11, 23, 42)"],
    :root[data-census-theme="dark"] [style*="color: rgb(15, 39, 71)"] {
      color: #F7FAFF !important;
    }

    :root[data-census-theme="dark"] [style*="color: rgb(71, 85, 105)"],
    :root[data-census-theme="dark"] [style*="color: rgb(79, 97, 120)"],
    :root[data-census-theme="dark"] [style*="color: rgb(100, 116, 139)"],
    :root[data-census-theme="dark"] [style*="color: rgb(120, 139, 163)"] {
      color: #A9B8CC !important;
    }

    :root[data-census-theme="dark"] [style*="border-color: rgb(227, 234, 245)"],
    :root[data-census-theme="dark"] [style*="border-color: rgb(226, 232, 240)"],
    :root[data-census-theme="dark"] [style*="border-color: rgb(220, 229, 240)"] {
      border-color: #283C59 !important;
    }

    :root[data-census-theme="dark"] input,
    :root[data-census-theme="dark"] textarea,
    :root[data-census-theme="dark"] select {
      background: #13243B !important;
      color: #F7FAFF !important;
      border-color: #38506F !important;
      caret-color: #76A9FF;
    }

    :root[data-census-theme="dark"] input::placeholder,
    :root[data-census-theme="dark"] textarea::placeholder {
      color: #8194AD !important;
      opacity: 1;
    }

    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: #76A9FF !important;
      box-shadow: 0 0 0 3px rgba(118, 169, 255, 0.16) !important;
    }

    button, [role="button"] {
      -webkit-tap-highlight-color: transparent;
    }

    * {
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: #64748B transparent;
    }

    ::selection {
      background: rgba(36, 87, 214, 0.24);
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
