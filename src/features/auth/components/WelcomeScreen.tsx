import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { colors, fonts } from '../../../theme/tokens';
import { AuthCanvas } from './AuthCanvas';
import { AuthBrand } from './AuthBrand';
import { AuthIcon } from './AuthIcon';
import { SocialDivider, authStyles } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { useScreenLayout } from '../../../components/ui/useScreenLayout';

export function WelcomeScreen() {
  const { compact } = useScreenLayout();
  const { isSubmitting, clearError } = useAuth();
  const navigate = (path: '/login' | '/signup') => { clearError(); router.push(path); };
  return (
    <AuthCanvas background="backgroundWelcome">
      <View style={[styles.header, compact && styles.compactHeader]}>
        <Pressable accessibilityRole="link" accessibilityLabel="Skip welcome" disabled={isSubmitting}
          onPress={() => navigate('/login')} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable>
        <AuthBrand />
      </View>
      <View style={[styles.introduction, compact && styles.compactIntroduction]}>
        <Text accessibilityRole="header" style={styles.title}>A healthier{'\n'}<Text style={styles.accent}>you,</Text> every day</Text>
        <Text style={styles.description}>Track, learn and take better care of your health with Arogio.</Text>
      </View>
      <View style={[styles.illustration, compact && styles.compactIllustration]} accessible={false}><AuthIcon name="welcomeIllustration" width="100%" height="100%" /></View>
      <View style={styles.pagination} accessible={false}>
        <View style={[styles.dot, styles.activeDot]} /><View style={styles.dot} /><View style={styles.dot} />
      </View>
      <View style={styles.actions}>
        <Button title="Get Started" disabled={isSubmitting} onPress={() => navigate('/signup')} trailing={<AuthIcon name="arrow" />} />
        <SocialDivider /><GoogleSignInButton disabled={isSubmitting} />
        <View style={authStyles.footer}>
          <Text style={authStyles.small}>Already have an account?</Text>
          <TouchTarget accessibilityRole="link" disabled={isSubmitting} onPress={() => navigate('/login')} style={authStyles.footerLink}>
            <Text style={authStyles.footerLinkText}>Log In</Text>
          </TouchTarget>
        </View>
      </View>
    </AuthCanvas>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 30.75, alignItems: 'center' },
  skip: { position: 'absolute', top: 0, right: 12, minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 12.5 },
  introduction: { marginTop: 19.5, paddingHorizontal: 24, alignItems: 'center' },
  title: { color: colors.ink, fontFamily: fonts.heading, fontSize: 28, lineHeight: 36, textAlign: 'center', includeFontPadding: false },
  accent: { color: colors.primary },
  description: { maxWidth: 262, marginTop: 10, fontFamily: fonts.body, color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', includeFontPadding: false },
  illustration: { marginTop: 4, width: 294, maxWidth: '100%', aspectRatio: 294 / 215, alignSelf: 'center', overflow: 'hidden' },
  pagination: { height: 34, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: '#CBD5E1' },
  activeDot: { width: 10, height: 10, backgroundColor: colors.primary },
  actions: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12 },
  compactHeader: { paddingTop: 24 }, compactIntroduction: { marginTop: 12 }, compactIllustration: { width: 250 },
});
