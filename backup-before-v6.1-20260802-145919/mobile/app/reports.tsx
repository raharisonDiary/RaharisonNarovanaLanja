import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, FileSpreadsheet, Share2 } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import PrimaryButton from '../src/components/PrimaryButton'
import SelectField from '../src/components/SelectField'
import { tr } from '../src/i18n/text'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type { CampaignDto } from '../src/types/api'

export default function ReportsScreen() {
  const router = useRouter()
  const { language } = usePreferences()
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { void mobileApi.campaigns().then((rows) => { setCampaigns(rows); setCampaignId(rows[0]?.id ?? '') }) }, [])

  const exportCsv = async (resource: 'dwellings' | 'households' | 'persons') => {
    if (!campaignId) return
    setBusy(resource); setError('')
    try {
      const csv = await mobileApi.report(campaignId, resource)
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = `${resource}.csv`; link.click(); URL.revokeObjectURL(url)
      } else {
        await Share.share({ title: `${resource}.csv`, message: csv })
      }
    } catch (exception) { setError(messageFromError(exception)) }
    finally { setBusy('') }
  }

  const resources = [
    ['dwellings', tr(language, 'Habitations', 'Trano', 'Dwellings')],
    ['households', tr(language, 'Ménages', 'Tokantrano', 'Households')],
    ['persons', tr(language, 'Citoyens', 'Olom-pirenena', 'Citizens')],
  ] as const
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}><Pressable style={styles.back} onPress={() => router.back()}><ArrowLeft color={colors.text} size={21} /></Pressable><View><Text style={styles.title}>{tr(language, 'Rapports', 'Tatitra', 'Reports')}</Text><Text style={styles.subtitle}>{tr(language, 'Exporter les mêmes données CSV que sur le web.', 'Hamoaka CSV mitovy amin’ny web.', 'Export the same CSV data as the web app.')}</Text></View></View>
    <SelectField label={tr(language, 'Campagne', 'Fanisana', 'Campaign')} value={campaignId} onChange={setCampaignId} options={campaigns.map((item) => ({ label: item.name, value: item.id }))} />
    {resources.map(([resource, label]) => <View key={resource} style={styles.card}><View style={styles.icon}><FileSpreadsheet color={colors.primary} size={27} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{label}</Text><Text style={styles.meta}>{tr(language, 'Toutes les données de la campagne sélectionnée.', 'Ny angona rehetra amin’ny fanisana voafidy.', 'All data from the selected campaign.')}</Text></View><PrimaryButton title={tr(language, 'Exporter', 'Hamoaka', 'Export')} icon={Share2} loading={busy === resource} onPress={() => void exportCsv(resource)} /></View>)}
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </ScrollView>
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 44 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }, back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 12, ...shadow }, icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 11, marginTop: 4 }, error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 10 } })
