import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { AuthCanvas } from '../../auth/components/AuthCanvas';
import { AuthIcon } from '../../auth/components/AuthIcon';
import { FormError } from '../../auth/components/AuthPrimitives';
import { useAuth } from '../../auth/context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { colors, fonts } from '../../../theme/tokens';
import { profileAssets } from '../assets/profileAssets';
import { activities, goals, genders, type SetupDraft, validBirthDate, validatePersonal, convertMeasurement } from '../model';
import { ChoiceCard, ProfileDialog, ProfileField, ProfileHeading, ProfileIcon, ProfileProgress, UnitSelector, profileStyles as ps } from './ProfilePrimitives';

export function ProfileSetupScreen() {
  const { user, saveSetup, logout } = useAuth();
  const saved = user?.profileSetup ?? {};
  const [step, setStep] = useState(user?.profileCompletedAt ? 7 : Math.min(6, Math.max(0, Number(saved.step) || 0)));
  const [draft, setDraft] = useState<SetupDraft>(() => ({
    dateOfBirth: String(saved.dateOfBirth ?? ''), weightValue: String(user?.weightValue ?? ''), weightUnit: user?.weightUnit ?? 'kg',
    heightValue: String(user?.heightValue ?? ''), heightUnit: user?.heightUnit ?? 'cm',
    activityLevel: String(saved.activityLevel ?? ''), healthGoals: Array.isArray(saved.healthGoals) ? saved.healthGoals as string[] : [],
    gender: String(saved.gender ?? ''), location: String(saved.location ?? ''), referralSource: String(saved.referralSource ?? ''),
    healthReminders: saved.healthReminders !== false, tipsAndInsights: saved.tipsAndInsights !== false, productUpdates: saved.productUpdates === true,
  }));
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<'dateOfBirth' | 'gender' | 'location' | 'referralSource' | null>(null);
  const [dialogValue, setDialogValue] = useState('');
  const set = <K extends keyof SetupDraft>(key: K, value: SetupDraft[K]) => { setDraft(d => ({ ...d, [key]: value })); setError(null); };
  const back = () => {
    if (busyRef.current || step === 7) return;
    setError(null);
    if (editing) { setEditing(false); setStep(6); }
    else if (step > 0) setStep(step - 1);
    else void logout();
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { back(); return true; });
    return () => subscription.remove();
  });
  const openDialog = (key: typeof dialog) => { if (key) { setDialogValue(draft[key]); setDialog(key); } };
  const next = async () => {
    if (busyRef.current) return;
    setError(null);
    if (step === 7) { router.replace('/'); return; }
    let invalid: string | null = null;
    if (step === 1 || step === 6) invalid = validatePersonal(draft);
    if ((step === 2 || step === 6) && !draft.activityLevel) invalid = 'Choose your activity level.';
    if ((step === 3 || step === 6) && !draft.healthGoals.length) invalid = 'Choose at least one health goal.';
    if (invalid) { setError(invalid); return; }
    busyRef.current = true; setBusy(true);
    const target = editing ? 6 : step + 1;
    try {
      const { weightValue, heightValue, ...details } = draft;
      // Only persist measurements once entered; never send empty strings as zero.
      await saveSetup({ ...details,
        ...(weightValue ? { weightValue: Number(weightValue), weightUnit: draft.weightUnit } : {}),
        ...(heightValue ? { heightValue: Number(heightValue), heightUnit: draft.heightUnit } : {}),
        ...(!weightValue ? { weightUnit: undefined } : {}), ...(!heightValue ? { heightUnit: undefined } : {}),
        dateOfBirth: draft.dateOfBirth || undefined, activityLevel: draft.activityLevel || undefined, gender: draft.gender || undefined,
        step: target, complete: step === 6,
      });
      setEditing(false); setStep(target);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save your profile. Please try again.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const edit = (target: number) => { setEditing(true); setStep(target); setError(null); };
  const birthLabel = draft.dateOfBirth && validBirthDate(draft.dateOfBirth) ? new Date(draft.dateOfBirth + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : draft.dateOfBirth;
  const dialogTitle = dialog === 'dateOfBirth' ? 'Date of birth' : dialog === 'gender' ? 'Gender' : dialog === 'location' ? 'Location' : 'How did you hear about Arogio?';
  return <AuthCanvas background="backgroundSignup" backgroundXml={step === 0 ? profileAssets.introBackground : step === 7 ? profileAssets.completeBackground : profileAssets.formBackground}><View style={s.screen}>
    {step !== 7 && <><TouchTarget accessibilityRole="button" accessibilityLabel={step === 0 ? 'Back to signup' : 'Go back'} disabled={busy} onPress={back} style={s.back}><ProfileIcon name="back" /></TouchTarget><ProfileProgress step={step} /></>}
    {(step === 0 || step === 7) ? <View style={[s.hero, step === 7 && s.completeHero]}>
      <SvgXml xml={step === 0 ? profileAssets.intro : profileAssets.complete} width={step === 0 ? 286 : 278} height={step === 0 ? 250 : 255} />
      <Text accessibilityRole="header" style={[ps.title, s.heroTitle]}>{step === 0 ? <>Let&apos;s set up{'\n'}<Text style={{ color: colors.primary }}>your profile</Text></> : "You're all set!"}</Text>
      <Text style={ps.centeredCopy}>{step === 0 ? 'This helps us personalize your experience\nand give better suggestions.' : "Your profile is ready. Let's start\nyour health journey with Arogio."}</Text>
    </View> : <View style={ps.body}>
      {step === 1 && <><ProfileHeading title="Personal details" subtitle="Tell us a bit about yourself." />
        <ProfileField label="Date of birth" icon="calendar" value={birthLabel} onPress={() => openDialog('dateOfBirth')} />
        <ProfileField label="Weight" icon="weight" value={draft.weightValue} numeric onChange={v => set('weightValue', v)} suffix={draft.weightUnit === 'lb' ? 'lbs' : 'kg'} />
        <UnitSelector units={['kg', 'lbs']} value={draft.weightUnit === 'lb' ? 'lbs' : 'kg'} onChange={v => { const unit = v === 'lbs' ? 'lb' : 'kg'; if (unit !== draft.weightUnit) { set('weightValue', convertMeasurement(draft.weightValue, unit === 'lb' ? 2.20462262 : 0.45359237)); set('weightUnit', unit); } }} />
        <ProfileField label="Height" icon="height" value={draft.heightValue} numeric onChange={v => set('heightValue', v)} suffix={draft.heightUnit === 'in' ? 'inch' : 'cm'} />
        <UnitSelector units={['cm', 'inch']} value={draft.heightUnit === 'in' ? 'inch' : 'cm'} onChange={v => { const unit = v === 'inch' ? 'in' : 'cm'; if (unit !== draft.heightUnit) { set('heightValue', convertMeasurement(draft.heightValue, unit === 'in' ? 1 / 2.54 : 2.54)); set('heightUnit', unit); } }} />
      </>}
      {step === 2 && <><ProfileHeading title="Your lifestyle" subtitle="This helps us understand your daily routine." /><Text style={s.label}>Activity level</Text><View accessibilityRole="radiogroup" style={s.choices}>{activities.map(a => <ChoiceCard key={a.value} {...a} selected={draft.activityLevel === a.value} onPress={() => set('activityLevel', a.value)} />)}</View></>}
      {step === 3 && <><ProfileHeading title="Your health goals" subtitle={'Choose what matters most to you.\nYou can select multiple goals.'} /><View style={s.choices}>{goals.map(g => <ChoiceCard key={g.value} {...g} multiple selected={draft.healthGoals.includes(g.value)} onPress={() => set('healthGoals', draft.healthGoals.includes(g.value) ? draft.healthGoals.filter(v => v !== g.value) : [...draft.healthGoals, g.value])} />)}</View></>}
      {step === 4 && <><ProfileHeading title="A few more details" subtitle="This information helps us provide more relevant recommendations." />
        <ProfileField label="Gender" icon="user" value={genders.find(g => g.value === draft.gender)?.label ?? ''} onPress={() => openDialog('gender')} />
        <ProfileField label="Location" icon="location" value={draft.location} onPress={() => openDialog('location')} />
        <ProfileField label="How did you hear about Arogio?" icon="referral" value={draft.referralSource} onPress={() => openDialog('referralSource')} />
      </>}
      {step === 5 && <><ProfileHeading title="Stay on track" subtitle="Get helpful reminders and insights to reach your goals." />
        {([{ key: 'healthReminders', title: 'Health reminders', subtitle: 'Take medications, track habits and daily check-ins', icon: 'bell' }, { key: 'tipsAndInsights', title: 'Tips and insights', subtitle: 'Personalized health tips and recommendations', icon: 'tips' }, { key: 'productUpdates', title: 'Product updates', subtitle: 'New features and important announcements', icon: 'email' }] as const).map(p => <View key={p.key} style={s.preference}><ChoiceCard {...p}><Switch accessibilityLabel={p.title} value={draft[p.key]} onValueChange={v => set(p.key, v)} trackColor={{ false: '#CBD5E1', true: '#168C80' }} thumbColor="#FFFFFF" /></ChoiceCard></View>)}
      </>}
      {step === 6 && <><ProfileHeading title="Review your profile" subtitle="Please check your details before continuing." />
        <View style={s.review}>{[
          { label: 'Date of birth', value: birthLabel, icon: 'calendar', target: 1 },
          { label: 'Weight', value: `${draft.weightValue} ${draft.weightUnit === 'lb' ? 'lbs' : 'kg'}`, icon: 'weight', target: 1 },
          { label: 'Height', value: `${draft.heightValue} ${draft.heightUnit === 'in' ? 'inch' : 'cm'}`, icon: 'height', target: 1 },
          { label: 'Activity level', value: activities.find(a => a.value === draft.activityLevel)?.title, icon: 'activity', target: 2 },
          { label: 'Health goals', value: goals.filter(g => draft.healthGoals.includes(g.value)).map(g => g.title).join(', '), icon: 'goal', target: 3 },
        ].map((r, i) => <View key={r.label} style={[s.reviewRow, i > 0 && s.reviewBorder]}><View style={s.reviewIcon}><ProfileIcon name={r.icon} /></View><View style={s.reviewCopy}><Text style={s.reviewLabel}>{r.label}</Text><Text style={s.reviewValue}>{r.value}</Text></View><TouchTarget accessibilityRole="button" accessibilityLabel={`Edit ${r.label.toLowerCase()}`} onPress={() => edit(r.target)} style={s.edit}><Text style={ps.link}>Edit</Text></TouchTarget></View>)}</View>
        <View style={s.privacy}><View style={s.reviewIcon}><ProfileIcon name="shield" /></View><View style={s.reviewCopy}><Text style={s.privacyTitle}>Your information is private</Text><Text style={s.privacyCopy}>This information helps us give you personalized recommendations. You can update it anytime from your profile.</Text></View></View>
      </>}
    </View>}
    <View style={s.footer}><FormError message={error} /><Button title={step === 0 ? 'Get Started' : step === 6 ? 'Looks Good' : step === 7 ? 'Continue to App' : 'Continue'} onPress={() => void next()} loading={busy} trailing={<AuthIcon name="arrow" />} />
      {step === 6 && <TouchTarget accessibilityRole="button" onPress={back} disabled={busy} style={s.goBack}><Text style={ps.link}>Go Back</Text></TouchTarget>}
    </View>
    {dialog && <ProfileDialog title={dialogTitle} value={dialogValue} onChange={setDialogValue} options={dialog === 'gender' ? genders : undefined} onClose={() => setDialog(null)} onSave={() => {
      if (dialog === 'dateOfBirth' && !validBirthDate(dialogValue)) { setError('Enter a valid date of birth (YYYY-MM-DD) in the past.'); setDialog(null); return; }
      set(dialog, dialogValue.trim()); setDialog(null);
    }} />}
  </View></AuthCanvas>;
}
const s = StyleSheet.create({
  screen: { flex: 1, minHeight: 678, paddingBottom: 24 }, back: { marginLeft: 14, width: 48, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 20, marginTop: 50 }, completeHero: { marginTop: 115 }, heroTitle: { marginTop: 28 },
  label: { fontFamily: fonts.semibold, color: colors.ink, fontSize: 11.5 }, choices: { gap: 10 }, preference: { marginBottom: 2 },
  footer: { paddingHorizontal: 24, marginTop: 'auto', paddingTop: 24 }, goBack: { justifyContent: 'center', alignItems: 'center', marginBottom: -14 },
  review: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }, reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14, paddingRight: 8, paddingVertical: 4, minHeight: 54 }, reviewBorder: { borderTopWidth: 1, borderColor: '#F1F4F8' },
  reviewIcon: { backgroundColor: '#EBF7F4', borderRadius: 20, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }, reviewCopy: { flex: 1 }, reviewLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginBottom: 2 }, reviewValue: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, color: colors.ink }, edit: { width: 38, justifyContent: 'center', alignItems: 'center' },
  privacy: { backgroundColor: '#EBF7F4', borderWidth: 1, borderColor: '#CBEAE3', padding: 12, borderRadius: 16, flexDirection: 'row', gap: 8 }, privacyTitle: { fontFamily: fonts.bold, fontSize: 10.5, color: colors.primary, marginBottom: 4 }, privacyCopy: { fontFamily: fonts.regular, fontSize: 9.5, lineHeight: 13, color: colors.muted },
});
