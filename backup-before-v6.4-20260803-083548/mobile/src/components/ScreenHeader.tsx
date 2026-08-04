import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/theme'
export default function ScreenHeader({ title, subtitle, right }: { title:string; subtitle?:string; right?:ReactNode }) { return <View style={styles.row}><View style={styles.text}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>{right}</View> }
const styles=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},text:{flex:1},title:{fontSize:24,fontWeight:'900',color:colors.text},subtitle:{fontSize:13,color:colors.muted,marginTop:3}})
