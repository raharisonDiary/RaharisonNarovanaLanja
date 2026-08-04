import { UsersRound } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '../styles/theme'

export default function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={styles.container}><View style={styles.mark}><UsersRound color={colors.white} size={compact ? 22 : 28}/></View>{!compact && <View><Text style={styles.title}>Recensement</Text><Text style={styles.subtitle}>de Population</Text></View>}</View>
}
const styles = StyleSheet.create({ container:{flexDirection:'row',alignItems:'center',gap:11}, mark:{width:46,height:46,borderRadius:radius.md,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}, title:{fontWeight:'900',fontSize:16,color:colors.text}, subtitle:{fontSize:12,color:colors.muted} })
