import { Stack, useRouter } from 'expo-router'
import { ArrowLeft, ChevronLeft, ChevronRight, ScrollText, Search } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { mobileApi } from '../src/api/resources'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import StatusPill from '../src/components/StatusPill'
import { tr } from '../src/i18n/text'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type { AuditLogDto } from '../src/types/api'

export default function AuditScreen() {
  const router = useRouter()
  const { language } = usePreferences()
  const [items, setItems] = useState<AuditLogDto[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const result = await mobileApi.auditLogs({ actionName: search || undefined, page, pageSize: 30 }); setItems(result.items); setPages(Math.max(1, result.totalPages)) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [page])
  return <View style={styles.screen}>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}><Pressable style={styles.back} onPress={() => goBackOrReplace(router, '/(tabs)/more')}><ArrowLeft color={colors.text} size={21} /></Pressable><View><Text style={styles.title}>{tr(language, 'Journal d’audit', 'Tatitry ny fanaraha-maso', 'Audit log')}</Text><Text style={styles.subtitle}>{tr(language, 'Traçabilité des actions sensibles.', 'Fanaraha-maso ireo asa manan-danja.', 'Traceability of sensitive actions.')}</Text></View></View>
    <View style={styles.search}><Search color={colors.muted} size={18} /><TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => { setPage(1); void load() }} placeholder={tr(language, 'Rechercher une action…', 'Hikaroka asa…', 'Search an action…')} placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
    {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> : <ScrollView contentContainerStyle={styles.list}>{items.map((item) => <View key={item.id} style={styles.card}><View style={styles.icon}><ScrollText color={colors.primary} size={20} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.actionName}</Text><Text style={styles.meta}>{item.httpMethod} {item.requestPath}</Text><Text style={styles.meta}>{item.actorEmail || tr(language, 'Anonyme', 'Tsy fantatra', 'Anonymous')} · {new Date(item.occurredAtUtc).toLocaleString()}</Text></View><StatusPill value={`${item.wasSuccessful ? 'OK' : 'ERROR'} ${item.statusCode}`} /></View>)}</ScrollView>}
    <View style={styles.pagination}><Pressable disabled={page <= 1} onPress={() => setPage((v) => v - 1)}><ChevronLeft color={page <= 1 ? colors.border : colors.primary} /></Pressable><Text style={styles.page}>{page} / {pages}</Text><Pressable disabled={page >= pages} onPress={() => setPage((v) => v + 1)}><ChevronRight color={page >= pages ? colors.border : colors.primary} /></Pressable></View>
  </View>
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }, back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 }, search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9 }, searchInput: { flex: 1, color: colors.text }, list: { gap: 10, paddingBottom: 70 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 11, ...shadow }, icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: colors.text, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 10, marginTop: 3 }, pagination: { position: 'absolute', bottom: 16, left: 60, right: 60, minHeight: 48, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', ...shadow }, page: { color: colors.text, fontWeight: '900' } })
