import { useFocusEffect, useRouter } from 'expo-router'
import { Building2, CloudOff, Plus, RefreshCw, ScanLine, Users, UsersRound } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { mobileApi } from '../../src/api/resources'
import { useAuth } from '../../src/auth/AuthContext'
import MetricCard from '../../src/components/MetricCard'
import PrimaryButton from '../../src/components/PrimaryButton'
import ScreenHeader from '../../src/components/ScreenHeader'
import { getQueue } from '../../src/storage/database'
import { colors, radius, shadow, spacing } from '../../src/styles/theme'
import type { CampaignDto, DashboardDto } from '../../src/types/api'

export default function HomeScreen(){
  const router=useRouter(); const {user}=useAuth(); const [campaign,setCampaign]=useState<CampaignDto|null>(null); const [dashboard,setDashboard]=useState<DashboardDto|null>(null); const [pending,setPending]=useState(0); const [loading,setLoading]=useState(true)
  const load=useCallback(async()=>{setLoading(true);try{const campaigns=await mobileApi.campaigns();const active=campaigns.find(item=>item.status==='Active')??campaigns[0]??null;setCampaign(active);if(active)setDashboard(await mobileApi.dashboard(active.id));setPending((await getQueue()).length)}finally{setLoading(false)}},[])
  useFocusEffect(useCallback(()=>{void load()},[load]))
  if(loading)return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/></View>
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <ScreenHeader title={`Bonjour, ${user?.firstName ?? 'Agent'}`} subtitle={campaign?`${campaign.name} · ${campaign.status}`:'Aucune campagne active'} right={<Pressable style={styles.scanButton} onPress={()=>router.push('/scan')}><ScanLine color={colors.primary} size={21}/></Pressable>}/>
    <View style={styles.hero}><View><Text style={styles.heroLabel}>Progression de la campagne</Text><Text style={styles.heroValue}>{dashboard?.totalHouseholds??0} ménages</Text></View><View style={styles.progress}><View style={[styles.progressFill,{width:`${Math.min(100,(dashboard?.validatedHouseholds??0)/Math.max(1,dashboard?.totalHouseholds??1)*100)}%`}]}/></View></View>
    <View style={styles.metrics}><MetricCard label="Habitations" value={dashboard?.totalDwellings??0} icon={Building2}/><MetricCard label="Ménages" value={dashboard?.totalHouseholds??0} icon={UsersRound} tone={colors.success}/><MetricCard label="Personnes" value={dashboard?.totalPersons??0} icon={Users} tone="#8B5CF6"/><MetricCard label="Sync. en attente" value={pending} icon={CloudOff} tone={colors.warning}/></View>
    <PrimaryButton title="Nouveau ménage" icon={Plus} onPress={()=>router.push('/households/new')}/>
    <View style={styles.quick}><Text style={styles.sectionTitle}>Actions rapides</Text><Pressable style={styles.quickRow} onPress={()=>router.push('/(tabs)/sync')}><View style={styles.quickIcon}><RefreshCw color={colors.primary} size={20}/></View><View style={{flex:1}}><Text style={styles.quickTitle}>Synchroniser les données</Text><Text style={styles.quickText}>{pending} élément(s) en attente</Text></View></Pressable></View>
  </ScrollView>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,gap:spacing.lg,paddingBottom:96},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.background},scanButton:{width:42,height:42,borderRadius:12,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},hero:{backgroundColor:colors.navy,borderRadius:radius.lg,padding:spacing.lg,...shadow},heroLabel:{color:'#BFDBFE',fontSize:12},heroValue:{color:colors.white,fontSize:22,fontWeight:'900',marginTop:7},progress:{height:7,borderRadius:999,backgroundColor:'rgba(255,255,255,.17)',marginTop:18,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:'#60A5FA',borderRadius:999},metrics:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:12},quick:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.lg},sectionTitle:{fontSize:16,fontWeight:'900',color:colors.text,marginBottom:12},quickRow:{flexDirection:'row',alignItems:'center',gap:12},quickIcon:{width:42,height:42,borderRadius:12,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},quickTitle:{fontWeight:'800',color:colors.text},quickText:{fontSize:12,color:colors.muted,marginTop:3}})
