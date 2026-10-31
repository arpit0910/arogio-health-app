import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette } from '../../../theme/AppearanceProvider';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AuthShell } from './AuthScreen';
import { AuthHeading, useAuthStyles } from './AuthPrimitives';
import { Button } from '../../../components/ui/Button';
import { fonts } from '../../../theme/tokens';

export function ForgotPasswordScreen() {
  const { t: tr } = useTranslation();
  const authStyles = useAuthStyles();
  const styles = useStyles();

  return <AuthShell>
    <AuthHeading title={tr("Forgot password?")} subtitle={tr("Let’s help you get back to your health journey.")} />
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>{tr("Password recovery is not available yet")}</Text>
      <Text style={styles.copy}>{tr("You can use Google to sign in if it is linked to your account, or return to log in with your password.")}</Text>
    </View>
    <Button title={tr("Back to Log In")} onPress={() => router.replace('/login')} />
    <Pressable accessibilityRole="link" style={styles.link} onPress={() => router.push('/privacy')}><Text style={authStyles.link}>{tr("How your sign-in information is used")}</Text></Pressable>
  </AuthShell>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  notice: { backgroundColor: colors.subtle, borderRadius: 12, padding: 20, marginBottom: 24 },
  noticeTitle: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.ink, marginBottom: 8 },
  copy: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.muted },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
});
};
