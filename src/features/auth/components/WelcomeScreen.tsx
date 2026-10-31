import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette } from '../../../theme/AppearanceProvider';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { fonts } from '../../../theme/tokens';
import { AuthCanvas } from './AuthCanvas';
import { CareBrand } from '../../../components/app/CareUI';
import { CareIllustration } from '../../../components/app/CareIllustration';
import { SocialDivider } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export function WelcomeScreen() {
  const { t: tr } = useTranslation();
  const s = useStyles();

  const { isSubmitting, clearError } = useAuth();
  const navigate = (path: '/login' | '/signup') => { clearError(); router.push(path); };
  return <AuthCanvas background="backgroundWelcome"><View style={s.screen}>
    <CareBrand />
    <View style={s.intro}><Text accessibilityRole="header" style={s.title}>{tr("A little care.")}{'\n'}{tr("A healthier you.")}</Text><Text style={s.copy}>{tr("Make room for your health and wellbeing. Start with what matters to you.")}</Text></View>
    <View style={s.illustration} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><CareIllustration name="welcome" width="100%" height="100%" /></View>
    <View style={s.actions}><Button title={tr("Create account")} disabled={isSubmitting} onPress={() => navigate('/signup')} /><Button title={tr("I already have an account")} variant="secondary" disabled={isSubmitting} onPress={() => navigate('/login')} /><SocialDivider /><GoogleSignInButton disabled={isSubmitting} /></View>
  </View></AuthCanvas>;
}
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  screen: { flexGrow: 1, padding: 24, paddingTop: 28 }, intro: { marginTop: 32, marginBottom: 20 },
  title: { fontFamily: fonts.semibold, fontSize: 38, lineHeight: 45, letterSpacing: -1.1, color: colors.ink },
  copy: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colors.muted, marginTop: 18 },
  illustration: { width: 294, maxWidth: '100%', aspectRatio: 294 / 215, alignSelf: 'center', overflow: 'hidden' },
  actions: { gap: 12, marginTop: 'auto', paddingTop: 32 },
});
};
