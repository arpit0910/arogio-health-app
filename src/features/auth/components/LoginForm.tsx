import { useTranslation } from "../../../localization/LanguageProvider";
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../types';
import { AuthField, type AuthFieldRef } from './AuthField';
import { AuthIcon } from './AuthIcon';
import { AuthHeading, Checkbox, FormError, SocialDivider, useAuthStyles } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) {
  const { t: tr } = useTranslation();
  const authStyles = useAuthStyles();
  const styles = useStyles();

  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const passwordRef = useRef<AuthFieldRef>(null);
  const handleSubmit = async () => {
    if (isSubmitting) return;
    clearError();
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return; }
    setValidationError(null);
    try { await login(parsed.data, remember); } catch { /* AuthContext displays the API error. */ }
  };
  return <View>
    <AuthHeading title={tr("Welcome Back!")} subtitle={tr("Good to see you again. Continue your health journey with Arogio.")} />
    <View style={authStyles.form}>
      <AuthField icon="email" placeholder={tr("Email address")} value={email} onChangeText={(value) => { setEmail(value); setValidationError(null); clearError(); }} editable={!isSubmitting}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
        returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
      <AuthField ref={passwordRef} icon="lock" password placeholder={tr("Password")} value={password} onChangeText={(value) => { setPassword(value); setValidationError(null); clearError(); }}
        editable={!isSubmitting} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
        returnKeyType="go" onSubmitEditing={handleSubmit} />
    </View>
    <View style={styles.options}>
      <Checkbox checked={remember} onChange={() => setRemember(!remember)} label={tr("Remember me")} disabled={isSubmitting} />
      <Pressable accessibilityRole="link" disabled={isSubmitting} onPress={() => router.push('/forgot-password')} style={styles.forgot}>
        <Text style={authStyles.link}>{tr("Forgot password?")}</Text>
      </Pressable>
    </View>
    <FormError message={validationError || error} />
    <View style={styles.action}><Button title={tr("Log In")} onPress={handleSubmit} loading={isSubmitting} trailing={<AuthIcon name="arrow" />} /></View>
    <SocialDivider /><GoogleSignInButton disabled={isSubmitting} />
    <View style={authStyles.footer}><Text style={authStyles.small}>{tr("Don't have an account?")}</Text>
      <TouchTarget accessibilityRole="link" disabled={isSubmitting} onPress={onSwitchToSignup} style={authStyles.footerLink}>
        <Text style={authStyles.footerLinkText}>{tr("Sign Up")}</Text>
      </TouchTarget>
    </View>
  </View>;
}

const useStyles = () => {
return StyleSheet.create({
  options: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 4 },
  forgot: { minHeight: 48, justifyContent: 'center' },
  action: { marginTop: 2 },
});
};
