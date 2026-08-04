import { Platform } from 'react-native'

/**
 * Defines the same semantic palette used by React Native StyleSheets.
 * Existing screens reference CSS variables through src/styles/theme.ts,
 * so a theme change updates every page without brittle selector hacks.
 */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root {
      color-scheme: light;
      --census-page: #F4F7FB;
      --census-page-secondary: #ECF2F9;
      --census-surface: #FFFFFF;
      --census-surface-subtle: #F7F9FC;
      --census-surface-strong: #EDF2F8;
      --census-border: #DCE5F0;
      --census-text: #0B172A;
      --census-text-secondary: #4F6178;
      --census-text-muted: #788BA3;
      --census-primary: #2457D6;
      --census-primary-light: #3B82F6;
      --census-primary-dark: #1948C2;
      --census-primary-soft: #EAF1FF;
      --census-primary-border: #BFD1FF;
      --census-secondary: #615AD9;
      --census-secondary-light: #818CF8;
      --census-secondary-dark: #4F46E5;
      --census-secondary-soft: #EFEEFF;
      --census-accent: #0E9F8F;
      --census-accent-light: #2DD4BF;
      --census-accent-dark: #0B7E73;
      --census-accent-soft: #E7F8F5;
      --census-info: #1476A8;
      --census-purple: #7C3AED;
      --census-coral: #E86657;
      --census-navy: #0B1930;
      --census-navy-dark: #061226;
      --census-navy-soft: #122440;
      --census-success: #168653;
      --census-success-strong: #116B43;
      --census-success-soft: #EAF8F0;
      --census-warning: #C06A0A;
      --census-warning-strong: #995006;
      --census-warning-soft: #FFF4E2;
      --census-danger: #C83A46;
      --census-danger-strong: #A92E39;
      --census-danger-soft: #FDECEF;
      --census-glow-blue: rgba(36,87,214,0.10);
      --census-glow-indigo: rgba(97,90,217,0.09);
      --census-glow-teal: rgba(14,159,143,0.09);
    }

    :root[data-census-theme="dark"] {
      color-scheme: dark;
      --census-page: #07111F;
      --census-page-secondary: #0A1627;
      --census-surface: #0F1D31;
      --census-surface-subtle: #172942;
      --census-surface-strong: #1C304B;
      --census-border: #283C59;
      --census-text: #F7FAFF;
      --census-text-secondary: #C1CCDC;
      --census-text-muted: #91A4BD;
      --census-primary: #76A9FF;
      --census-primary-light: #90B9FF;
      --census-primary-dark: #AFCBFF;
      --census-primary-soft: #17315A;
      --census-primary-border: #365B92;
      --census-secondary: #A5A0FF;
      --census-secondary-light: #BCB8FF;
      --census-secondary-dark: #C7C4FF;
      --census-secondary-soft: #2A2855;
      --census-accent: #3AD4C2;
      --census-accent-light: #67E8D6;
      --census-accent-dark: #7AE9DC;
      --census-accent-soft: #123D3B;
      --census-info: #65C5F2;
      --census-purple: #C4B5FD;
      --census-coral: #FFA397;
      --census-navy: #081427;
      --census-navy-dark: #030B17;
      --census-navy-soft: #10223B;
      --census-success: #57D695;
      --census-success-strong: #78E3AC;
      --census-success-soft: #12392A;
      --census-warning: #F4B45F;
      --census-warning-strong: #FFD08A;
      --census-warning-soft: #3E2D16;
      --census-danger: #FF8791;
      --census-danger-strong: #FFABB2;
      --census-danger-soft: #43202B;
      --census-glow-blue: rgba(75,132,255,0.12);
      --census-glow-indigo: rgba(127,119,255,0.10);
      --census-glow-teal: rgba(50,211,193,0.08);
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

    input, textarea, select {
      color: var(--census-text) !important;
      caret-color: var(--census-primary);
    }

    input::placeholder, textarea::placeholder {
      color: var(--census-text-muted) !important;
      opacity: 1;
    }

    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: var(--census-primary) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--census-primary) 18%, transparent) !important;
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
