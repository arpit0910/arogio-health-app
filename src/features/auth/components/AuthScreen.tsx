import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette } from '../../../theme/AppearanceProvider';
import { CareIllustration } from '../../../components/app/CareIllustration';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { AuthIcon } from './AuthIcon';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AuthCanvas } from './AuthCanvas';
import { AuthBrand } from './AuthBrand';
import { useScreenLayout } from '../../../components/ui/useScreenLayout';

export function AuthShell({ children, signup = false }: { children: ReactNode; signup?: boolean }) {
  const { t: tr } = useTranslation();
  const styles = useStyles();

  const { isSubmitting } = useAuth();
  const { compact } = useScreenLayout();
  return <AuthCanvas background={signup ? 'backgroundSignup' : 'backgroundLogin'}>
        <View style={[styles.top, compact && styles.compactTop]}>
          <Pressable accessibilityRole="button" accessibilityLabel={tr("Go back")} disabled={isSubmitting} hitSlop={2} style={styles.back}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <AuthIcon name="back" />
          </Pressable>
          <AuthBrand />
        </View>
        <View style={[styles.body, compact && styles.compactBody, signup && styles.signupBody, signup && compact && styles.compactSignupBody]}><View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.illustration, compact && styles.compactIllustration]}><CareIllustration name={signup ? 'signup' : 'login'} width="100%" height="100%" /></View>{children}</View>
  </AuthCanvas>;
}

export function AuthScreen({ initialTab = 'login' }: { initialTab?: 'login' | 'signup' }) {
  const { t: tr } = useTranslation();
  const colors = usePalette();
  const styles = useStyles();

  const { clearError, isLoading } = useAuth();
  const signup = initialTab === 'signup';
  const switchRoute = (route: '/login' | '/signup') => { clearError(); router.replace(route); };
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.primary} accessibilityLabel={tr("Restoring your session")} /></View>;
  return <AuthShell signup={signup}>{signup
    ? <SignupForm onSwitchToLogin={() => switchRoute('/login')} />
    : <LoginForm onSwitchToSignup={() => switchRoute('/signup')} />}
  </AuthShell>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  illustration: { width: 220, maxWidth: '100%', aspectRatio: 294 / 215, alignSelf: 'center', marginBottom: 12 },
  compactIllustration: { width: 164, marginBottom: 8 },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  top: { paddingTop: 24, alignItems: 'center' },
  back: { position: 'absolute', top: 0, left: 12, minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 1, paddingHorizontal: 24, marginTop: 8, paddingBottom: 12 },
  signupBody: { flexGrow: 0, marginTop: 12, paddingBottom: 12 },
  compactTop: { paddingTop: 16 },
  compactBody: { marginTop: 4 },
  compactSignupBody: { marginTop: 8 },
});
};
