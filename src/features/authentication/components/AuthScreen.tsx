import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette } from '../../../theme/AppearanceProvider';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AuthCanvas } from './AuthCanvas';
import { AuthBrand } from './AuthBrand';
import { useScreenLayout } from '../../../components/ui/useScreenLayout';

export function AuthShell({ children, signup = false }: { children: ReactNode; signup?: boolean }) {
  const styles = useStyles();
  const { compact } = useScreenLayout();
  return <AuthCanvas background={signup ? 'backgroundSignup' : 'backgroundLogin'}>
        <View style={[styles.top, compact && styles.compactTop]}>
          <AuthBrand />
        </View>
        <View style={[styles.body, compact && styles.compactBody, signup && styles.signupBody, signup && compact && styles.compactSignupBody]}>{children}</View>
  </AuthCanvas>;
}

export function AuthScreen({ initialTab = 'login' }: { initialTab?: 'login' | 'signup' }) {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const colors = usePalette();
  const styles = useStyles();

  const { clearError, isLoading } = useAuth();
  const signup = initialTab === 'signup';
  const switchRoute = (route: '/login' | '/signup') => { clearError(); router.replace(route); };
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.primary} accessibilityLabel={tr("Restoring your session")} /></View>;
  if (!signup) return <AuthCanvas background="backgroundLogin"><LoginForm onSwitchToSignup={() => switchRoute('/signup')} /></AuthCanvas>;
  return <AuthCanvas background="backgroundLogin"><SignupForm onSwitchToLogin={() => switchRoute('/login')} /></AuthCanvas>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  top: { paddingTop: 32, paddingBottom: 28, alignItems: 'center' },
  back: { position: 'absolute', top: 0, left: 12, minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 24, marginHorizontal: 16, marginBottom: 24, backgroundColor: colors.surface, borderRadius: 24 },
  signupBody: { flexGrow: 0, marginTop: 12, paddingBottom: 12 },
  compactTop: { paddingTop: 20, paddingBottom: 20 },
  compactBody: { marginTop: 4 },
  compactSignupBody: { marginTop: 8 },
});
};
