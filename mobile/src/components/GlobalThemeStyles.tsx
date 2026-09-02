import { Platform } from 'react-native'

/**
 * Expo Web global layer.
 * Mirrors the approved web Safe Polish and prevents the mobile app from
 * stretching unnaturally when tested in a desktop browser.
 */
export default function GlobalThemeStyles() {
  if (Platform.OS !== 'web') return null

  const css = `
    :root {
      color-scheme: light;
      --census-page:#F7F9FB;
      --census-page-secondary:#EEF3F7;
      --census-surface:#FFFFFF;
      --census-surface-subtle:#F9FBFD;
      --census-surface-strong:#EEF3F7;
      --census-border:#DDE6EE;
      --census-text:#0E1D2A;
      --census-text-secondary:#4D6173;
      --census-text-muted:#6B7E8F;
      --census-primary:#0176D4;
      --census-primary-light:#0282E8;
      --census-primary-dark:#01457D;
      --census-primary-soft:#EEF7FF;
      --census-primary-border:#B8DDFB;
      --census-secondary:#F59E0B;
      --census-secondary-light:#FBD38D;
      --census-secondary-dark:#B45309;
      --census-secondary-soft:#FFF8EB;
      --census-accent:#6C8DAB;
      --census-accent-light:#CBD9E6;
      --census-accent-dark:#2F526F;
      --census-accent-soft:#F6F9FC;
      --census-info:#7FC2F4;
      --census-purple:#0282E8;
      --census-coral:#E11D48;
      --census-navy:#04396C;
      --census-navy-dark:#032F5C;
      --census-navy-soft:#01457D;
      --census-success:#10B981;
      --census-success-strong:#059669;
      --census-success-soft:#ECFDF5;
      --census-warning:#F59E0B;
      --census-warning-strong:#D97706;
      --census-warning-soft:#FFF8EB;
      --census-danger:#E11D48;
      --census-danger-strong:#BE123C;
      --census-danger-soft:#FFF1F2;
      --census-glow-blue:rgba(1,118,212,.10);
      --census-glow-indigo:rgba(245,158,11,.07);
      --census-glow-teal:rgba(2,130,232,.06);
    }

    :root[data-census-theme="dark"] {
      color-scheme: dark;
      --census-page:#0D1625;
      --census-page-secondary:#0B1220;
      --census-surface:#121D2D;
      --census-surface-subtle:#0F1928;
      --census-surface-strong:#1C2A3D;
      --census-border:#293B51;
      --census-text:#F7FAFC;
      --census-text-secondary:#C0CDD9;
      --census-text-muted:#9EADBC;
      --census-primary:#61AFE9;
      --census-primary-light:#82C3F1;
      --census-primary-dark:#B1DCF7;
      --census-primary-soft:#112A48;
      --census-primary-border:#1A4C7B;
      --census-secondary:#E6A44C;
      --census-secondary-light:#F1BC70;
      --census-secondary-dark:#F8D59D;
      --census-secondary-soft:#332719;
      --census-accent:#82C3F1;
      --census-accent-light:#B1DCF7;
      --census-accent-dark:#D9ECFA;
      --census-accent-soft:#112A48;
      --census-info:#82C3F1;
      --census-purple:#82C3F1;
      --census-coral:#FB7185;
      --census-navy:#0D1625;
      --census-navy-dark:#0D3153;
      --census-navy-soft:#121D2D;
      --census-success:#34D399;
      --census-success-strong:#6EE7B7;
      --census-success-soft:#073B32;
      --census-warning:#E6A44C;
      --census-warning-strong:#F1BC70;
      --census-warning-soft:#332719;
      --census-danger:#FB7185;
      --census-danger-strong:#FDA4AF;
      --census-danger-soft:#4C1724;
      --census-glow-blue:rgba(75,145,204,.13);
      --census-glow-indigo:rgba(230,164,76,.07);
      --census-glow-teal:rgba(97,175,233,.07);
    }

    html,body,#root {
      width:100%;
      min-width:0;
      min-height:100%;
      margin:0;
      background:var(--census-page)!important;
      color:var(--census-text);
      overflow-x:hidden;
    }

    body {
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      text-rendering:optimizeLegibility;
    }

    *,*::before,*::after { box-sizing:border-box; }

    input,textarea,select {
      color:var(--census-text)!important;
      -webkit-text-fill-color:var(--census-text)!important;
      caret-color:var(--census-primary)!important;
      transition:border-color .18s ease,box-shadow .18s ease,background-color .32s ease,color .28s ease!important;
    }
    input::placeholder,textarea::placeholder {
      color:var(--census-text-muted)!important;
      -webkit-text-fill-color:var(--census-text-muted)!important;
      opacity:1;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-text-fill-color:var(--census-text)!important;
      -webkit-box-shadow:0 0 0 1000px var(--census-surface-subtle) inset!important;
    }
    input:focus,textarea:focus,select:focus {
      outline:none!important;
      border-color:var(--census-primary)!important;
      box-shadow:0 0 0 3px color-mix(in srgb,var(--census-primary) 22%,transparent)!important;
    }

    button,[role="button"] {
      -webkit-tap-highlight-color:transparent;
      transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease,
                 background-color .30s ease,border-color .30s ease,color .28s ease,opacity .18s ease!important;
    }
    @media (hover:hover) and (pointer:fine) {
      button:hover,[role="button"]:hover { transform:translateY(-1px); }
    }

    /* Theme transition */
    html,body,#root,#root * {
      transition-property:background-color,border-color,color;
      transition-duration:.30s;
      transition-timing-function:ease;
    }

    /*
      Expo Web desktop:
      app remains a real mobile/tablet interface instead of stretching over
      ultra-wide monitors. The root remains full viewport, while screen content
      is constrained by shared React Native maxWidth styles.
    */
    @media (min-width:1200px) {
      body { background:var(--census-page-secondary)!important; }
      #root {
        width:100%;
        min-height:100vh;
        margin:0 auto;
        background:var(--census-page)!important;
      }
    }

    @media (max-width:900px) {
      html,body,#root { width:100%!important; max-width:100%!important; }
      input,textarea,select,button { max-width:100%!important; }
    }

    @media (max-width:560px) {
      body { overflow-x:hidden!important; }
      #root { min-height:100dvh; }
    }

    ::selection {
      background:color-mix(in srgb,var(--census-primary) 25%,transparent);
      color:var(--census-text);
    }

    * {
      scrollbar-width:thin;
      scrollbar-color:var(--census-primary) transparent;
    }

    @keyframes census-soft-enter {
      from { opacity:0; transform:translateY(8px); }
      to { opacity:1; transform:none; }
    }


    /* =========================================================
       MOBILE APP ON DESKTOP: never stretch to full desktop width.
       The outer desktop viewport becomes a neutral canvas while the
       Expo app remains a centered mobile/tablet surface.
       ========================================================= */
    @media (min-width: 901px) {
      body {
        background: var(--census-page-secondary) !important;
      }

      #root {
        width: min(680px, calc(100vw - 48px)) !important;
        max-width: 680px !important;
        min-height: 100vh !important;
        margin: 0 auto !important;
        background: var(--census-page) !important;
        box-shadow: 0 0 0 1px var(--census-border),
                    0 24px 70px rgba(1,69,125,.12) !important;
        overflow-x: hidden !important;
      }

      #root > div {
        width: 100% !important;
        max-width: 680px !important;
        min-width: 0 !important;
        margin: 0 auto !important;
      }
    }

    @media (min-width: 701px) and (max-width: 900px) {
      #root,
      #root > div {
        width: 100% !important;
        max-width: 820px !important;
        margin: 0 auto !important;
      }
    }

    @media (max-width: 700px) {
      #root,
      #root > div {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
    }

    /* Prevent React Native Web flex children from forcing desktop-width cards. */
    #root [style*="display: flex"],
    #root [style*="display:flex"] {
      min-width: 0 !important;
      max-width: 100%;
    }

    #root input,
    #root textarea,
    #root select,
    #root button {
      max-width: 100% !important;
    }

    @media (prefers-reduced-motion:reduce) {
      *,*::before,*::after {
        animation-duration:.01ms!important;
        animation-iteration-count:1!important;
        transition-duration:.01ms!important;
        scroll-behavior:auto!important;
      }
    }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
