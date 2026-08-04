import { useRouter } from 'expo-router'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Cloud,
  Globe2,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trees,
  UsersRound,
  WifiOff,
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  type ColorValue,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { mobileApi } from '../src/api/resources'
import { useAuth } from '../src/auth/AuthContext'
import {
  AuroraBackground,
  AuroraCard,
  GradientSurface,
} from '../src/components/AuroraSurface'
import Brand from '../src/components/Brand'
import ProgressRing from '../src/components/ProgressRing'
import { usePreferences } from '../src/preferences/PreferencesContext'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
  spacing,
  typography,
} from '../src/styles/theme'
import type { PublicOverviewDto } from '../src/types/api'

export default function PublicLanding() {
  const router = useRouter()
  const { user } = useAuth()
  const { t, language, setLanguage } = usePreferences()
  const [overview, setOverview] = useState<PublicOverviewDto | null>(null)

  useEffect(() => {
    void mobileApi.publicOverview().then(setOverview).catch(() => undefined)
  }, [])

  const households = overview?.validatedHouseholds ?? 0
  const citizens = overview?.validatedCitizens ?? 0
  const completedCampaigns = overview?.completedCampaigns ?? 0
  const progress = Math.min(
    100,
    Math.max(0, completedCampaigns > 0 ? 68 : households > 0 ? 42 : 0),
  )

  return (
    <AuroraBackground dense>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nav}>
          <Brand />
          <View style={styles.navActions}>
            <View style={styles.languages}>
              <Globe2 color={colors.primary} size={15} />
              {(['mg', 'fr', 'en'] as const).map((value) => (
                <Pressable
                  key={value}
                  style={[styles.lang, language === value && styles.langActive]}
                  onPress={() => setLanguage(value)}
                >
                  <Text
                    style={[
                      styles.langText,
                      language === value && styles.langTextActive,
                    ]}
                  >
                    {value.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={user ? 'Ouvrir le tableau de bord' : 'Se connecter'}
              onPress={() => router.push(user ? '/(tabs)' : '/login')}
              style={({ pressed }) => [
                styles.loginTop,
                pressed && styles.loginTopPressed,
              ]}
            >
              <Text style={styles.loginTopText}>
                {user ? 'Ouvrir' : 'Connexion'}
              </Text>
            </Pressable>
          </View>
        </View>

        <GradientSurface variant="hero" style={styles.heroVisual}>
          <View style={styles.heroCloudOne} />
          <View style={styles.heroCloudTwo} />
          <View style={styles.sun}>
            <Sparkles color="#FFFFFF" size={20} />
          </View>
          <View style={styles.cityRow}>
            <View style={[styles.building, styles.buildingSmall]}>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
            <View style={[styles.building, styles.buildingTall]}>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
            <View style={[styles.building, styles.buildingMedium]}>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
          </View>
          <View style={styles.landscape}>
            <Trees color="#A7F3D0" size={58} />
            <View style={styles.enumerator}>
              <View style={styles.enumeratorHead} />
              <View style={styles.enumeratorBody}>
                <View style={styles.tablet} />
              </View>
            </View>
            <View style={styles.community}>
              <UsersRound color="#FFFFFF" size={42} />
            </View>
          </View>
          <View style={styles.heroBadge}>
            <MapPin color={colors.accent} size={15} />
            <Text style={styles.heroBadgeText}>Madagascar</Text>
          </View>
        </GradientSurface>

        <View style={styles.heroCopy}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerLine} />
            <Text style={styles.kicker}>{t('publicKicker')}</Text>
          </View>
          <Text style={styles.title}>{t('publicTitle')}</Text>
          <Text style={styles.text}>{t('publicText')}</Text>
        </View>

        <AuroraCard style={styles.showcaseCard}>
          <Image
            source={require('../assets/census-flow-showcase.jpg')}
            resizeMode="cover"
            style={styles.showcaseImage}
            accessibilityLabel="Aperçu responsive de Census Flow"
          />
          <View style={styles.showcaseCaption}>
            <View>
              <Text style={styles.showcaseEyebrow}>UNE SEULE PLATEFORME</Text>
              <Text style={styles.showcaseTitle}>Du terrain à la décision</Text>
            </View>
            <View style={styles.showcaseDot} />
          </View>
        </AuroraCard>

        <AuroraCard style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={styles.progressCopy}>
              <Text style={styles.cardEyebrow}>PROGRESSION NATIONALE</Text>
              <Text style={styles.cardTitle}>Recensement de la population</Text>
              <Text style={styles.cardSubtitle}>
                Données validées et synchronisées
              </Text>
            </View>
            <StatusDot />
          </View>
          <View style={styles.progressBody}>
            <ProgressRing value={progress} label="Terminé" />
            <View style={styles.progressStats}>
              <ProgressMetric
                icon={Home}
                label={t('totalHouseholds')}
                value={households}
                tone={colors.primary}
              />
              <ProgressMetric
                icon={UsersRound}
                label={t('totalCitizens')}
                value={citizens}
                tone={colors.secondary}
              />
            </View>
          </View>
          <View style={styles.updatedRow}>
            <Cloud color={colors.accent} size={14} />
            <Text style={styles.updatedText}>Mise à jour en temps réel</Text>
          </View>
        </AuroraCard>

        <View style={styles.stats}>
          <PublicStat
            icon={BarChart3}
            label={t('completedCampaigns')}
            value={completedCampaigns}
            tone={colors.primary}
            soft={colors.primarySoft}
          />
          <PublicStat
            icon={Building2}
            label={t('totalHouseholds')}
            value={households}
            tone={colors.secondary}
            soft={colors.secondarySoft}
          />
          <PublicStat
            icon={UsersRound}
            label={t('totalCitizens')}
            value={citizens}
            tone={colors.accent}
            soft={colors.accentSoft}
          />
        </View>

        <GradientSurface variant="primary" style={styles.callout}>
          <View style={styles.calloutIcon}>
            <ShieldCheck color="#FFFFFF" size={24} />
          </View>
          <View style={styles.calloutCopy}>
            <Text style={styles.calloutTitle}>Chaque donnée compte.</Text>
            <Text style={styles.calloutText}>
              Une collecte fiable pour des décisions publiques plus justes.
            </Text>
          </View>
        </GradientSurface>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.push(user ? '/(tabs)' : '/login')}
        >
          <View>
            <Text style={styles.ctaLabel}>CENSUS FLOW</Text>
            <Text style={styles.ctaText}>{user ? t('home') : 'Se connecter'}</Text>
          </View>
          <View style={styles.ctaArrow}>
            <ArrowRight color="#FFFFFF" size={20} />
          </View>
        </Pressable>

        <View style={styles.features}>
          <Feature
            icon={WifiOff}
            title={t('offlineFirst')}
            text={t('offlineFirstText')}
          />
          <Feature
            icon={ShieldCheck}
            title={t('controlledData')}
            text={t('controlledDataText')}
          />
          <Feature
            icon={CheckCircle2}
            title={t('clearDecisions')}
            text={t('clearDecisionsText')}
          />
        </View>

        <Text style={styles.footer}>
          Census Flow · Madagascar · {new Date().getFullYear()}
        </Text>
      </ScrollView>
    </AuroraBackground>
  )
}

function StatusDot() {
  return (
    <View style={styles.statusPill}>
      <View style={styles.statusDot} />
      <Text style={styles.statusText}>Actif</Text>
    </View>
  )
}

function ProgressMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Home
  label: string
  value: number
  tone: string
}) {
  return (
    <View style={styles.progressMetric}>
      <View style={[styles.metricIcon, { backgroundColor: `${tone}16` }]}>
        <Icon color={tone} size={17} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.metricValue}>{value.toLocaleString('fr-FR')}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  )
}

function PublicStat({
  icon: Icon,
  label,
  value,
  tone,
  soft,
}: {
  icon: typeof BarChart3
  label: string
  value: number
  tone: string
  soft: ColorValue
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: soft }]}>
        <Icon color={tone} size={19} />
      </View>
      <Text style={styles.statValue}>{value.toLocaleString('fr-FR')}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof WifiOff
  title: string
  text: string
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Icon color={colors.primary} size={21} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  languages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 4,
    paddingLeft: 9,
    backgroundColor: colors.white,
    ...softShadow,
  },
  lang: { borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 6 },
  langActive: { backgroundColor: colors.primary },
  langText: { fontSize: 8, fontWeight: '900', color: colors.muted },
  langTextActive: { color: colors.navy },
  loginTop: {
    minHeight: 38,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...softShadow,
  },
  loginTopPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  loginTopText: { color: colors.navy, fontSize: 10, fontWeight: '900' },
  heroVisual: {
    minHeight: 250,
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    ...floatingShadow,
  },
  heroCloudOne: {
    position: 'absolute',
    width: 110,
    height: 32,
    borderRadius: 999,
    top: 27,
    left: 35,
    backgroundColor: 'rgba(255,255,255,.18)',
  },
  heroCloudTwo: {
    position: 'absolute',
    width: 76,
    height: 22,
    borderRadius: 999,
    top: 61,
    right: 28,
    backgroundColor: 'rgba(255,255,255,.12)',
  },
  sun: {
    position: 'absolute',
    top: 24,
    right: 26,
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.22)',
  },
  cityRow: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 52,
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  building: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'rgba(255,255,255,.24)',
    padding: 7,
    gap: 7,
  },
  buildingSmall: { width: 64, height: 72 },
  buildingTall: { width: 78, height: 118 },
  buildingMedium: { flex: 1, height: 91 },
  windowRow: { flexDirection: 'row', gap: 6 },
  window: {
    flex: 1,
    height: 13,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,.50)',
  },
  landscape: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    height: 70,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  enumerator: { alignItems: 'center', marginLeft: 4 },
  enumeratorHead: {
    width: 23,
    height: 23,
    borderRadius: 999,
    backgroundColor: '#F8D5B5',
  },
  enumeratorBody: {
    width: 44,
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablet: {
    width: 22,
    height: 29,
    borderRadius: 5,
    backgroundColor: colors.primaryMist,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  community: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    left: 18,
    top: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,.92)',
  },
  heroBadgeText: { color: colors.navy, fontSize: 10, fontWeight: '900' },
  heroCopy: { alignItems: 'center', paddingTop: spacing.xl },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerLine: { width: 24, height: 2, borderRadius: 999, backgroundColor: colors.accent },
  kicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.accentDark,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    ...typography.hero,
    letterSpacing: -1.55,
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    marginTop: 13,
    maxWidth: 360,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  progressCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    ...softShadow,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressCopy: { flex: 1 },
  cardEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 4 },
  cardSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: colors.successSoft,
  },
  statusDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.success },
  statusText: { color: colors.successDark, fontSize: 9, fontWeight: '900' },
  progressBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  progressStats: { flex: 1, gap: 10 },
  progressMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    padding: 9,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: { color: colors.text, fontWeight: '900', fontSize: 15 },
  metricLabel: { color: colors.muted, fontSize: 9, marginTop: 1 },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  updatedText: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 13,
    ...softShadow,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 3 },
  statLabel: { color: colors.muted, fontSize: 8, textAlign: 'center', lineHeight: 12 },
  callout: {
    minHeight: 104,
    marginTop: spacing.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: radius.lg,
  },
  calloutIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.20)',
  },
  calloutCopy: { flex: 1 },
  calloutTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  calloutText: { color: '#E0E7FF', fontSize: 10, lineHeight: 16, marginTop: 4 },
  cta: {
    minHeight: 64,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    ...floatingShadow,
  },
  ctaPressed: { transform: [{ scale: 0.988 }], opacity: 0.94 },
  ctaLabel: { color: '#F3EFFF', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: '900', marginTop: 2 },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.14)',
  },
  features: { gap: 10, marginTop: spacing.xl },
  feature: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontWeight: '900', color: colors.text },
  featureText: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4 },
  showcaseCard: { padding: 6, borderRadius: radius.xl },
  showcaseImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.lg },
  showcaseCaption: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  showcaseEyebrow: { color: colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  showcaseTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 3 },
  showcaseDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: colors.accent },
  footer: { marginTop: 26, textAlign: 'center', fontSize: 10, color: colors.muted },
})
