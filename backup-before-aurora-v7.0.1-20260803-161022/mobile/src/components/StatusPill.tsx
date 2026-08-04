import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/theme'
export default function StatusPill({ value }: {value:string}) { const lower=value.toLowerCase(); const tone=lower.includes('valid')||lower.includes('active')?{bg:colors.successSoft,fg:colors.success}:lower.includes('reject')?{bg:colors.dangerSoft,fg:colors.danger}:lower.includes('submit')?{bg:colors.warningSoft,fg:colors.warning}:{bg:'#F1F5F9',fg:colors.muted}; return <View style={[styles.pill,{backgroundColor:tone.bg}]}><Text style={[styles.text,{color:tone.fg}]}>{value}</Text></View> }
const styles=StyleSheet.create({pill:{alignSelf:'flex-start',borderRadius:999,paddingHorizontal:9,paddingVertical:5},text:{fontSize:10,fontWeight:'900'}})
