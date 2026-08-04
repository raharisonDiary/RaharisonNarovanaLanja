import { Platform } from 'react-native'

/**
 * Shared web theme for the Expo web build.
 * It mirrors the native semantic palette and adds restrained, professional
 * motion with reduced-motion support.
 */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root {
      color-scheme: light;
      --census-page: #F6F8FC;
      --census-page-secondary: #EDF1F7;
      --census-surface: #FFFFFF;
      --census-surface-subtle: #F8FAFD;
      --census-surface-strong: #EEF2F7;
      --census-border: #E1E7EF;
      --census-text: #0F172A;
      --census-text-secondary: #475569;
      --census-text-muted: #718096;
      --census-primary: #F4B400;
      --census-primary-light: #FFD34E;
      --census-primary-dark: #B77900;
      --census-primary-soft: #FFF4CC;
      --census-primary-border: #F1D16A;
      --census-secondary: #1D3557;
      --census-secondary-light: #476789;
      --census-secondary-dark: #0B172A;
      --census-secondary-soft: #E8EEF6;
      --census-accent: #0F766E;
      --census-accent-light: #14B8A6;
      --census-accent-dark: #0B5C56;
      --census-accent-soft: #E5F7F4;
      --census-info: #2563EB;
      --census-purple: #6D5BD0;
      --census-coral: #E86657;
      --census-navy: #0B172A;
      --census-navy-dark: #050B14;
      --census-navy-soft: #13233B;
      --census-success: #168653;
      --census-success-strong: #116B43;
      --census-success-soft: #EAF8F0;
      --census-warning: #B77900;
      --census-warning-strong: #8A5A00;
      --census-warning-soft: #FFF4D6;
      --census-danger: #C83A46;
      --census-danger-strong: #A92E39;
      --census-danger-soft: #FDECEF;
      --census-glow-blue: rgba(244,180,0,0.11);
      --census-glow-indigo: rgba(29,53,87,0.08);
      --census-glow-teal: rgba(15,118,110,0.08);
    }

    :root[data-census-theme="dark"] {
      color-scheme: dark;
      --census-page: #070E1A;
      --census-page-secondary: #0A1322;
      --census-surface: #0F1B2D;
      --census-surface-subtle: #17273F;
      --census-surface-strong: #1D2F4A;
      --census-border: #2A3B55;
      --census-text: #F8FAFC;
      --census-text-secondary: #CBD5E1;
      --census-text-muted: #9AA9BE;
      --census-primary: #FFD34E;
      --census-primary-light: #FFE083;
      --census-primary-dark: #F4B400;
      --census-primary-soft: #3A2A05;
      --census-primary-border: #72570F;
      --census-secondary: #93A4BF;
      --census-secondary-light: #B7C4D8;
      --census-secondary-dark: #D6DEEA;
      --census-secondary-soft: #1C2B42;
      --census-accent: #2DD4BF;
      --census-accent-light: #5EEAD4;
      --census-accent-dark: #7DE9DD;
      --census-accent-soft: #113B37;
      --census-info: #7DB4FF;
      --census-purple: #C3B9FF;
      --census-coral: #FFA397;
      --census-navy: #08111F;
      --census-navy-dark: #02060D;
      --census-navy-soft: #101B2D;
      --census-success: #57D695;
      --census-success-strong: #78E3AC;
      --census-success-soft: #12392A;
      --census-warning: #FFD166;
      --census-warning-strong: #FFE29A;
      --census-warning-soft: #3D2E10;
      --census-danger: #FF8791;
      --census-danger-strong: #FFABB2;
      --census-danger-soft: #43202B;
      --census-glow-blue: rgba(255,211,78,0.10);
      --census-glow-indigo: rgba(108,130,163,0.08);
      --census-glow-teal: rgba(45,212,191,0.07);
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
      transition: transform 170ms cubic-bezier(.2,.8,.2,1),
                  box-shadow 170ms ease,
                  background-color 170ms ease,
                  border-color 170ms ease,
                  opacity 170ms ease;
    }

    @media (hover: hover) and (pointer: fine) {
      button:hover, [role="button"]:hover {
        transform: translateY(-1px);
      }
    }

    * {
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: #64748B transparent;
    }

    ::selection {
      background: rgba(244, 180, 0, 0.28);
      color: #0B172A;
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
