import { normalizeInviteCode } from '../../referrals/model';
import { referralCodeSchema } from '../../auth/types';
import { usePalette } from '../../../theme/AppearanceProvider';
import { FocusScrollView } from '../../../components/ui/FocusScrollView';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../auth/context/AuthContext';
import { FormError } from '../../auth/components/AuthPrimitives';
import { Button } from '../../../components/ui/Button';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { CareBrand, useCareStyles } from '../../../components/app/CareUI';
import { AppIcon } from '../../../components/app/AppIcon';
import { fonts } from '../../../theme/tokens';
import { activities, convertMeasurement, type SetupDraft } from '../model';
import { primaryGoals } from '../profileOptions';
import { ChoiceCard, UnitSelector } from './ProfilePrimitives';
import { ProfileInput } from './ProfileInput';
import { ProfileBirthDatePicker } from './ProfileBirthDatePicker';
import { formatBirthday, profileDraft } from '../profileViewModel';
import { resumeSetup, setupPayload, validateSetupStep, type SetupStep } from '../setupJourney';

export function ProfileSetupScreen() {
  const c = useCareStyles();
  const s = useStyles();

  const { user, saveSetup, applyReferral } = useAuth();
  const params = useLocalSearchParams<{ ref?: string | string[] }>();
  const [referralCode, setReferralCode] = useState(() => normalizeInviteCode(params.ref));
  const [draft, setDraft] = useState<SetupDraft>(() => profileDraft(user!));
  const [step, setStep] = useState<SetupStep>(() => resumeSetup(profileDraft(user!)));
  const [complete, setComplete] = useState(Boolean(user?.profileCompletedAt));
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [pickingBirthday, setPickingBirthday] = useState(false);
  const set = <K extends keyof SetupDraft>(key: K, value: SetupDraft[K]) => { setDraft(current => ({ ...current, [key]: value })); setError(null); };
  useEffect(() => {
    if (!complete) return;
    const timer = setTimeout(() => router.replace('/home'), 1000);
    return () => clearTimeout(timer);
  }, [complete]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (busyRef.current || complete) return true;
      if (step === 0) return false;
      setError(null); setStep(current => (current - 1) as SetupStep); return true;
    });
    return () => subscription.remove();
  }, [step, complete]);
  const next = async () => {
    if (busyRef.current || complete) return;
    const invalid = validateSetupStep(draft, step);
    if (invalid) { setError(invalid); return; }
    Keyboard.dismiss(); setError(null); busyRef.current = true; setBusy(true);
    try {
      if (step === 2 && referralCode.trim() && !user?.hasReferrer) {
        const parsed = referralCodeSchema.safeParse(referralCode);
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await applyReferral(parsed.data);
      }
      await saveSetup(setupPayload(draft, step));
      if (step === 2) setComplete(true);
      else setStep((step + 1) as SetupStep);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  if (complete) return <SafeAreaView style={s.safe}><View style={s.success}><AppIcon name="check" size={48} /><Text accessibilityRole="header" style={c.heading}>You’re ready.</Text><Text style={[c.text, { textAlign: 'center' }]}>Your profile is saved. Let’s make room for a little care.</Text></View></SafeAreaView>;
  const titles = ['What matters to you?', 'A little about you', 'Find your everyday rhythm'];
  const descriptions = ['Choose one or more goals. You can change them anytime.', 'These details give your health profile a useful starting point.', 'Choose the activity level that feels closest to your routine.'];
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={s.container}>
    <View style={s.header}>{step > 0 ? <TouchTarget accessibilityRole="button" accessibilityLabel="Previous step" disabled={busy} onPress={() => { setError(null); setStep((step - 1) as SetupStep); }} style={s.back}><AppIcon name="back" size={21} /></TouchTarget> : <CareBrand />}<Text style={s.step}>Step {step + 1} of 3</Text></View>
    <View style={s.progress} accessibilityLabel={`Setup step ${step + 1} of 3`}>{[0, 1, 2].map(index => <View key={index} style={[s.segment, index <= step && s.segmentActive]} />)}</View>
    <FocusScrollView keyboardShouldPersistTaps="handled" bounces={false} contentContainerStyle={s.body}>
      <Text accessibilityRole="header" style={c.heading}>{titles[step]}</Text><Text style={c.text}>{descriptions[step]}</Text>
      <View style={s.fields}>
        {step === 0 && primaryGoals.map(goal => <ChoiceCard key={goal.value} {...goal} multiple selected={draft.healthGoals.includes(goal.value)} onPress={busy ? undefined : () => set('healthGoals', draft.healthGoals.includes(goal.value) ? draft.healthGoals.filter(value => value !== goal.value) : [...draft.healthGoals, goal.value])} />)}
        {step === 1 && <>
          <ProfileInput label="Date of birth" icon="calendar" value={draft.dateOfBirth ? formatBirthday(draft.dateOfBirth) : ''} placeholder="Choose your birthday" editable={!busy} onPress={() => { Keyboard.dismiss(); setPickingBirthday(true); }} />
          <View style={s.measurements}><View style={s.measurement}><ProfileInput label="Weight" icon="weight" placeholder="Your weight" value={draft.weightValue} keyboardType="decimal-pad" editable={!busy} onChangeText={value => set('weightValue', value)} suffix={draft.weightUnit === 'lb' ? 'lbs' : 'kg'} /><UnitSelector units={['kg', 'lbs']} value={draft.weightUnit === 'lb' ? 'lbs' : 'kg'} onChange={value => { if (busy) return; const unit = value === 'lbs' ? 'lb' : 'kg'; if (unit !== draft.weightUnit) { set('weightValue', convertMeasurement(draft.weightValue, unit === 'lb' ? 2.20462262 : 0.45359237)); set('weightUnit', unit); } }} /></View>
          <View style={s.measurement}><ProfileInput label="Height" icon="height" placeholder="Your height" value={draft.heightValue} keyboardType="decimal-pad" editable={!busy} onChangeText={value => set('heightValue', value)} suffix={draft.heightUnit === 'in' ? 'in' : 'cm'} /><UnitSelector units={['cm', 'inch']} value={draft.heightUnit === 'in' ? 'inch' : 'cm'} onChange={value => { if (busy) return; const unit = value === 'inch' ? 'in' : 'cm'; if (unit !== draft.heightUnit) { set('heightValue', convertMeasurement(draft.heightValue, unit === 'in' ? 1 / 2.54 : 2.54)); set('heightUnit', unit); } }} /></View></View>
          <Text style={c.text}>Only the essentials for now. Add other personal details later in your profile.</Text>
        </>}
        {step === 2 && <View accessibilityRole="radiogroup" style={s.fields}>{activities.map(activity => <ChoiceCard key={activity.value} {...activity} selected={draft.activityLevel === activity.value} onPress={busy ? undefined : () => set('activityLevel', activity.value)} />)}</View>}
      </View>
      {step === 2 && <View style={{ marginTop: 24, gap: 10 }}><Text style={c.title}>Invited by a friend?</Text>{user?.hasReferrer ? <Text style={c.text}>Your friend&apos;s referral code has been recorded.</Text> : <><ProfileInput label="Referral code (optional)" icon="users" placeholder="Enter your friend's code" value={referralCode} onChangeText={value => { setReferralCode(value.toUpperCase()); setError(null); }} autoCapitalize="characters" autoCorrect={false} maxLength={12} editable={!busy} /><Text style={c.text}>Leave blank to skip. Your referrer is recorded when you tap Finish setup and cannot be changed.</Text></>}</View>}
      <FormError message={error} />
    </FocusScrollView>
    <View style={s.footer}><Button title={step === 2 ? 'Finish setup' : 'Continue'} onPress={() => void next()} loading={busy} /><Text style={s.note}>You can update these choices from your profile.</Text></View>
  </View></KeyboardAvoidingView>{pickingBirthday && <ProfileBirthDatePicker value={draft.dateOfBirth} onClose={() => setPickingBirthday(false)} onSelect={value => { set('dateOfBirth', value); setPickingBirthday(false); }} />}</SafeAreaView>;
}
const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, fill: { flex: 1 }, container: { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, minHeight: 64 }, back: { width: 48, justifyContent: 'center' },
  step: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted }, progress: { flexDirection: 'row', gap: 6, marginHorizontal: 24, marginTop: 20, marginBottom: 28 }, segment: { flex: 1, height: 3, backgroundColor: colors.border, borderRadius: 2 }, segmentActive: { backgroundColor: colors.primary },
  body: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 }, fields: { gap: 12, marginTop: 14 }, measurements: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, measurement: { flex: 1, minWidth: 160, gap: 12 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, borderTopWidth: 1, borderColor: colors.border, gap: 12 }, note: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center' },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
});
};
