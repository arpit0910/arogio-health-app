import { useTranslation } from "../../../localization/LanguageProvider";
import { ProfileInput } from '../../profile/components/ProfileInput';
import { normalizeInviteCode } from '../../referrals/model';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { useScreenLayout } from '../../../components/ui/useScreenLayout';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { registerSchema, referralCodeSchema } from '../types';
import { AuthField, type AuthFieldRef } from './AuthField';
import { AuthIcon } from './AuthIcon';
import { AuthHeading, Checkbox, FormError, SocialDivider, useAuthStyles } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';

export function SignupForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const { t: tr } = useTranslation();
  const authStyles = useAuthStyles();
  const styles = useStyles();

  const { compact } = useScreenLayout();
  const { register, isSubmitting, error, clearError } = useAuth();
  const params = useLocalSearchParams<{ ref?: string | string[] }>();
  const [referralCode, setReferralCode] = useState(() => normalizeInviteCode(params.ref));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const emailRef = useRef<AuthFieldRef>(null);
  const passwordRef = useRef<AuthFieldRef>(null);
  const confirmRef = useRef<AuthFieldRef>(null);
  const handleSubmit = async () => {
    if (isSubmitting) return;
    clearError();
    const parsed = registerSchema.safeParse({ fullName: fullName.trim(), email: email.trim(), password, ...(referralCode.trim() ? { referralCode } : {}) });
    if (!fullName.trim()) { setValidationError('Please enter your full name.'); return; }
    if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return; }
    if (password !== confirmation) { setValidationError('Your passwords do not match. Please check them.'); return; }
    if (!accepted) { setValidationError('Please read and agree to the Terms of Service and Privacy Policy.'); return; }
    setValidationError(null);
    try { await register(parsed.data); } catch { /* AuthContext displays the API error. */ }
  };
  return <View style={styles.container}>
    <AuthHeading compact title={tr("Create your account")} subtitle={tr("Join Arogio and take a step towards a healthier you.")} />
    <View style={styles.fields}>
      <AuthField icon="user" placeholder={tr("Full name")} value={fullName} onChangeText={(value) => { setFullName(value); setValidationError(null); clearError(); }} autoComplete="name" textContentType="name"
        editable={!isSubmitting} autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
      <AuthField ref={emailRef} icon="email" placeholder={tr("Email address")} value={email} onChangeText={(value) => { setEmail(value); setValidationError(null); clearError(); }}
        editable={!isSubmitting} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
        textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
      <AuthField ref={passwordRef} icon="lock" password placeholder={tr("Password")} value={password} onChangeText={(value) => { setPassword(value); setValidationError(null); clearError(); }}
        editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
        accessibilityHint={tr("At least 8 characters, with uppercase, lowercase, and a number")}
        returnKeyType="next" onSubmitEditing={() => confirmRef.current?.focus()} />
      <AuthField ref={confirmRef} icon="lock" password placeholder={tr("Confirm password")} value={confirmation} onChangeText={(value) => { setConfirmation(value); setValidationError(null); clearError(); }}
        editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
        returnKeyType="go" onSubmitEditing={handleSubmit} />
    </View>
    <View style={{ marginTop: 12 }}><ProfileInput label={tr("Referral code (optional)")} icon="users" placeholder={tr("Code from a friend")} value={referralCode} onChangeText={value => { setReferralCode(value.toUpperCase()); setValidationError(null); clearError(); }} editable={!isSubmitting} autoCapitalize="characters" autoCorrect={false} maxLength={12} /><Text style={[authStyles.small, { marginTop: 6 }]}>{tr("Enter a friend's code, or add it during account setup.")}</Text></View>
    <View style={styles.agreement}>
      <Checkbox checked={accepted} onChange={() => setAccepted(!accepted)} label={tr("Agree to Terms of Service and Privacy Policy")} disabled={isSubmitting}>
        <Text style={[authStyles.small, styles.legalCopy]}>{tr("I agree to the")}{' '}
          <Text accessibilityRole="link" style={authStyles.link} onPress={() => router.push('/terms')}>{tr("Terms of Service")}</Text> {tr(" and")}{' '}
          <Text accessibilityRole="link" style={authStyles.link} onPress={() => router.push('/privacy')}>{tr("Privacy Policy")}</Text>.
        </Text>
      </Checkbox>
    </View>
    <FormError message={validationError || error} />
    <View style={[styles.spacer, compact && styles.compactSpacer]} />
    <View style={styles.action}><Button title={tr("Create Account")} onPress={handleSubmit} loading={isSubmitting} trailing={<AuthIcon name="arrow" />} /></View>
    <SocialDivider compact /><GoogleSignInButton disabled={isSubmitting || !accepted || (!!referralCode.trim() && !referralCodeSchema.safeParse(referralCode).success)} referralCode={referralCode.trim() || undefined} />
    <View style={[authStyles.footer, styles.footer]}><Text style={authStyles.small}>{tr("Already have an account?")}</Text>
      <TouchTarget accessibilityRole="link" disabled={isSubmitting} onPress={onSwitchToLogin} style={authStyles.footerLink}><Text style={authStyles.footerLinkText}>{tr("Log In")}</Text></TouchTarget>
    </View>
  </View>;
}

const useStyles = () => {
return StyleSheet.create({
  container: {},
  fields: { gap: 8 },
  agreement: { marginTop: 4 },
  legalCopy: { flex: 1 },
  spacer: { height: 40 },
  compactSpacer: { height: 20 },
  footer: { marginTop: 0 },
  action: { marginTop: 0 },
});
};
