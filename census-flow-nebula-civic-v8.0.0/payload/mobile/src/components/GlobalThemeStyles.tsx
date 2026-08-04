import { Platform } from 'react-native'

/** Shared semantic palette for Expo Web, aligned with the React web application. */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root {
      color-scheme: light;
      --census-page: #F6F4FB;
      --census-page-secondary: #EFEBF6;
      --census-surface: #FFFFFF;
      --census-surface-subtle: #FBF9FE;
      --census-surface-strong: #F1EDF8;
      --census-border: #DED7EB;
      --census-text: #171124;
      --census-text-secondary: #584E6A;
      --census-text-muted: #746986;
      --census-primary: #7C5CFF;
      --census-primary-light: #9A6DFF;
      --census-primary-dark: #5332C4;
      --census-primary-soft: #F3EFFF;
      --census-primary-border: #D1C0FF;
      --census-secondary: #FF5D8F;
      --census-secondary-light: #FF8DB2;
      --census-secondary-dark: #BB315D;
      --census-secondary-soft: #FFF0F5;
      --census-accent: #19C8AD;
      --census-accent-light: #42DBC4;
      --census-accent-dark: #087967;
      --census-accent-soft: #EAFFF9;
      --census-info: #42B8F5;
      --census-purple: #9A6DFF;
      --census-coral: #FF6678;
      --census-navy: #0A2136;
      --census-navy-dark: #051420;
      --census-navy-soft: #12314A;
      --census-success: #28C797;
      --census-success-strong: #169F76;
      --census-success-soft: #EBFFF8;
      --census-warning: #F4B942;
      --census-warning-strong: #D49215;
      --census-warning-soft: #FFF8E6;
      --census-danger: #FF6678;
      --census-danger-strong: #DC3F55;
      --census-danger-soft: #FFF0F1;
      --census-glow-blue: rgba(124,92,255,0.14);
      --census-glow-indigo: rgba(255,93,143,0.10);
      --census-glow-teal: rgba(25,200,173,0.10);
    }

    :root[data-census-theme="dark"] {
      color-scheme: dark;
      --census-page: #04111C;
      --census-page-secondary: #061521;
      --census-surface: #0B2030;
      --census-surface-subtle: #0E2435;
      --census-surface-strong: #183346;
      --census-border: #1B3A4E;
      --census-text: #F8FBFF;
      --census-text-secondary: #D1DCE7;
      --census-text-muted: #94A9BC;
      --census-primary: #A68CFF;
      --census-primary-light: #B89FFF;
      --census-primary-dark: #D0C1FF;
      --census-primary-soft: #251B4D;
      --census-primary-border: #4B397A;
      --census-secondary: #FF77A4;
      --census-secondary-light: #FF9FBE;
      --census-secondary-dark: #FFC0D3;
      --census-secondary-soft: #3A182B;
      --census-accent: #43E1CA;
      --census-accent-light: #68EAD8;
      --census-accent-dark: #A0F4E7;
      --census-accent-soft: #0B3836;
      --census-info: #6CCBFF;
      --census-purple: #C3B2FF;
      --census-coral: #FF96A2;
      --census-navy: #061521;
      --census-navy-dark: #020B13;
      --census-navy-soft: #0B2030;
      --census-success: #5BE0B1;
      --census-success-strong: #89EBC8;
      --census-success-soft: #0D352D;
      --census-warning: #F4C75D;
      --census-warning-strong: #FFE19A;
      --census-warning-soft: #3B2B0E;
      --census-danger: #FF8795;
      --census-danger-strong: #FFB2BA;
      --census-danger-soft: #43202B;
      --census-glow-blue: rgba(166,140,255,0.16);
      --census-glow-indigo: rgba(255,119,164,0.11);
      --census-glow-teal: rgba(67,225,202,0.09);
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
      transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
    }

    input::placeholder, textarea::placeholder {
      color: var(--census-text-muted) !important;
      opacity: 1;
    }

    input:focus, textarea:focus, select:focus {
      outline: none !important;
      border-color: var(--census-primary) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--census-primary) 24%, transparent) !important;
    }

    button, [role="button"] {
      -webkit-tap-highlight-color: transparent;
      transition: transform 170ms cubic-bezier(.2,.8,.2,1), box-shadow 170ms ease,
                  background-color 170ms ease, border-color 170ms ease, opacity 170ms ease;
    }

    @media (hover: hover) and (pointer: fine) {
      button:hover, [role="button"]:hover { transform: translateY(-1px); }
    }

    * {
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: #7C5CFF transparent;
    }

    ::selection {
      background: rgba(124, 92, 255, 0.30);
      color: var(--census-text);
    }

    @keyframes census-soft-enter {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
