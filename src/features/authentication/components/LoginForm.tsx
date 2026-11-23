import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from '../../../localization/LanguageProvider';
import { usePalette } from '../../../theme/AppearanceProvider';
import { fonts } from '../../../theme/tokens';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';
import { AppIcon } from '../../../components/app/AppIcon';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../types';
import { loginMark } from '../assets/loginMark';
import { AuthField, type AuthFieldRef } from './AuthField';
import { FormError } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) {
  const c = usePalette(), { t } = useTranslation(), router = useRouter();
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const passwordRef = useRef<AuthFieldRef>(null), lock = useRef(false);
  async function handleSubmit() {
    if (isSubmitting || lock.current) return;
    clearError();
    // The deployed login contract accepts email, not a mobile identifier.
    if (/^\+?[\d\s-]+$/.test(email.trim())) { setValidationError('Mobile sign-in is not available yet. Please use your email address.'); return; }
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return; }
    setValidationError(null); lock.current = true;
    try { await login(parsed.data, true); } catch { /* AuthContext supplies the API error. */ }
    finally { lock.current = false; }
  }
  return <View style={s.page}>
    <View style={s.heading}>
      <SvgXml xml={loginMark} width={64} height={64} />
      <View style={[s.verified, { backgroundColor: c.subtle }]}><View style={[s.dot, { backgroundColor: c.primaryPressed }]} /><Text style={[s.badgeText, { color: c.primaryPressed }]}>{t('Verified Health Network')}</Text></View>
      <Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>{t('Welcome to Arogio')}</Text>
      <Text style={[s.subtitle, { color: c.muted }]}>{t('Access verified healthcare, doctor appointments & smart health tracking nationwide.')}</Text>
    </View>
    <View style={s.fieldGroup}>
      <View style={s.fieldHeading}><Text style={[s.label, { color: c.ink }]}>{t('Email or Mobile Number')}</Text><Text style={[s.hint, { color: c.muted }]}>{t('e.g. 9876543210')}</Text></View>
      <AuthField tonal icon="email" accessibilityLabel={t('Email or Mobile Number')} placeholder={t('Enter email or 10-digit mobile')} value={email} onChangeText={value => { setEmail(value); setValidationError(null); clearError(); }} editable={!isSubmitting} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
    </View>
    <View style={s.passwordGroup}>
      <View style={s.fieldHeading}><Text style={[s.label, { color: c.ink }]}>{t('Password')}</Text><TouchTarget accessibilityRole="link" accessibilityLabel={t('Forgot Password?')} disabled={isSubmitting} onPress={() => router.push('/forgot-password')} style={s.forgot}><Text style={[s.label, { color: c.primaryPressed }]}>{t('Forgot Password?')}</Text></TouchTarget></View>
      <AuthField tonal ref={passwordRef} icon="lock" password accessibilityLabel={t('Password')} placeholder={t('Enter your security password')} value={password} onChangeText={value => { setPassword(value); setValidationError(null); clearError(); }} editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void handleSubmit()} />
    </View>
    <FormError message={validationError || error} />
    <View style={s.submit}><Button title={t('Sign In')} onPress={() => void handleSubmit()} loading={isSubmitting} trailing={<AppIcon name="arrow" size={20} color={c.onPrimary} />} /></View>
    <View style={s.divider}><View style={[s.line, { backgroundColor: c.border }]} /><Text style={[s.dividerText, { color: c.muted }]}>{t('or continue with')}</Text><View style={[s.line, { backgroundColor: c.border }]} /></View>
    <GoogleSignInButton disabled={isSubmitting} />
    <View style={s.credentials}>
      <View style={[s.credential, { backgroundColor: c.subtle }]}><AppIcon name="hospital" size={13} color={c.primaryPressed} /><Text style={[s.badgeText, { color: c.secondary }]}>{t('Ayushman Empanelled')}</Text></View>
      <View style={[s.credential, { backgroundColor: c.subtle }]}><AppIcon name="shield" size={13} color={c.primaryPressed} /><Text style={[s.badgeText, { color: c.secondary }]}>{t('ABDM Compliant')}</Text></View>
    </View>
    <View style={s.signup}><Text style={[s.accountText, { color: c.muted }]}>{t("Don't have an account?")}</Text><TouchTarget accessibilityRole="link" disabled={isSubmitting} onPress={onSwitchToSignup ?? (() => router.replace('/signup'))} style={s.signupLink}><Text style={[s.signupText, { color: c.primaryPressed }]}>{t('Sign Up')}</Text></TouchTarget></View>
    <Text style={[s.legal, { color: c.muted }]}>{t("By continuing, you agree to Arogio's")}{' '}<Text accessibilityRole="link" onPress={() => router.push('/terms')} style={{ color: c.primaryPressed, textDecorationLine: 'underline' }}>{t('Terms of Service')}</Text>{' &\n'}<Text accessibilityRole="link" onPress={() => router.push('/privacy')} style={{ color: c.primaryPressed, textDecorationLine: 'underline' }}>{t('Privacy Policy.')}</Text></Text>
  </View>;
}
export const loginStyles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  heading: { alignItems: 'center', marginBottom: 30 }, verified: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 }, dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 15, letterSpacing: 0.2 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.7, textAlign: 'center', marginTop: 12 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 26, textAlign: 'center', marginTop: 4, maxWidth: 355 },
  fieldGroup: { gap: 6 }, fieldHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 }, hint: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 16 },
  passwordGroup: { marginTop: 16 }, forgot: { minHeight: 24, justifyContent: 'center', paddingLeft: 8 }, submit: { marginTop: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }, line: { flex: 1, height: 1 }, dividerText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  credentials: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 44 }, credential: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  signup: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }, accountText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 }, signupLink: { justifyContent: 'center', paddingHorizontal: 2 }, signupText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26 },
  legal: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
const s = loginStyles;
