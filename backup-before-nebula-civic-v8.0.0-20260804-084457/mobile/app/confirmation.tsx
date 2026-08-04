import { useLocalSearchParams, useRouter } from 'expo-router'
import { Check, CloudOff, UserPlus } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import PrimaryButton from '../src/components/PrimaryButton'
import { colors, radius, spacing } from '../src/styles/theme'
import { usePreferences } from '../src/preferences/PreferencesContext'

export default function ConfirmationScreen() {
  const router = useRouter()
  const { t } = usePreferences()
  const params = useLocalSearchParams<{ code?: string; queued?: string; localId?: string }>()
  const queued = params.queued === 'true'

  return (
    <View style={styles.screen}>
      <View style={[styles.icon, { backgroundColor: queued ? colors.warningSoft : colors.successSoft }]}>
        {queued ? <CloudOff color={colors.warning} size={52} /> : <Check color={colors.success} size={52} />}
      </View>
      <Text style={styles.title}>{queued ? t('offlineSaved') : t('onlineSaved')}</Text>
      <Text style={styles.text}>{queued ? t('pendingSend') : t('sentServer')}</Text>
      <Text style={styles.label}>{t('householdCode')}</Text>
      <Text style={styles.code}>{params.code}</Text>
      <Text style={styles.question}>{t('addCitizenNowQuestion')}</Text>
      <View style={styles.buttons}>
        {params.localId ? (
          <PrimaryButton
            title={t('addCitizenNow')}
            icon={UserPlus}
            onPress={() => router.replace({
              pathname: '/households/new',
              params: { editId: params.localId, startCitizen: 'true' },
            })}
          />
        ) : null}
        <Pressable style={styles.secondary} onPress={() => router.replace('/(tabs)/households')}>
          <Text style={styles.secondaryText}>{t('viewHouseholds')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 24 },
  text: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 10, maxWidth: 320 },
  label: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 30 },
  code: { fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 6 },
  question: { marginTop: 22, fontSize: 14, fontWeight: '800', color: colors.text, textAlign: 'center' },
  buttons: { position: 'absolute', left: 20, right: 20, bottom: 30, gap: 10 },
  secondary: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.textSoft, fontWeight: '800' },
})
