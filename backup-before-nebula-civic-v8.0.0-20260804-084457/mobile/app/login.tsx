import { useRouter } from 'expo-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { messageFromError } from '../src/api/client'
import { runFadeUp } from '../src/animations/motion'
import { useAuth } from '../src/auth/AuthContext'
import { AuroraBackground, GradientSurface } from '../src/components/AuroraSurface'
import Brand from '../src/components/Brand'
import PrimaryButton from '../src/components/PrimaryButton'
import { usePreferences } from '../src/preferences/PreferencesContext'
import {
  colors,
  floatingShadow,
  radius,
  softShadow,
  spacing,
} from '../src/styles/theme'

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = usePreferences()
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const opacity = useRef(new Animated.Value(0)).current
  const translate = useRef(new Animated.Value(18)).current

  useEffect(() => runFadeUp(opacity, translate), [opacity, translate])

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      router.replace('/(tabs)')
    } catch (e) {
      setError(messageFromError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuroraBackground dense>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topbar}>
            <Pressable style={styles.back} onPress={() => router.replace('/')}>
              <ArrowLeft color={colors.text} size={20} />
            </Pressable>
            <Brand />
          </View>

          <Animated.View
            style={[
              styles.card,
              { opacity, transform: [{ translateY: translate }] },
            ]}
          >
            <GradientSurface
              variant="primary"
              style={styles.identityVisual}
              radiusValue={24}
            >
              <View style={styles.identityHalo}>
                <UsersRound color="#FFFFFF" size={44} />
              </View>
              <View style={styles.identityCopy}>
                <View style={styles.identityKicker}>
                  <Sparkles color={colors.primaryMist} size={13} />
                  <Text style={styles.identityKickerText}>{t('fieldFirst')}</Text>
                </View>
                <Text style={styles.identityTitle}>Bienvenue</Text>
                <Text style={styles.identityText}>
                  Accédez à votre espace sécurisé de collecte et de supervision.
                </Text>
              </View>
            </GradientSurface>

            <View style={styles.hero}>
              <Text style={styles.title}>{t('loginTitle')}</Text>
              <Text style={styles.subtitle}>{t('loginText')}</Text>
            </View>

            <View style={styles.accessRow}>
              <View style={[styles.accessChip, styles.accessChipActive]}>
                <UsersRound color={colors.primary} size={16} />
                <Text style={styles.accessChipText}>Agent recenseur</Text>
              </View>
              <View style={styles.accessChip}>
                <ShieldCheck color={colors.secondary} size={16} />
                <Text style={styles.accessChipText}>Supervision</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('email')}</Text>
              <View style={styles.inputShell}>
                <Mail color={colors.primary} size={18} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="agent@recensement.mg"
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('password')}</Text>
              <View style={styles.inputShell}>
                <LockKeyhole color={colors.primary} size={18} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!show}
                  autoComplete="password"
                  placeholder={t('passwordPlaceholder')}
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShow((value) => !value)}
                >
                  {show ? (
                    <EyeOff color={colors.muted} size={18} />
                  ) : (
                    <Eye color={colors.muted} size={18} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.forgotRow}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgot}>{t('forgotPassword')}</Text>
              <ArrowRight color={colors.primary} size={15} />
            </Pressable>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title={t('login')}
              loading={loading}
              icon={ArrowRight}
              onPress={submit}
            />

            <View style={styles.secureCard}>
              <View style={styles.secureIcon}>
                <CheckCircle2 color={colors.accentDark} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.secureTitle}>Connexion protégée</Text>
                <Text style={styles.secureText}>{t('encryptedLogin')}</Text>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.footer}>Census Flow · Accès institutionnel</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,.98)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...floatingShadow,
  },
  identityVisual: {
    minHeight: 170,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityHalo: {
    width: 86,
    height: 86,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.22)',
  },
  identityCopy: { flex: 1 },
  identityKicker: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  identityKickerText: {
    color: colors.primaryMist,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  identityTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -0.6,
  },
  identityText: {
    color: '#E0E7FF',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  hero: { marginTop: spacing.xs },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.8,
  },
  subtitle: { color: colors.muted, marginTop: 7, lineHeight: 20, fontSize: 13 },
  accessRow: { flexDirection: 'row', gap: 8 },
  accessChip: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
  },
  accessChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryMist,
  },
  accessChipText: { color: colors.textSoft, fontSize: 10, fontWeight: '800' },
  fieldGroup: { gap: 7 },
  label: { fontSize: 12, fontWeight: '800', color: colors.textSoft },
  inputShell: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
  },
  input: { flex: 1, color: colors.text, fontSize: 14 },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -4,
  },
  forgot: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  errorBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: 12,
  },
  error: { color: colors.dangerDark, fontSize: 11, fontWeight: '700' },
  secureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentLight,
    padding: 12,
  },
  secureIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
  },
  secureTitle: { color: colors.text, fontSize: 11, fontWeight: '900' },
  secureText: { fontSize: 9, color: colors.muted, marginTop: 2 },
  footer: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 9,
    marginTop: spacing.lg,
  },
})
