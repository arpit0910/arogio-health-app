import { useHealthRecords } from '../../health-records/useHealthRecords';
import { useSafetyContact } from '../../emergency/safetyContact';
import { useAccessibilityPreferences } from '../../accessibility/AccessibilityPreferences';
import { AccessibleText as Text } from '../../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Switch, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../localization/LanguageProvider';
import { usePalette } from '../../../theme/AppearanceProvider';
import { fonts, typeStyles } from '../../../theme/tokens';
import { useAuth } from '../../authentication/context/AuthContext';
import { AppScreen } from '../../../components/app/AppScreen';
import { Avatar } from '../../../components/app/Avatar';
import { AppIcon } from '../../../components/app/AppIcon';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { profileDraft, profileName, profilePhoto } from '../profileViewModel';
import { ProfileBadge, ProfileReadability, ProfileRow, ProfileSection } from './ProfilePageUI';

function LanguageChoice() {
  const c = usePalette(), { t, language, ready, saving, setLanguage } = useTranslation();
  return <View accessibilityRole="radiogroup" accessibilityLabel={t('Language')} style={[s.languages, { backgroundColor: c.mintSurface }]}>{(['en', 'hi'] as const).map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityLabel={value === 'en' ? 'English' : t('Hindi')} accessibilityState={{ checked: language === value, disabled: !ready || saving }} disabled={!ready || saving} onPress={() => void setLanguage(value)} style={[s.language, { backgroundColor: language === value ? c.primary : 'transparent' }]}><Text style={[s.small, { color: language === value ? c.onPrimary : c.primary }]}>{value === 'en' ? 'English' : t('Hindi')}</Text></TouchTarget>)}</View>;
}

export function AccountProfileScreen() {
  const safetyContact = useSafetyContact(), healthRecords = useHealthRecords();
  const router = useRouter(), c = usePalette(), { t, error: languageError } = useTranslation();
  const { user, logout, isSubmitting } = useAuth(), { width, fontScale } = useWindowDimensions();
  const { large, ready: accessibilityReady, error: accessibilityError, set: setAccessibility } = useAccessibilityPreferences();
  const [error, setError] = useState('');
  const lock = useRef(false), dialLock = useRef(false);
  const stacked = width < 360 || fontScale > 1.2 || large;
  async function signOut() {
    if (lock.current || isSubmitting) return;
    lock.current = true; setError('');
    try { await logout(); } catch { setError('Unable to log out. Please try again.'); }
    finally { lock.current = false; }
  }
  async function dial(number: '108' | '104') {
    if (dialLock.current) return;
    dialLock.current = true; setError('');
    try { await Linking.openURL(`tel:${number}`); }
    catch { setError(`The dialer could not open. Dial ${number} on your phone.`); }
    finally { dialLock.current = false; }
  }
  if (!user) return null;
  const draft = profileDraft(user);
  const contact = [String(user.profileSetup?.contactNumber || user.mobileNumber || user.email || ''), draft.location].filter(Boolean).join(' · ');
  const copy = [typeStyles.detail, large && { fontSize: 15, lineHeight: 22 }, { color: c.muted }];
  return <AppScreen><ProfileReadability value={large}><View style={s.page}>
    <View style={[s.identity, { backgroundColor: c.mintSurface }]}>
      <View style={s.identityRow}><Avatar photo={profilePhoto(user)} size={64} /><View style={s.flex}>
        <Text accessibilityRole="header" style={[s.name, large && { fontSize: 26, lineHeight: 34 }, { color: c.ink }]}>{profileName(user)}</Text>
        {!!contact && <Text selectable style={copy}>{contact}</Text>}

      </View><TouchTarget accessibilityRole="button" accessibilityLabel={t('Edit profile')} onPress={() => router.push('/edit-profile')} style={s.edit}><AppIcon name="pencil" size={17} color={c.muted} /></TouchTarget></View>
      <View style={[s.stats, { backgroundColor: c.mintSurface }, stacked && { flexWrap: 'wrap' }]}>
        {([{ icon: 'blood', value: String(user.profileSetup?.bloodGroup || '—'), label: 'Blood Type' }, { icon: 'shield', value: safetyContact.isPending ? 'Loading...' : safetyContact.isError ? 'Retry' : safetyContact.data ? 'Saved' : 'Add', label: 'SOS Contact' }, { icon: 'report', value: healthRecords.isPending ? 'Loading...' : healthRecords.isError ? 'Retry' : String(healthRecords.data?.length ?? 0), label: 'EHR Records' }] as const).map(item => <TouchTarget key={item.label} accessibilityRole="button" onPress={() => router.push(item.label === 'SOS Contact' ? '/safety-contact' : item.label === 'EHR Records' ? '/health-records' : '/edit-health-goals')} accessibilityLabel={`${t(item.label)}: ${t(item.value)}`} style={[s.stat, { backgroundColor: c.surface }, stacked && { flexBasis: '100%' }]}><View style={s.statValue}><AppIcon name={item.icon} size={15} color={item.icon === 'blood' ? c.error : c.primary} /><Text style={[s.statText, { color: c.ink }]}>{t(item.value)}</Text></View><Text style={[s.small, { color: c.muted }]}>{t(item.label)}</Text></TouchTarget>)}
      </View>
      {!user.profileCompletedAt && <TouchTarget accessibilityRole="button" onPress={() => router.push('/setup-profile')}><Text style={[typeStyles.label, { color: c.primary }]}>{t('Finish profile setup')}</Text></TouchTarget>}
    </View>

    <ProfileSection title="YOUR HEALTH DOCUMENTS & CONTACTS">
      <ProfileRow icon="shield" title={safetyContact.data ? 'Edit SOS contact' : 'Add SOS contact'} detail={safetyContact.data ? `${safetyContact.data.name} - ${safetyContact.data.phone}` : 'Choose a trusted person for emergencies'} onPress={() => router.push('/safety-contact')} />
      <ProfileRow icon="report" title="EHR records" detail="Add and open reports, prescriptions and discharge documents" onPress={() => router.push('/health-records')} last />
    </ProfileSection>
    <ProfileSection title="SAVED CARE & ACTIVITY">
      <ProfileRow icon="book" title="Saved and recent" detail="Providers, articles, and care searches" onPress={() => router.push('/saved-and-recent')} />
      <ProfileRow icon="hospital" title="Saved Hospitals & Clinics" detail="Hospitals & clinics" onPress={() => router.push({ pathname: '/saved-care', params: { kind: 'hospital' } })} trailing={!stacked && <ProfileBadge text="Saved" />} />
      <ProfileRow icon="stethoscope" title="Saved Doctors & Specialists" detail="Doctors & specialists" onPress={() => router.push({ pathname: '/saved-care', params: { kind: 'doctor' } })} trailing={!stacked && <ProfileBadge text="Saved" />} />
      <ProfileRow icon="clock" title="Recent Searches & Departments" detail="Care by name, area or specialty" onPress={() => router.push({ pathname: '/saved-care', params: { history: '1' } })} last />
    </ProfileSection>

    <ProfileSection title="LOCALIZATION & PREFERENCES">
      <ProfileRow icon="book" title="App language" detail="Select your preferred display language across Arogio" trailing={!stacked && <LanguageChoice />} />
      {stacked && <View style={s.languageBelow}><LanguageChoice /></View>}
      {!!languageError && <Text accessibilityRole="alert" style={[copy, { color: c.error }]}>{t(languageError)}</Text>}
      <ProfileRow icon="location" title="City & Medical Zone" detail={draft.location || 'Add your city to your profile'} onPress={() => router.push('/edit-profile')} trailing={!stacked && <Text style={[s.small, { color: c.primary }]}>{t('Change')}</Text>} />
      <ProfileRow icon="shield" title="Call ambulance 108" detail="Emergency ambulance helpline" onPress={() => void dial('108')} />
      <ProfileRow icon="walk" title="Senior / High Accessibility Mode" detail="Larger text across Arogio" trailing={<Switch accessibilityLabel={t('Larger text across Arogio')} disabled={!accessibilityReady} value={large} onValueChange={large => void setAccessibility({ large })} trackColor={{ false: c.mintSurface, true: c.primary }} thumbColor={c.surface} />} />
    </ProfileSection>

    {!!accessibilityError && <Text accessibilityRole="alert" style={copy}>{accessibilityError}</Text>}
    <ProfileSection title="COMPLIANCE & PUBLIC SCHEMES">
      <View style={s.scheme}><View style={s.schemeHeading}><View style={[s.schemeIcon, { backgroundColor: c.mintSurface }]}><AppIcon name="shield" size={18} color={c.primary} /></View><View style={s.flex}><Text style={[s.schemeTitle, { color: c.ink }]}>{t('Ayushman Bharat PM-JAY & ABDM')}</Text><Text style={copy}>{t('Not connected')}</Text></View></View>
        <View style={[s.schemeNote, { backgroundColor: c.subtle }]}><Text style={copy}>{t('Confirm scheme eligibility and hospital coverage with your provider.')}</Text></View>
      </View>
      <ProfileRow icon="medicalCase" title="Jan Aushadhi Kendra Locator" detail="Find generic medicine centres" onPress={() => router.push({ pathname: '/find-care', params: { kind: 'pharmacy' } })} />
      <ProfileRow icon="shield" title="Privacy & access" detail="Manage your data & privacy" onPress={() => router.push('/privacy-controls')} last />
    </ProfileSection>

    <ProfileSection title="HELP & HELPLINES">
      <View style={[s.helplines, { borderBottomColor: c.border }, stacked && { flexDirection: 'column' }]}>
        {([{ number: '108', label: 'Ambulance Rajasthan', icon: 'emergency' }, { number: '104', label: 'Rajasthan health helpline', icon: 'phone' }] as const).map(item => <TouchTarget key={item.number} accessibilityRole="button" accessibilityLabel={`${t('Call')} ${item.number}. ${t(item.label)}`} onPress={() => void dial(item.number)} style={({ pressed }) => [s.helpline, { backgroundColor: c.subtle, opacity: pressed ? 0.65 : 1 }]}><View style={[s.phoneIcon, { backgroundColor: item.number === '108' ? c.error : c.primary }]}><AppIcon name={item.icon} color={c.onPrimary} size={16} /></View><View style={s.flex}><Text style={[s.callTitle, { color: c.ink }]}>{t('Call')} {item.number}</Text><Text style={[s.small, { color: c.muted }]}>{t(item.label)}</Text></View></TouchTarget>)}
      </View>
      <ProfileRow icon="chat" title="Arogio Support & Feedback" detail="Send feedback to the app team" onPress={() => router.push('/feedback')} />
      <ProfileRow icon="logout" title={isSubmitting ? 'Logging out…' : 'Log Out'} detail="Safely sign out of your Arogio account" danger onPress={isSubmitting ? undefined : () => void signOut()} last trailing={isSubmitting ? <ActivityIndicator color={c.primary} /> : undefined} />
      {!!error && <Text accessibilityRole="alert" style={[copy, { color: c.error, paddingBottom: 16 }]}>{t(error)}</Text>}
    </ProfileSection>

    <View style={s.footer}><View style={s.footerBrand}><AppIcon name="leaf" size={15} color={c.primary} /><Text style={[typeStyles.label, { color: c.primary }]}>{t('Arogio Healthcare')}</Text></View><Text style={[s.small, { color: c.muted }]}>{t('Health. Help. Hope.')}</Text><Text style={[s.footerCopy, { color: c.muted }]}>{t('Your profile, care preferences and everyday health, together.')}</Text></View>
  </View></ProfileReadability></AppScreen>;
}

const s = StyleSheet.create({
  page: { gap: 16 }, flex: { flex: 1, minWidth: 0 }, identity: { padding: 16, gap: 16, borderRadius: 16 }, identityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.5 }, edit: { width: 48, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', marginTop: -8, marginRight: -8 },
  identityStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }, small: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  stats: { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 8 }, stat: { flex: 1, minWidth: 70, paddingVertical: 9, borderRadius: 8, alignItems: 'center', gap: 3 },
  statValue: { flexDirection: 'row', alignItems: 'center', gap: 4 }, statText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  languages: { flexDirection: 'row', borderRadius: 24, padding: 3 }, language: { paddingHorizontal: 9, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, languageBelow: { alignItems: 'flex-end', paddingBottom: 12 },
  scheme: { paddingVertical: 16, gap: 12 }, schemeHeading: { flexDirection: 'row', gap: 8, alignItems: 'center' }, schemeIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  schemeTitle: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23, letterSpacing: -0.35 }, schemeNote: { padding: 10, borderRadius: 8 },
  helplines: { flexDirection: 'row', gap: 8, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth }, helpline: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10 },
  phoneIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, callTitle: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  footer: { alignItems: 'center', gap: 6, paddingTop: 8, paddingBottom: 28 }, footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 5 }, footerCopy: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, textAlign: 'center', maxWidth: 290 },
});
