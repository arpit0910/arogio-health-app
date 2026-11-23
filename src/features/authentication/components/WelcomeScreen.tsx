import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette } from '../../../theme/AppearanceProvider';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AppIcon } from '../../../components/app/AppIcon';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { fonts } from '../../../theme/tokens';
import { AuthCanvas } from './AuthCanvas';
import { CareBrand } from '../../../components/app/CareUI';
import { SocialDivider } from './AuthPrimitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export function WelcomeScreen() {
  const router = useRouter();
  const { t: tr, language, setLanguage, ready, saving } = useTranslation();
  const [panel, setPanel] = useState(0);
  const panels = [
    { title: 'Find care with confidence', copy: 'Search source-reviewed care information. Emergency contacts are open to everyone.', icon: 'search' as const },
    { title: 'Make room for everyday health', copy: 'Keep your activity, water and medicine reminders together. Connect health data only when you choose.', icon: 'heart' as const },
    { title: 'Support, with your privacy in mind', copy: 'Ask Jeeva for education, not a diagnosis. Your saved health data is shared with Jeeva only if you opt in.', icon: 'shield' as const },
  ];
  const s = useStyles(), colors = usePalette();

  const { isSubmitting, clearError } = useAuth();
  const navigate = (path: '/login' | '/signup') => { clearError(); router.push(path); };
  return <AuthCanvas background="backgroundWelcome"><View style={s.screen}>
    <CareBrand />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>{(['en', 'hi'] as const).map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityState={{ checked: language === value }} disabled={!ready || saving} onPress={() => void setLanguage(value)} style={{ minHeight: 48, padding: 12 }}><Text style={s.caption}>{value === 'en' ? 'English' : tr('Hindi')}</Text></TouchTarget>)}</View>
    <View style={s.intro}><AppIcon name={panels[panel].icon} size={56} /><Text accessibilityRole="header" style={s.title}>{tr(panels[panel].title)}</Text><Text style={s.copy}>{tr(panels[panel].copy)}</Text></View>
    <Text style={s.caption}>{tr('Explore available care services')}</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel={tr('Welcome panels')} style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>{panels.map((item, index) => <TouchTarget key={item.title} accessibilityRole="radio" accessibilityLabel={tr(item.title)} accessibilityState={{ checked: panel === index }} onPress={() => setPanel(index)} style={{ minWidth: 48, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: panel === index ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: panel === index ? colors.primary : colors.border }} /></TouchTarget>)}</View>
    <View style={{ gap: 12, marginTop: 16 }}><Button title={tr('Explore as Guest')} onPress={() => router.replace('/home')} /><Button title={tr('Emergency contacts')} variant="danger" onPress={() => router.push('/emergency')} /></View>
    <View style={s.actions}><Button title={tr("Create account")} disabled={isSubmitting} onPress={() => navigate('/signup')} /><Button title={tr("I already have an account")} variant="secondary" disabled={isSubmitting} onPress={() => navigate('/login')} /><SocialDivider /><GoogleSignInButton disabled={isSubmitting} /></View>
  </View></AuthCanvas>;
}
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  screen: { flexGrow: 1, padding: 24, paddingTop: 28 }, intro: { marginTop: 24, marginBottom: 20, padding: 24, backgroundColor: colors.surface, borderRadius: 24, alignItems: 'center', gap: 12 },
  title: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 40, letterSpacing: -.6, color: colors.ink, textAlign: 'center' },
  copy: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colors.muted, marginTop: 16, textAlign: 'center' },
  scenes: { flexDirection: 'row', gap: 12, width: '100%' },
  scene: { flex: 1, minWidth: 0, gap: 8 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, textAlign: 'center', color: colors.ink },
  actions: { gap: 12, marginTop: 'auto', paddingTop: 24 },
});
};
