import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from '../../../localization/LanguageProvider';
import { usePalette } from '../../../theme/AppearanceProvider';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';
import { AppIcon } from '../../../components/app/AppIcon';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../types';
import { loginMark } from '../assets/loginMark';
import { AuthField } from './AuthField';
import { FormError } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { loginStyles as s } from './LoginForm';

export function SignupForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const c = usePalette(), { t } = useTranslation(), router = useRouter();
  const { register, isSubmitting, error, clearError } = useAuth();
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null), lock = useRef(false);
  async function submit() {
    if (lock.current || isSubmitting) return;
    clearError();
    const parsed = registerSchema.safeParse({ fullName: name.trim(), email: email.trim(), password });
    if (!parsed.success) { setInvalid(parsed.error.issues[0].message); return; }
    lock.current = true; setInvalid(null);
    try { await register(parsed.data); } catch { /* The auth provider exposes the error. */ }
    finally { lock.current = false; }
  }
  return <View style={s.page}>
    <View style={s.heading}><SvgXml xml={loginMark} width={64} height={64} />
      <View style={[s.verified, { backgroundColor: c.subtle }]}><View style={[s.dot, { backgroundColor: c.primary }]} /><Text style={[s.badgeText, { color: c.primary }]}>{t('Verified Health Network')}</Text></View>
      <Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>{t('Create your account')}</Text>
      <Text style={[s.subtitle, { color: c.muted }]}>{t('Your health companion, every day.')}</Text>
    </View>
    <View style={{ gap: 16 }}>{[
      { label: 'Full Name', value: name, set: setName, icon: 'user' as const, placeholder: 'Enter your full name' },
      { label: 'Email Address', value: email, set: setEmail, icon: 'email' as const, placeholder: 'Enter your email address' },
      { label: 'Password', value: password, set: setPassword, icon: 'lock' as const, placeholder: 'Create your password' },
    ].map(field => <View key={field.label} style={s.fieldGroup}><Text style={[s.label, { color: c.ink }]}>{t(field.label)}</Text><AuthField tonal icon={field.icon} accessibilityLabel={t(field.label)} placeholder={t(field.placeholder)} value={field.value} onChangeText={value => { field.set(value); setInvalid(null); clearError(); }} password={field.icon === 'lock'} autoCapitalize={field.icon === 'user' ? 'words' : 'none'} keyboardType={field.icon === 'email' ? 'email-address' : 'default'} editable={!isSubmitting} /></View>)}</View>
    <FormError message={invalid || error} />
    <View style={s.submit}><Button title={t('Create Account')} onPress={() => void submit()} loading={isSubmitting} trailing={<AppIcon name="arrow" color={c.onPrimary} size={20} />} /></View>
    <View style={s.divider}><View style={[s.line, { backgroundColor: c.border }]} /><Text style={[s.dividerText, { color: c.muted }]}>{t('or continue with')}</Text><View style={[s.line, { backgroundColor: c.border }]} /></View>
    <GoogleSignInButton disabled={isSubmitting} />
    <View style={s.signup}><Text style={[s.accountText, { color: c.muted }]}>{t('Already have an account?')}</Text><TouchTarget accessibilityRole="link" onPress={onSwitchToLogin}><Text style={[s.signupText, { color: c.primary }]}>{t('Sign In')}</Text></TouchTarget></View>
    <Text style={[s.legal, { color: c.muted }]}>{t("By continuing, you agree to Arogio's")}{' '}<Text accessibilityRole="link" onPress={() => router.push('/terms')} style={{ color: c.primary, textDecorationLine: 'underline' }}>{t('Terms of Service')}</Text>{' & '}<Text accessibilityRole="link" onPress={() => router.push('/privacy')} style={{ color: c.primary, textDecorationLine: 'underline' }}>{t('Privacy Policy.')}</Text></Text>
  </View>;
}
