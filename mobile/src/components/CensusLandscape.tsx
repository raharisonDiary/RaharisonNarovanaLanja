import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { colors } from '../styles/theme'
export default function CensusLandscape({ dark=false, height=210 }:{dark?:boolean;height?:number}){
 const bg=dark?'#0B1118':'#EEF6FF', mountain=dark?'#202E3D':'#75A8D8', ground=dark?'#111A22':'#DBE9C5', house=dark?'#151D27':'#FFFAF0', light=dark?'#F59E0B':'#2563EB'
 return <View style={[styles.wrap,{height,backgroundColor:bg}]}><Svg width="100%" height="100%" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice"><Rect width="900" height="520" fill={bg}/><Circle cx="700" cy="105" r="55" fill="#F59E0B"/><Path d="M0 330L170 220l110 90 145-120 130 115 140-85 205 120v180H0z" fill={mountain}/><Path d="M0 410Q180 330 340 410t300 0 260 0v110H0z" fill={ground}/><Path d="M145 370v95h130v-95l-65-52z" fill={house}/><Path d="M570 350v110h150V350l-75-58z" fill={house}/><Rect x="174" y="397" width="26" height="30" fill={light}/><Rect x="225" y="397" width="26" height="30" fill={light}/><Rect x="605" y="382" width="28" height="30" fill={light}/><Rect x="659" y="382" width="28" height="30" fill={light}/></Svg></View>
}
const styles=StyleSheet.create({wrap:{width:'100%',overflow:'hidden'}})
