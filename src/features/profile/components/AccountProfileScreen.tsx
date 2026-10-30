import { ReferralPanel } from '../../referrals/ReferralPanel';
import { usePalette } from '../../../theme/AppearanceProvider';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { AppScreen } from '../../../components/app/AppScreen';
import { Avatar } from '../../../components/app/Avatar';
import { AppIcon } from '../../../components/app/AppIcon';
import { CareDisclosure, CareRow, useCareStyles } from '../../../components/app/CareUI';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { Button } from '../../../components/ui/Button';
import { fonts } from '../../../theme/tokens';
import { formatBirthday, genderLabel, profileDraft, profileName, profilePhoto } from '../profileViewModel';
import { accountGoals } from '../profileOptions';
export function AccountProfileScreen() {
  const c = useCareStyles(), colors = usePalette(), s = useStyles();
  const { user, logout, isSubmitting } = useAuth();
  const [error, setError] = useState(''), lock = useRef(false);
  async function signOut() {
    if (lock.current || isSubmitting) return;
    lock.current = true; setError('');
    try { await logout(); } catch { setError('Unable to log out. Please try again.'); } finally { lock.current = false; }
  }
  if (!user) return null;
  const draft = profileDraft(user);
  const goals = accountGoals.filter(goal => draft.healthGoals.includes(goal.value));
  const measurements = [
    { label: 'Weight', value: user.weightValue ? `${user.weightValue}` : '—', unit: user.weightValue ? user.weightUnit === 'lb' ? 'lb' : 'kg' : '' },
    { label: 'Height', value: user.heightValue ? `${user.heightValue}` : '—', unit: user.heightValue ? user.heightUnit === 'in' ? 'in' : 'cm' : '' },
    { label: 'BMI', value: user.bmi?.toFixed(1) ?? '—', unit: '' },
  ];
  return <AppScreen>
    {!user.profileCompletedAt && <CareRow icon="user" title="Finish profile setup" detail="Add your details whenever you are ready" onPress={() => router.push('/setup-profile')} />}

    <View style={s.identity}>
      <Avatar photo={profilePhoto(user)} size={88} />
      <Text accessibilityRole="header" style={[c.heading, s.center]}>{profileName(user)}</Text>
      {!!user.email && <Text selectable style={[c.text, s.center]}>{user.email}</Text>}
      {!!draft.location && <View style={s.city}><AppIcon name="location" size={16} /><Text style={c.text}>{draft.location}</Text></View>}
      <View style={{ width: '100%', maxWidth: 220, marginTop: 10 }}><Button title="Edit profile" variant="secondary" leading={<AppIcon name="pencil" size={18} />} onPress={() => router.push('/edit-profile')} /></View>
    </View>
    <View style={s.measurements}>{measurements.map(item => <View key={item.label} accessible accessibilityLabel={`${item.label}, ${item.value}${item.unit ? ` ${item.unit}` : ''}`} style={s.measurement}><Text style={c.text}>{item.label}</Text><Text style={s.measureValue}>{item.value}<Text style={s.unit}>{item.unit ? ` ${item.unit}` : ''}</Text></Text></View>)}</View>
    <View style={s.group}><Text accessibilityRole="header" style={c.title}>Made for you</Text><CareRow icon="goal" title="Goals & preferences" detail={goals.map(goal => goal.title).join(' \u00b7 ') || 'Set your wellness priorities'} onPress={() => router.push('/edit-health-goals')} /><CareDisclosure title="Personal details"><Detail label="Date of birth" value={formatBirthday(draft.dateOfBirth)} /><Detail label="Gender" value={genderLabel(draft.gender)} /><Detail label="City" value={draft.location || 'Not added'} /></CareDisclosure></View>
    <View style={s.group}><Text accessibilityRole="header" style={c.title}>Your account</Text><CareRow icon="settings" title="Settings" detail="Appearance and notifications" onPress={() => router.push('/settings')} /><View style={c.line}><CareRow icon="sync" title="Connected health" detail="Apps, permissions and last sync" onPress={() => router.push('/connected-health')} /></View></View>
    <ReferralPanel />
    <View style={s.footer}><Button title="Log out" variant="secondary" loading={isSubmitting} onPress={() => void signOut()} />{!!error && <Text accessibilityRole="alert" style={[c.text, { color: colors.error }]}>{error}</Text>}<TouchTarget accessibilityRole="button" onPress={() => router.push('/delete-account')} style={s.delete}><Text style={[c.text, { color: colors.error }]}>Delete account</Text></TouchTarget></View>
  </AppScreen>;
}
function Detail({ label, value }: { label: string; value: string }) {
  const c = useCareStyles();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingVertical: 10 }}><Text style={c.text}>{label}</Text><Text style={c.text}>{value}</Text></View>;
}
const useStyles = () => {
  const colors = usePalette();
  return StyleSheet.create({
    identity: { alignItems: 'center', paddingTop: 16, paddingBottom: 28, gap: 8 },
    center: { textAlign: 'center', maxWidth: '100%' },
    city: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center' },
    measurements: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingVertical: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    measurement: { flex: 1, minWidth: 72, gap: 6, alignItems: 'center' },
    measureValue: { fontFamily: fonts.semibold, fontSize: 23, lineHeight: 31, color: colors.ink, fontVariant: ['tabular-nums'] },
    unit: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
    group: { marginTop: 32 },
    footer: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderColor: colors.border, gap: 12 },
    delete: { alignItems: 'center', paddingVertical: 14 },
  });
};
