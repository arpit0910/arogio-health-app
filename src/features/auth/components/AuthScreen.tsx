import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { AuthIcon } from './AuthIcon';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AuthCanvas } from './AuthCanvas';
import { AuthBrand } from './AuthBrand';

export function AuthShell({ children, signup = false }: { children: ReactNode; signup?: boolean }) {
  const { isSubmitting } = useAuth();
  return <AuthCanvas background={signup ? 'backgroundSignup' : 'backgroundLogin'}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" disabled={isSubmitting} hitSlop={2} style={styles.back}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <AuthIcon name="back" />
          </Pressable>
          <AuthBrand />
        </View>
        <View style={[styles.body, signup && styles.signupBody]}>{children}</View>
  </AuthCanvas>;
}

export function AuthScreen({ initialTab = 'login' }: { initialTab?: 'login' | 'signup' }) {
  const { clearError, isLoading } = useAuth();
  const signup = initialTab === 'signup';
  const switchRoute = (route: '/login' | '/signup') => { clearError(); router.replace(route); };
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.primary} accessibilityLabel="Restoring your session" /></View>;
  return <AuthShell signup={signup}>{signup
    ? <SignupForm onSwitchToLogin={() => switchRoute('/login')} />
    : <LoginForm onSwitchToSignup={() => switchRoute('/signup')} />}
  </AuthShell>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  top: { paddingTop: 24, alignItems: 'center' },
  back: { position: 'absolute', top: 0, left: 12, minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 1, paddingHorizontal: 24, marginTop: 35.5, paddingBottom: 12 },
  signupBody: { flexGrow: 0, marginTop: 12, paddingBottom: 12 },
});
