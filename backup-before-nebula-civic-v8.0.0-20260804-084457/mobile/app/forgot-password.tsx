import { useRouter } from 'expo-router'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Mail, MessageCircle, ShieldCheck } from 'lucide-react-native'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { messageFromError } from '../src/api/client'
import { mobileApi } from '../src/api/resources'
import PrimaryButton from '../src/components/PrimaryButton'
import { tr } from '../src/i18n/text'
import { goBackOrReplace } from '../src/navigation/goBackOrReplace'
import { usePreferences } from '../src/preferences/PreferencesContext'
import { colors, radius, shadow, spacing } from '../src/styles/theme'
import type { PasswordRecoveryChannel } from '../src/types/api'

type Step = 'email' | 'otp' | 'password' | 'done'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { t, language } = usePreferences()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [channel, setChannel] = useState<PasswordRecoveryChannel>('Email')
  const [message, setMessage] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const request = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await mobileApi.requestPasswordCode(email.trim(), channel)
      setMessage(result.message)
      setStep('otp')
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await mobileApi.verifyPasswordCode(email.trim(), otp)
      setToken(result.resetToken)
      setStep('password')
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  const reset = async () => {
    if (password !== confirm) {
      setError(t('passwordsMismatch'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await mobileApi.resetPassword(email.trim(), token, password, confirm)
      setStep('done')
    } catch (exception) {
      setError(messageFromError(exception))
    } finally {
      setLoading(false)
    }
  }

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Pressable style={styles.back} onPress={() => goBackOrReplace(router, '/login')}>
          <ArrowLeft color={colors.textSoft} size={18} />
          <Text style={styles.backText}>{t('back')}</Text>
        </Pressable>
        <View style={styles.head}>
          <View style={styles.icon}><KeyRound color={colors.primary} size={24} /></View>
          <Text style={styles.title}>{t('accountRecovery')}</Text>
          <Text style={styles.subtitle}>{t('recoverySteps')}</Text>
        </View>

        {step === 'email' && <View style={styles.form}>
          <Mail color={colors.primary} size={28} />
          <Text style={styles.formTitle}>{t('recoveryEmail')}</Text>
          <Text style={styles.subtitle}>{tr(language, 'Saisissez votre e-mail de connexion puis choisissez le canal OTP.', 'Ampidiro ny mailaka fidirana ary safidio ny fandefasana OTP.', 'Enter your login email and choose the OTP channel.')}</Text>
          <TextInput style={styles.input} autoFocus value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="agent@recensement.mg" placeholderTextColor={colors.muted} />
          <View style={styles.channels}>
            <Pressable style={[styles.channel, channel === 'Email' && styles.channelActive]} onPress={() => setChannel('Email')}>
              <Mail color={channel === 'Email' ? colors.primary : colors.muted} size={22} />
              <Text style={styles.channelTitle}>E-mail</Text>
              <Text style={styles.channelText}>{tr(language, 'Adresse du compte', 'Mailaky ny kaonty', 'Account email')}</Text>
            </Pressable>
            <Pressable style={[styles.channel, channel === 'WhatsApp' && styles.channelActive]} onPress={() => setChannel('WhatsApp')}>
              <MessageCircle color={channel === 'WhatsApp' ? colors.primary : colors.muted} size={22} />
              <Text style={styles.channelTitle}>WhatsApp</Text>
              <Text style={styles.channelText}>{tr(language, 'Numéro associé', 'Laharana mifandray', 'Linked number')}</Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title={t('receiveCode')} loading={loading} disabled={!email.trim()} onPress={request} />
        </View>}

        {step === 'otp' && <View style={styles.form}>
          <ShieldCheck color={colors.primary} size={28} />
          <Text style={styles.formTitle}>{t('verificationCode')}</Text>
          <Text style={styles.subtitle}>{message}</Text>
          <View style={styles.deliveryNote}>
            {channel === 'WhatsApp' ? <MessageCircle color={colors.primary} size={18} /> : <Mail color={colors.primary} size={18} />}
            <Text style={styles.deliveryText}>{tr(language, 'Le code n’est jamais affiché dans l’application.', 'Tsy aseho ao amin’ny app mihitsy ny kaody.', 'The code is never displayed in the app.')}</Text>
          </View>
          <TextInput style={[styles.input, styles.otp]} autoFocus value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" placeholder="000000" placeholderTextColor={colors.muted} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title={t('verify')} loading={loading} disabled={otp.length !== 6} onPress={verify} />
          <Pressable onPress={() => setStep('email')}><Text style={styles.changeChannel}>{tr(language, 'Changer l’adresse ou le canal', 'Hanova mailaka na fomba fandefasana', 'Change email or channel')}</Text></Pressable>
        </View>}

        {step === 'password' && <View style={styles.form}>
          <KeyRound color={colors.primary} size={28} />
          <Text style={styles.formTitle}>{t('newPassword')}</Text>
          <View style={styles.password}>
            <TextInput style={styles.passwordInput} autoFocus value={password} onChangeText={setPassword} secureTextEntry={!show} placeholder={t('min12')} placeholderTextColor={colors.muted} />
            <Pressable onPress={() => setShow((value) => !value)}>{show ? <EyeOff color={colors.muted} size={18} /> : <Eye color={colors.muted} size={18} />}</Pressable>
          </View>
          <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry={!show} placeholder={t('confirmPassword')} placeholderTextColor={colors.muted} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title={t('changePassword')} loading={loading} disabled={password.length < 12} onPress={reset} />
        </View>}

        {step === 'done' && <View style={styles.done}>
          <View style={styles.success}><CheckCircle2 color={colors.success} size={38} /></View>
          <Text style={styles.formTitle}>{t('passwordChanged')}</Text>
          <Text style={styles.subtitle}>{t('reconnectNow')}</Text>
          <PrimaryButton title={t('returnLogin')} onPress={() => router.replace('/login')} />
        </View>}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, ...shadow },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  backText: { fontSize: 12, fontWeight: '800', color: colors.textSoft },
  head: { alignItems: 'center', marginTop: spacing.xl },
  icon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  title: { fontSize: 25, fontWeight: '900', color: colors.text, marginTop: 13 },
  subtitle: { color: colors.muted, textAlign: 'center', marginTop: 6 },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  formTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.white },
  otp: { fontSize: 25, fontWeight: '900', letterSpacing: 8, textAlign: 'center' },
  password: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, color: colors.text },
  channels: { flexDirection: 'row', gap: 10 },
  channel: { flex: 1, minHeight: 104, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 13, gap: 5, backgroundColor: colors.white },
  channelActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  channelTitle: { color: colors.text, fontWeight: '900' },
  channelText: { color: colors.muted, fontSize: 10 },
  deliveryNote: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12 },
  deliveryText: { flex: 1, color: colors.textSoft, fontSize: 11, fontWeight: '700' },
  changeChannel: { textAlign: 'center', color: colors.primary, fontWeight: '800', padding: 8 },
  error: { color: colors.danger, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: radius.sm },
  done: { alignItems: 'center', gap: spacing.lg, marginTop: spacing.xxl },
  success: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSoft },
})
