import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { AppScreen } from '../../../components/app/AppScreen';
import { Avatar } from '../../../components/app/Avatar';
import { AppIcon } from '../../../components/app/AppIcon';
import { CareRow, careStyles as c } from '../../../components/app/CareUI';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { colors, fonts } from '../../../theme/tokens';
import { ageLabel, formatBirthday, genderLabel, profileDraft, profileName, profilePhoto } from '../profileViewModel';
import { activities } from '../model';
import { accountGoals } from '../profileOptions';

export function AccountProfileScreen() {
  const { user } = useAuth();
  if (!user) return null;
  const draft = profileDraft(user);
  const goals = accountGoals.filter(goal => draft.healthGoals.includes(goal.value));
  return <AppScreen>
    <View style={s.header}><Text accessibilityRole="header" style={c.heading}>Your profile</Text><TouchTarget accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} style={s.settings}><AppIcon name="settings" /></TouchTarget></View>
    <View style={s.identity}><Avatar photo={profilePhoto(user)} size={72} /><View style={s.flex}><Text style={s.name}>{profileName(user)}</Text><Text style={c.text}>{[ageLabel(draft.dateOfBirth), draft.gender ? genderLabel(draft.gender) : ''].filter(Boolean).join(' · ') || 'Your personal health companion'}</Text></View></View>
    <TouchTarget accessibilityRole="button" onPress={() => router.push('/edit-profile')} style={s.edit}><Text style={s.editText}>Edit profile</Text><AppIcon name="right" size={17} /></TouchTarget>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Personal details</Text><View style={s.details}>
      <Detail label="Date of birth" value={formatBirthday(draft.dateOfBirth)} /><Detail label="Gender" value={genderLabel(draft.gender)} /><Detail label="Location" value={draft.location || 'Not added'} />
    </View></View>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Body details</Text><View style={s.details}>
      <Detail label="Weight" value={user.weightValue ? `${user.weightValue} ${user.weightUnit === 'lb' ? 'lbs' : 'kg'}` : 'Not added'} />
      <Detail label="Height" value={user.heightValue ? `${user.heightValue} ${user.heightUnit === 'in' ? 'in' : 'cm'}` : 'Not added'} />
      <Detail label="BMI" value={user.bmi?.toFixed(1) ?? 'Not available'} />
    </View></View>
    <View style={c.section}><Text accessibilityRole="header" style={c.title}>Your priorities</Text><Text style={[c.text, { marginTop: 10 }]}>{goals.map(goal => goal.title).join(' · ') || 'No goals added'}</Text><Text style={[c.text, { marginTop: 6 }]}>{activities.find(activity => activity.value === draft.activityLevel)?.title || 'Activity level not added'}</Text></View>
    <View style={[c.section, c.line]}><CareRow title="Goals & preferences" detail="Wellness goals, activity and updates" onPress={() => router.push('/edit-health-goals')} /></View>
  </AppScreen>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <View style={s.detail}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text></View>;
}
const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settings: { width: 48, alignItems: 'flex-end', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 28 }, flex: { flex: 1 },
  name: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 29, color: colors.ink, marginBottom: 5 },
  edit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', gap: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 18, marginTop: 20 },
  editText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primary },
  details: { marginTop: 12, backgroundColor: colors.surface, paddingHorizontal: 16, borderRadius: 12 },
  detail: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.border },
  label: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.muted },
  value: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
