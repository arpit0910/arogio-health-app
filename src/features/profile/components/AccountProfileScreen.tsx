import { usePalette } from '../../../theme/AppearanceProvider';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { AppScreen } from '../../../components/app/AppScreen';
import { Avatar } from '../../../components/app/Avatar';
import { AppIcon } from '../../../components/app/AppIcon';
import { CareRow, useCareStyles } from '../../../components/app/CareUI';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { fonts } from '../../../theme/tokens';
import { ageLabel, formatBirthday, genderLabel, profileDraft, profileName, profilePhoto } from '../profileViewModel';
import { activities } from '../model';
import { accountGoals } from '../profileOptions';

export function AccountProfileScreen() {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const { user, logout, isSubmitting } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const logoutLock = useRef(false);
  async function handleLogout() {
    if (isSubmitting || logoutLock.current) return;
    logoutLock.current = true;
    setLogoutError(null);
    try { await logout(); }
    catch { setLogoutError('Unable to log out. Please try again.'); }
    finally { logoutLock.current = false; }
  }
  if (!user) return null;
  const draft = profileDraft(user);
  const goals = accountGoals.filter(goal => draft.healthGoals.includes(goal.value));
  return <AppScreen>
    <View style={s.header}><Text accessibilityRole="header" style={c.heading}>Your profile</Text><TouchTarget accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} style={s.settings}><AppIcon name="settings" /></TouchTarget></View>
    <View style={s.identity}><Avatar photo={profilePhoto(user)} size={72} /><View style={s.flex}><View style={s.nameRow}><Text style={s.name}>{profileName(user)}</Text><TouchTarget accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => router.push('/edit-profile')} style={s.edit}><AppIcon name="pencil" size={22} /></TouchTarget></View><Text style={c.text}>{[ageLabel(draft.dateOfBirth), draft.gender ? genderLabel(draft.gender) : ''].filter(Boolean).join(' · ') || 'Your personal health companion'}</Text></View></View>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Personal details</Text><View style={s.details}>
      <Detail label="Date of birth" value={formatBirthday(draft.dateOfBirth)} /><Detail label="Gender" value={genderLabel(draft.gender)} /><Detail label="Location" value={draft.location || 'Not added'} />
    </View></View>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Body details</Text><View style={s.details}>
      <Detail label="Weight" value={user.weightValue ? `${user.weightValue} ${user.weightUnit === 'lb' ? 'lbs' : 'kg'}` : 'Not added'} />
      <Detail label="Height" value={user.heightValue ? `${user.heightValue} ${user.heightUnit === 'in' ? 'in' : 'cm'}` : 'Not added'} />
      <Detail label="BMI" value={user.bmi?.toFixed(1) ?? 'Not available'} />
    </View></View>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Your priorities</Text><Text style={[c.text, { marginTop: 10 }]}>{goals.map(goal => goal.title).join(' · ') || 'No goals added'}</Text><Text style={[c.text, { marginTop: 6 }]}>{activities.find(activity => activity.value === draft.activityLevel)?.title || 'Activity level not added'}</Text></View>
    <View style={[c.section, c.line]}><CareRow icon="goal" title="Goals & preferences" detail="Wellness goals, activity and updates" onPress={() => router.push('/edit-health-goals')} /></View>
    <View style={s.accountAction}>
      <TouchTarget accessibilityRole="button" accessibilityLabel="Log out" accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }} disabled={isSubmitting} onPress={() => void handleLogout()} style={({ pressed }) => [s.logout, pressed && s.logoutPressed, isSubmitting && { opacity: 0.6 }]}>
        {isSubmitting ? <ActivityIndicator color={colors.primary} /> : <AppIcon name="logout" size={22} />}
        <Text style={s.logoutText}>{isSubmitting ? 'Logging out...' : 'Log out'}</Text>
      </TouchTarget>
      {logoutError && <Text accessibilityRole="alert" style={s.logoutError}>{logoutError}</Text>}
    </View>
  </AppScreen>;
}
function Detail({ label, value }: { label: string; value: string }) {
  const s = useStyles();

  return <View style={s.detail}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text></View>;
}
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settings: { width: 48, alignItems: 'flex-end', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 28 }, flex: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { flex: 1, fontFamily: fonts.semibold, fontSize: 22, lineHeight: 29, color: colors.ink },
  edit: { width: 48, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  accountAction: { marginTop: 24, borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, paddingBottom: 12 },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 16, borderRadius: 12 },
  logoutPressed: { backgroundColor: colors.subtle },
  logoutText: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: colors.ink },
  logoutError: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.error, marginTop: 8 },
  details: { marginTop: 12, backgroundColor: colors.surface, paddingHorizontal: 16, borderRadius: 12 },
  detail: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.border },
  label: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.muted },
  value: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
};
