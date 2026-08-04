import { useRouter } from 'expo-router'
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UsersRound } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { messageFromError } from '../src/api/client'
import { runFadeUp } from '../src/animations/motion'
import { useAuth } from '../src/auth/AuthContext'
import PrimaryButton from '../src/components/PrimaryButton'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import { usePreferences } from '../src/preferences/PreferencesContext'

export default function LoginScreen(){
  const router=useRouter(); const {login}=useAuth(); const {t}=usePreferences(); const [email,setEmail]=useState('admin@gmail.com'); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const opacity=useRef(new Animated.Value(0)).current; const translate=useRef(new Animated.Value(18)).current
  useEffect(()=>runFadeUp(opacity,translate),[opacity,translate])
  const submit=async()=>{setLoading(true);setError('');try{await login(email.trim(),password);router.replace('/(tabs)')}catch(e){setError(messageFromError(e))}finally{setLoading(false)}}
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS==='ios'?'padding':undefined}>
    <View style={styles.glowOne}/><View style={styles.glowTwo}/>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.card,{opacity,transform:[{translateY:translate}]}]}>
        <View style={styles.brand}><View style={styles.brandMark}><UsersRound color={colors.white} size={24}/></View><View><Text style={styles.brandName}>Census Flow</Text><Text style={styles.brandSub}>{t('collectionSmart')}</Text></View></View>
        <View style={styles.hero}><View style={styles.kicker}><Sparkles color={colors.accent} size={14}/><Text style={styles.kickerText}>{t('fieldFirst')}</Text></View><Text style={styles.title}>{t('loginTitle')}</Text><Text style={styles.subtitle}>{t('loginText')}</Text></View>
        <View><Text style={styles.label}>{t('email')}</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="agent@recensement.mg" placeholderTextColor={colors.muted}/></View>
        <View><Text style={styles.label}>{t('password')}</Text><View style={styles.password}><LockKeyhole color={colors.muted} size={18}/><TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="password" placeholder={t('passwordPlaceholder')} placeholderTextColor={colors.muted}/><Pressable onPress={()=>setShow(v=>!v)}>{show?<EyeOff color={colors.muted} size={18}/>:<Eye color={colors.muted} size={18}/>}</Pressable></View></View>
        <Pressable onPress={()=>router.push('/forgot-password')}><Text style={styles.forgot}>{t('forgotPassword')}</Text></Pressable>
        {error?<Text style={styles.error}>{error}</Text>:null}
        <PrimaryButton title={t('login')} loading={loading} icon={ArrowRight} onPress={submit}/>
        <View style={styles.secure}><ShieldCheck color={colors.accent} size={17}/><Text style={styles.secureText}>{t('encryptedLogin')}</Text></View>
      </Animated.View>
    </ScrollView>
  </KeyboardAvoidingView>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.navy,overflow:'hidden'},glowOne:{position:'absolute',width:330,height:330,borderRadius:999,backgroundColor:'rgba(91,75,219,.32)',right:-140,top:-120},glowTwo:{position:'absolute',width:280,height:280,borderRadius:999,backgroundColor:'rgba(22,179,163,.18)',left:-130,bottom:-120},content:{flexGrow:1,justifyContent:'center',padding:spacing.xl},card:{backgroundColor:'rgba(255,255,255,.98)',borderRadius:radius.xl,padding:spacing.xl,gap:spacing.lg,...shadow},brand:{flexDirection:'row',alignItems:'center',gap:11},brandMark:{width:46,height:46,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:colors.primary},brandName:{fontSize:17,fontWeight:'900',color:colors.text},brandSub:{fontSize:10,color:colors.muted,marginTop:1},hero:{marginTop:spacing.md},kicker:{flexDirection:'row',alignItems:'center',gap:6},kickerText:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:colors.accent},title:{fontSize:28,lineHeight:34,fontWeight:'900',color:colors.text,marginTop:10},subtitle:{color:colors.muted,marginTop:8,lineHeight:20},label:{fontSize:12,fontWeight:'800',color:colors.textSoft,marginBottom:7},input:{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,paddingHorizontal:14,color:colors.text,backgroundColor:colors.white},password:{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:9,backgroundColor:colors.white},passwordInput:{flex:1,color:colors.text},forgot:{alignSelf:'flex-end',color:colors.primary,fontSize:12,fontWeight:'800',marginTop:-7},error:{color:colors.danger,backgroundColor:colors.dangerSoft,padding:12,borderRadius:radius.sm},secure:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},secureText:{fontSize:10,color:colors.muted}})
