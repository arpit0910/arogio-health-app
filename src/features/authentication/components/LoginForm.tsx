import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from '../../../localization/LanguageProvider';
import { usePalette } from '../../../theme/AppearanceProvider';
import { fonts } from '../../../theme/tokens';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';
import { AppIcon } from '../../../components/app/AppIcon';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../types';
import { AuthIcon } from './AuthIcon';
import { AuthField, type AuthFieldRef } from './AuthField';
import { FormError } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) {
  const c = usePalette(), { t } = useTranslation(), router = useRouter();
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const passwordRef = useRef<AuthFieldRef>(null), lock = useRef(false);
  async function handleSubmit() {
    if (isSubmitting || lock.current) return;
    clearError();
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return; }
    setValidationError(null); lock.current = true; setSubmittingEmail(true);
    try { await login(parsed.data, true); } catch { /* AuthContext supplies the API error. */ }
    finally { lock.current = false; setSubmittingEmail(false); }
  }
  return <View style={s.page}>
    <AuthIntro title="Welcome to Arogio" subtitle="Sign in to manage your daily health." />
    <View style={s.fieldGroup}>
      <Text style={[s.label, { color: c.ink }]}>{t('Email Address')}</Text>
      <AuthField icon="email" accessibilityLabel={t('Email Address')} placeholder={t('Enter your email address')} value={email} onChangeText={value => { setEmail(value); setValidationError(null); clearError(); }} editable={!isSubmitting} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
    </View>
    <View style={s.passwordGroup}>
      <View style={s.fieldHeading}><Text style={[s.label, { color: c.ink }]}>{t('Password')}</Text><TouchTarget accessibilityRole="link" accessibilityLabel={t('Forgot Password?')} disabled={isSubmitting} onPress={() => router.push('/forgot-password')} style={s.forgot}><Text style={[s.label, { color: c.primaryPressed }]}>{t('Forgot Password?')}</Text></TouchTarget></View>
      <AuthField ref={passwordRef} icon="lock" password accessibilityLabel={t('Password')} placeholder={t('Enter your password')} value={password} onChangeText={value => { setPassword(value); setValidationError(null); clearError(); }} editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void handleSubmit()} />
    </View>
    <FormError message={validationError || error} />
    <View style={s.submit}><Button title={t('Sign In')} onPress={() => void handleSubmit()} loading={submittingEmail} disabled={isSubmitting} trailing={<AppIcon name="arrow" size={20} color={c.onPrimary} />} /></View>
    <View style={s.divider}><View style={[s.line, { backgroundColor: c.border }]} /><Text style={[s.dividerText, { color: c.muted }]}>{t('or continue with')}</Text><View style={[s.line, { backgroundColor: c.border }]} /></View>
    <GoogleSignInButton disabled={isSubmitting} />
    <View style={s.signup}><Text style={[s.accountText, { color: c.muted }]}>{t("Don't have an account?")}</Text><TouchTarget accessibilityRole="link" disabled={isSubmitting} onPress={onSwitchToSignup ?? (() => router.replace('/signup'))} style={s.signupLink}><Text style={[s.signupText, { color: c.primaryPressed }]}>{t('Sign Up')}</Text></TouchTarget></View>
    <Text style={[s.legal, { color: c.muted }]}>{t("By continuing, you agree to Arogio's")}{' '}<Text accessibilityRole="link" onPress={() => router.push('/terms')} style={{ color: c.primaryPressed, textDecorationLine: 'underline' }}>{t('Terms of Service')}</Text>{' &\n'}<Text accessibilityRole="link" onPress={() => router.push('/privacy')} style={{ color: c.primaryPressed, textDecorationLine: 'underline' }}>{t('Privacy Policy.')}</Text></Text>
  </View>;
}
export function AuthIntro({ title, subtitle }: { title: string; subtitle: string }) {
  const c = usePalette();
  const { t } = useTranslation();
  return (
    <View style={s.heading}>
      <View style={[s.cover, { backgroundColor: c.primaryPressed }]}>
        <Svg width="100%" height="100%" viewBox="0 0 420 150" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
          <Circle cx={350} cy={36} r={67} fill={c.primary} />
          <Path d="M0 108 C105 38 155 175 276 109 S386 97 420 111 V150 H0 Z" fill={c.primary} />
          <Path d="M0 145 C119 104 144 183 260 133 S382 113 420 132 V150 H0 Z" fill={c.brandSoft} />
        </Svg>
        <View style={[s.mark, { backgroundColor: c.surface }]}><AuthIcon name="brand" width={44} height={44} /></View>
        <Text style={[s.wordmark, { color: c.onBrand }]}>{t('Arogio')}</Text>
      </View>
      <Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>{t(title)}</Text>
      <Text style={[s.subtitle, { color: c.muted }]}>{t(subtitle)}</Text>
    </View>
  );
}

export const loginStyles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  heading: { marginBottom: 24, gap: 6 },
  cover: { minHeight: 140, borderRadius: 22, overflow: 'hidden', padding: 20, alignItems: 'flex-start', justifyContent: 'center', gap: 6, marginBottom: 14 },
  wordmark: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 28 },
  mark: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 38, letterSpacing: -0.7 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, maxWidth: 355 },
  fieldGroup: { gap: 6 }, fieldHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  passwordGroup: { marginTop: 16 }, forgot: { minHeight: 48, justifyContent: 'center', paddingLeft: 8 }, submit: { marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }, line: { flex: 1, height: 1 }, dividerText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  signup: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }, accountText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 }, signupLink: { justifyContent: 'center', paddingHorizontal: 2 }, signupText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26 },
  legal: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
const s = loginStyles;
