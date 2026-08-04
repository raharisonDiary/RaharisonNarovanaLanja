import NetInfo from '@react-native-community/netinfo'
import { useFocusEffect } from 'expo-router'
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Database,
  RefreshCw,
  UsersRound,
  Wifi,
  WifiOff,
} from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  type ColorValue,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  AuroraBackground,
  AuroraCard,
  GradientSurface,
} from '../../src/components/AuroraSurface'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { usePreferences } from '../../src/preferences/PreferencesContext'
import { getQueue, markPending, type QueueItem } from '../../src/storage/database'
import { syncPending } from '../../src/sync/syncService'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
  spacing,
} from '../../src/styles/theme'

export default function SyncScreen() {
  const { t } = usePreferences()
  const [items, setItems] = useState<QueueItem[]>([])
  const [online, setOnline] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)

  const load = useCallback(async () => {
    setItems(await getQueue())
    setOnline((await NetInfo.fetch()).isConnected)
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const start = async () => {
    setSyncing(true)
    setProgress(0)
    for (const item of items) {
      if (item.status === 'failed') await markPending(item.id)
    }
    try {
      const result = await syncPending((done, total) =>
        setProgress(total ? done / total : 1),
      )
      await load()
      if (result.errors === 0) setProgress(1)
    } finally {
      setSyncing(false)
    }
  }

  const failed = items.filter((item) => item.status === 'failed').length
  const citizens = items.reduce((sum, item) => sum + item.payload.persons.length, 0)

  return (
    <AuroraBackground>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Centre de synchronisation"
          title={t('globalSync')}
          subtitle={online ? t('networkReady') : t('offlineProtected')}
        />

        <GradientSurface
          variant={online ? 'aurora' : 'primary'}
          style={styles.cloud}
        >
          <View style={styles.networkPill}>
            {online ? (
              <Wifi color="#5EEAD4" size={15} />
            ) : (
              <WifiOff color="#FDE68A" size={15} />
            )}
            <Text style={styles.networkPillText}>
              {online ? 'Connecté' : 'Mode hors ligne'}
            </Text>
          </View>
          <View style={styles.cloudIcon}>
            {online ? (
              <CloudUpload color="#FFFFFF" size={46} />
            ) : (
              <WifiOff color="#FFFFFF" size={46} />
            )}
          </View>
          <Text style={styles.cloudTitle}>
            {syncing
              ? t('sendingData')
              : items.length
                ? t('localReady')
                : t('allSynced')}
          </Text>
          <Text style={styles.cloudText}>{t('statsWaitValidation')}</Text>
          {syncing ? (
            <View style={styles.progress}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
          ) : null}
          <Text style={styles.progressLabel}>
            {syncing ? `${Math.round(progress * 100)}%` : `${items.length} élément(s) local(aux)`}
          </Text>
        </GradientSurface>

        <View style={styles.stats}>
          <Stat
            icon={Database}
            label={t('localHouseholds')}
            value={`${items.length}`}
            color={colors.primary}
            background={colors.primarySoft}
          />
          <Stat
            icon={UsersRound}
            label={t('localCitizens')}
            value={`${citizens}`}
            color={colors.secondary}
            background={colors.secondarySoft}
          />
          <Stat
            icon={AlertCircle}
            label={t('errors')}
            value={`${failed}`}
            color={colors.danger}
            background={colors.dangerSoft}
          />
        </View>

        <PrimaryButton
          title={items.length ? t('syncNow') : t('refresh')}
          icon={items.length ? RefreshCw : CheckCircle2}
          loading={syncing}
          disabled={!online}
          onPress={() => void (items.length ? start() : load())}
        />

        {items.length > 0 ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Données en attente</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{items.length}</Text>
            </View>
          </View>
        ) : null}

        {items.map((item) => (
          <AuroraCard key={item.id} style={styles.item}>
            <View
              style={[
                styles.itemIcon,
                {
                  backgroundColor:
                    item.status === 'failed'
                      ? colors.dangerSoft
                      : colors.primarySoft,
                },
              ]}
            >
              {item.status === 'failed' ? (
                <AlertCircle color={colors.danger} size={20} />
              ) : (
                <CloudUpload color={colors.primary} size={20} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {item.payload.household.referenceCode}
              </Text>
              <Text style={styles.itemLocation}>
                {item.payload.location.fokontanyName}
              </Text>
              <Text style={styles.itemText}>
                {item.payload.persons.length} {t('citizenCount')} · {item.status} ·{' '}
                {new Date(item.createdAt).toLocaleString('fr-FR')}
              </Text>
              {item.lastError ? (
                <Text style={styles.itemError}>{item.lastError}</Text>
              ) : null}
            </View>
          </AuroraCard>
        ))}
      </ScrollView>
    </AuroraBackground>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
  background,
}: {
  icon: typeof Database
  label: string
  value: string
  color: string
  background: ColorValue
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: background }]}>
        <Icon color={color} size={19} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 116,
  },
  cloud: {
    minHeight: 268,
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...floatingShadow,
  },
  networkPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  networkPillText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  cloudIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.20)',
    marginTop: 18,
  },
  cloudTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 14,
    textAlign: 'center',
  },
  cloudText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#E0E7FF',
    marginTop: 6,
    textAlign: 'center',
  },
  progress: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,.20)',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#5EEAD4', borderRadius: 999 },
  progressLabel: { color: colors.primaryMist, fontSize: 9, fontWeight: '800', marginTop: 7 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    minHeight: 122,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    backgroundColor: colors.white,
    ...softShadow,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 8 },
  statLabel: { fontSize: 8, color: colors.muted, marginTop: 2, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  countPill: {
    minWidth: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  countPillText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  item: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    ...softShadow,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontWeight: '900', color: colors.text },
  itemLocation: { fontSize: 10, color: colors.primary, fontWeight: '800', marginTop: 3 },
  itemText: { fontSize: 9, color: colors.muted, marginTop: 4, lineHeight: 14 },
  itemError: { fontSize: 9, color: colors.danger, marginTop: 5, fontWeight: '700' },
})
