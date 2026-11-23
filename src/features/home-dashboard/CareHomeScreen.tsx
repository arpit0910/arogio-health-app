import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '../../components/app/AppScreen';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';
import { useAuth } from '../authentication/context/AuthContext';
import { useWellness } from '../personal-wellness/WellnessContext';
import { useHealthSync } from '../health-connections/HealthSyncProvider';
import { AppSearchBar } from '../care-directory/CarePrimitives';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { loadDiscovery } from './discoveryApi';
import { HomeVitals } from './HomeVitals';
import { HomeRoutines } from './HomeRoutines';
import { HomeCareDiscovery, HomeGuides } from './HomeDiscovery';

const actions = [
  { title: 'Hospitals', icon: 'hospital', path: '/hospitals', tone: 'mint' },
  { title: 'Doctors', icon: 'stethoscope', path: '/doctors', tone: 'blue' },
  { title: 'Blood Banks', icon: 'blood', path: '/blood-banks', tone: 'rose' },
  { title: 'Medicines', icon: 'medicalCase', path: '/medicine-library', tone: 'pale' },
  { title: 'Jeeva AI', icon: 'robot', path: '/jeeva', tone: 'brand' },
  { title: 'Articles', icon: 'book', path: '/articles', tone: 'mint' },
  { title: 'Health Tips', icon: 'leaf', path: '/explore', tone: 'neutral' },
  { title: 'Activity', icon: 'trend', path: '/activity', tone: 'blue' },
] as const;
const suggestions = [
  { title: 'SMS Hospital', search: 'SMS' },
  { title: 'Cardiologists', search: 'Cardiology' },
  { title: 'Blood banks', path: '/blood-banks' },
  { title: 'Medicines', path: '/medicine-library' },
] as const;

export function HomeScreen() {
  const router = useRouter(), colors = usePalette(), { t, language } = useTranslation(), { user } = useAuth();
  const wellness = useWellness(), health = useHealthSync(), { fontScale } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const discovery = useQuery({ queryKey: ['home-discovery'], queryFn: ({ signal }) => loadDiscovery(signal), staleTime: 60000 });
  const name = user?.fullName?.split(' ')[0] || user?.username;
  const tones = {
    mint: [colors.mintSurface, colors.primary], blue: [colors.secondarySurface, colors.secondary],
    rose: [colors.roseSurface, colors.error], pale: [colors.subtle, colors.secondary],
    brand: [colors.primary, colors.onPrimary], neutral: [colors.subtle, colors.primary],
  };
  const find = () => router.navigate({ pathname: '/find-care', params: { search } });
  return <AppScreen refreshing={wellness.loading || health.busy || discovery.isRefetching} onRefresh={() => void Promise.allSettled([wellness.refresh(), health.run(), discovery.refetch()])}>
    <View style={s.page}>
      <View style={{ gap: 6 }}>
        <View style={[s.greeting, fontScale > 1.2 && { flexDirection: 'column', alignItems: 'flex-start' }]}><View style={s.copy}><Text accessibilityRole="header" style={[typeStyles.heading, { color: colors.ink }]}>{name ? `${language === 'hi' ? 'नमस्ते' : 'Namaste'}, ${name}` : t('Namaste')}{' 🙏'}</Text><Text style={[typeStyles.body, { color: colors.muted }]}>{t('How can we help your health today?')}</Text></View></View>
        <AppSearchBar value={search} onChange={setSearch} onSubmit={find} label="Search doctors, hospitals, medicines…" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestions}><View style={s.suggestionCaption}><AppIcon name="trend" size={13} color={colors.muted} /><Text style={[typeStyles.label, { color: colors.muted }]}>{t('Explore:')}</Text></View>{suggestions.map(item => <TouchTarget key={item.title} accessibilityRole="button" onPress={() => 'search' in item ? router.navigate({ pathname: '/find-care', params: { search: item.search } }) : router.push(item.path)} style={s.chipTarget}><View style={[s.chip, { backgroundColor: item.title === 'Blood banks' ? colors.errorSurface : colors.surface }]}><Text style={[typeStyles.label, { color: item.title === 'Blood banks' ? colors.error : colors.ink }]}>{t(item.title)}</Text></View></TouchTarget>)}</ScrollView>
      </View>
      <TouchTarget accessibilityRole="button" accessibilityLabel={t('Emergency help. Open emergency contacts')} onPress={() => router.push('/emergency')} style={({ pressed }) => [s.emergency, { backgroundColor: colors.errorSurface, opacity: pressed ? 0.8 : 1 }]}>
        <View style={[s.emergencyIcon, { backgroundColor: colors.error }]}><AppIcon name="emergency" size={26} color={colors.onError} /></View><View style={s.copy}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}><Text style={[typeStyles.title, { color: colors.ink, fontFamily: fonts.bold }]}>{t('Emergency Help')}</Text><Text style={[s.emergencyBadge, { color: colors.onError, backgroundColor: colors.error }]}>24×7</Text></View><Text style={[typeStyles.detail, { color: colors.muted }]}>{t('112 emergency, 108 ambulance & urgent care contacts')}</Text></View><View style={[s.arrow, { backgroundColor: colors.surface }]}><AppIcon name="arrow" color={colors.error} size={18} /></View>
      </TouchTarget>
      <View style={s.actions}>{actions.map(action => <TouchTarget key={action.title} accessibilityRole="button" accessibilityLabel={t(action.title)} onPress={() => router.navigate(action.path)} style={({ pressed }) => [s.shortcut, { width: fontScale > 1.3 ? '50%' : '25%', opacity: pressed ? 0.65 : 1 }]}><View style={[s.shortcutIcon, { backgroundColor: tones[action.tone][0] }]}><AppIcon name={action.icon} size={29} color={tones[action.tone][1]} /></View><Text style={[typeStyles.label, { textAlign: 'center', color: action.path === '/jeeva' ? colors.primary : colors.ink }]}>{t(action.title)}</Text></TouchTarget>)}</View>
      <HomeVitals />
      <HomeRoutines />
      <View style={[s.jeeva, { backgroundColor: colors.brandSurface }]}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none"><Defs><LinearGradient id="jeeva-home" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#00624E" /><Stop offset="1" stopColor="#087D65" /></LinearGradient></Defs><Rect width="100%" height="100%" fill="url(#jeeva-home)" /><Circle cx="100%" cy="100%" r="92" fill={colors.brandSoft} opacity={0.12} /></Svg>
        <View style={{ padding: 16, gap: 12 }}><View style={[s.greeting, { alignItems: 'flex-start' }]}><View style={[s.copy, { gap: 10 }]}><View style={s.greeting}><AppIcon name="sparkles" size={19} color={colors.brandSoft} /><Text style={[typeStyles.label, { color: colors.brandSoft, flex: 1 }]}>{t('SYMPTOMS & CARE GUIDANCE')}</Text></View><Text style={[typeStyles.heading, { color: colors.onBrand, fontSize: 18, lineHeight: 24 }]}>{t('“I have had a high fever and body ache for 2 days…”')}</Text></View><View style={[s.chatIcon, { backgroundColor: '#FFFFFF18' }]}><AppIcon name="chat" size={31} color={colors.brandSoft} /></View></View>
        <Text style={[typeStyles.body, { color: colors.onBrand }]}>{t('Understand health topics and find the right care. Jeeva is not a doctor or an emergency service.')}</Text><TouchTarget accessibilityRole="button" onPress={() => router.navigate('/jeeva')} style={[s.jeevaAction, { backgroundColor: colors.surface }]}><Text style={[typeStyles.label, { color: colors.primary }]}>{t('Start with Jeeva')}</Text><AppIcon name="arrow" color={colors.primary} size={18} /></TouchTarget></View>
      </View>
      <HomeCareDiscovery data={discovery.data} pending={discovery.isPending} error={discovery.isError} retry={() => void discovery.refetch()} />
      <HomeGuides />
      <View style={[s.trust, { backgroundColor: colors.subtle }]}><View style={[s.trustIcon, { backgroundColor: colors.surface }]}><AppIcon name="shield" size={27} color={colors.primary} /></View><Text accessibilityRole="header" style={[typeStyles.title, { color: colors.ink, textAlign: 'center' }]}>{t('Arogio Healthcare Discovery')}</Text><Text style={[typeStyles.body, { textAlign: 'center', color: colors.muted }]}>{t('Source-reviewed care information. Check each listing’s source and contact the provider before travelling.')}</Text><View style={s.trustFooter}><AppIcon name="check" size={15} color={colors.primary} /><Text style={[typeStyles.label, { color: colors.muted }]}>{t('Free care discovery')}</Text><AppIcon name="shield" size={15} color={colors.primary} /><Text style={[typeStyles.label, { color: colors.muted }]}>{t('Sources you can check')}</Text></View></View>
    </View>
  </AppScreen>;
}
const s = StyleSheet.create({
  page: { gap: 28 }, copy: { flex: 1, minWidth: 0 }, greeting: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  suggestions: { alignItems: 'center', gap: 6 }, suggestionCaption: { flexDirection: 'row', alignItems: 'center', gap: 3 }, chipTarget: { justifyContent: 'center' }, chip: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  emergency: { marginTop: -12, padding: 16, minHeight: 106, borderRadius: 18, flexDirection: 'row', gap: 12, alignItems: 'center' }, emergencyIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, emergencyBadge: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 15, paddingHorizontal: 6, borderRadius: 10 }, arrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: -4, flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }, shortcut: { alignItems: 'center', paddingHorizontal: 2, gap: 6 }, shortcutIcon: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  jeeva: { borderRadius: 18, overflow: 'hidden', minHeight: 272 }, chatIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, jeevaAction: { alignSelf: 'flex-start', paddingHorizontal: 16, borderRadius: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
  trust: { padding: 20, borderRadius: 18, alignItems: 'center', gap: 10 }, trustIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, trustFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 4 },
});
