import { ArrowRight, BarChart3, CheckCircle2, Globe2, MapPinned, ShieldCheck, Smartphone, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { publicApi } from '../api/resources'
import Brand from '../components/common/Brand'
import PreferencesControls from '../components/common/PreferencesControls'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/useI18n'
import { formatDate, formatNumber } from '../utils/format'

export default function HomePage() {
  const { t } = useI18n()
  const overview = useAsync(() => publicApi.overview(), [])
  const stats = overview.data
  return (
    <main className="public-home">
      <header className="public-nav">
        <Brand />
        <nav><a href="#platform">{t('platform')}</a><a href="#mission">{t('missions')}</a><a href="#results">{t('completedCampaigns')}</a></nav>
        <div className="public-nav__actions"><PreferencesControls compact /><Link className="button button--primary" to="/login">{t('login')}<ArrowRight size={17} /></Link></div>
      </header>

      <section className="public-hero">
        <div className="public-hero__copy fade-in-up">
          <span className="eyebrow"><Globe2 size={15} /> {t('publicPortal')}</span>
          <h1>Population <em>Flow</em><br />{t('heroTitleLine1')}<br />{t('heroTitleLine2')}</h1>
          <p>{t('publicIntro')}</p>
          <div className="public-hero__actions"><Link className="button button--primary button--large" to="/login">{t('getStarted')}<ArrowRight size={18} /></Link><a className="button button--ghost button--large" href="#platform">{t('discover')}</a></div>
          <div className="public-trust"><span><CheckCircle2 size={16} />{t('trustGps')}</span><span><CheckCircle2 size={16} />{t('trustValidation')}</span><span><CheckCircle2 size={16} />{t('trustCentralized')}</span></div>
        </div>
        <div className="public-hero__visual" aria-hidden="true">
          <div className="globe-orbit"><Globe2 size={150} /><i className="orbit orbit--one" /><i className="orbit orbit--two" /><span className="map-pin map-pin--one"><MapPinned size={18} /></span><span className="map-pin map-pin--two"><MapPinned size={18} /></span></div>
          <article className="floating-card floating-card--top"><Smartphone size={22} /><div><strong>{t('guidedCollection')}</strong><small>{t('questionByQuestion')}</small></div></article>
          <article className="floating-card floating-card--bottom"><BarChart3 size={22} /><div><strong>{t('reliableAnalysis')}</strong><small>{t('validatedBeforePublication')}</small></div></article>
        </div>
      </section>

      <section className="public-metrics" id="results">
        <article><strong>{formatNumber(stats?.completedCampaigns ?? 0)}</strong><span>{t('completedCampaigns')}</span></article>
        <article><strong>{formatNumber(stats?.validatedHouseholds ?? 0)}</strong><span>{t('validatedHouseholds')}</span></article>
        <article><strong>{formatNumber(stats?.validatedCitizens ?? 0)}</strong><span>{t('validatedCitizens')}</span></article>
      </section>

      <section className="public-section" id="platform">
        <header><span className="eyebrow">Census Flow</span><h2>{t('fieldReady')}</h2><p>{t('platformMissionLead')}</p></header>
        <div className="feature-grid">
          <article><span><WifiOff size={24} /></span><h3>{t('offlineFirst')}</h3><p>{t('offlineFirstText')}</p></article>
          <article><span><BarChart3 size={24} /></span><h3>{t('liveMonitoring')}</h3><p>{t('liveMonitoringText')}</p></article>
          <article><span><ShieldCheck size={24} /></span><h3>{t('privacy')}</h3><p>{t('privacyText')}</p></article>
        </div>
      </section>

      <section className="mission-band" id="mission"><div><span className="eyebrow">{t('publicImpact')}</span><h2>{t('missionTitle')}</h2><p>{t('missionText')}</p></div><Link to="/login" className="button button--light button--large">{t('getStarted')}<ArrowRight size={18} /></Link></section>

      <section className="public-section public-campaigns"><header><span className="eyebrow">{t('transparency')}</span><h2>{t('latestCompleted')}</h2></header>{overview.loading ? <p>{t('loading')}</p> : stats?.campaigns.length ? <div className="completed-grid">{stats.campaigns.map((campaign) => <article key={campaign.id}><span className="campaign-check"><CheckCircle2 size={19} /></span><div><h3>{campaign.name}</h3><p>{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</p></div><strong>{t('completed')}</strong></article>)}</div> : <div className="empty-public">{t('noCompletedCampaign')}</div>}</section>

      <footer className="public-footer"><Brand /><p>© {new Date().getFullYear()} Census Flow · {t('footerRights')}</p><div><a href="#platform">{t('privacyPolicy')}</a><a href="mailto:support@census.mg">{t('help')}</a></div></footer>
    </main>
  )
}
