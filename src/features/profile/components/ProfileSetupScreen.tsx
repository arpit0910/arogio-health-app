import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { useAuth } from '../../authentication/context/AuthContext';
import { DAction, DCard, DField, DHeading, DProgress, DTabs, DText, design, ds } from '../../../components/app/DesignUI';
import { FigmaAsset } from '../../../components/app/FigmaAsset';
import { Avatar } from '../../../components/app/Avatar';
import { AppIcon } from '../../../components/app/AppIcon';
import { Button } from '../../../components/ui/Button';
import { TouchTarget } from '../../../components/ui/TouchTarget';
import { ProfileBirthDatePicker } from './ProfileBirthDatePicker';
import { profileDraft, profilePhoto, formatBirthday } from '../profileViewModel';
import { validBirthDate } from '../model';
import { usePalette } from '../../../theme/AppearanceProvider';
import { useTranslation } from '../../../localization/LanguageProvider';

export function ProfileSetupScreen() {
  const router = useRouter(), { user, saveSetup } = useAuth();
  const colors = usePalette(), { t } = useTranslation();
  const [showOptional, setShowOptional] = useState(false);
  const initial = user ? profileDraft(user) : null;
  const [name, setName] = useState(user?.fullName ?? ''), [mobile, setMobile] = useState(String(user?.profileSetup?.contactNumber ?? user?.mobileNumber ?? ''));
  const [dob, setDob] = useState(initial?.dateOfBirth ?? ''), [gender, setGender] = useState(initial?.gender ?? '');
  const [blood, setBlood] = useState(String(user?.profileSetup?.bloodGroup ?? ''));
  const [city, setCity] = useState(initial?.location ?? ''), [area, setArea] = useState(''), [photo, setPhoto] = useState(user ? profilePhoto(user) : undefined);
  const [picking, setPicking] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false);
  async function act(work: () => Promise<void>) { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { lock.current = false; setBusy(false); } }
  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const image = result.assets[0], side = Math.min(image.width, image.height), context = ImageManipulator.manipulate(image.uri);
    context.crop({ originX: Math.floor((image.width - side) / 2), originY: Math.floor((image.height - side) / 2), width: side, height: side }).resize({ width: 256, height: 256 });
    const rendered = await context.renderAsync(), encoded = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
    if (!encoded.base64 || encoded.base64.length > 213000) throw new Error('Please choose a smaller photo.');
    setPhoto(`data:image/jpeg;base64,${encoded.base64}`);
  }
  async function locate() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error('Location access is off. Enter your city below.');
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [address] = await Location.reverseGeocodeAsync(position.coords);
    if (!address) throw new Error('Could not find your city. Enter it below.');
    setCity([address.city || address.district, address.region].filter(Boolean).join(', ')); setArea(address.subregion || address.street || '');
  }
  async function next() {
    if (name.trim().length < 2 || !validBirthDate(dob) || !gender) { setError('Enter your name, date of birth and gender.'); return; }
    if (mobile && !/^\+?[0-9]{10,15}$/.test(mobile.replace(/[ -]/g, ''))) { setShowOptional(true); setError('Enter a valid mobile number.'); return; }
    await act(async () => {
      await saveSetup({ flowVersion: 2, fullName: name.trim(), dateOfBirth: dob, gender, location: [city, area].filter(Boolean).join(', ').slice(0, 100), ...(blood ? { bloodGroup: blood } : {}), ...(mobile ? { contactNumber: mobile.replace(/[ -]/g, '') } : {}), ...(photo?.startsWith('data:') ? { photo } : {}), step: 1, complete: true });
      router.replace({ pathname: '/connected-health', params: { setup: '1' } });
    });
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 36, width: '100%', maxWidth: 440, alignSelf: 'center', gap: 20 }}>
    <View style={ds.row}><TouchTarget accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}><AppIcon name="back" size={22} color={design.ink} /></TouchTarget><DText kind="title" style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>Profile Setup</DText><DAction label="Skip" disabled={busy} onPress={() => void act(async () => { await saveSetup({ setupDeferred: true }); router.replace({ pathname: '/connected-health', params: { setup: '1' } }); })} /></View>
    <View style={{ gap: 10 }}><View style={[ds.row, { justifyContent: 'space-between' }]}><DText kind="label">Step 1 of 2</DText></View><DProgress value={0.5} /></View>
    <View style={{ gap: 6, padding: 20, borderRadius: 24, backgroundColor: colors.mintSurface }}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <AppIcon name="user" size={23} color={colors.primary} />
      </View>
      <DHeading title="Personal details" subtitle="Add your details now, or finish your profile later." />
    </View>
    <DField leading={<FigmaAsset screen="3:97" name="imgIcon" width={16} />} label="Full Legal Name *" placeholder="Your full name" value={name} onChangeText={setName} autoComplete="name" />
    <View style={{ gap: 7 }}><DText kind="label">Date of Birth *</DText><TouchTarget accessibilityRole="button" onPress={() => setPicking(true)} style={{ backgroundColor: design.pale, paddingHorizontal: 14, minHeight: 50, borderRadius: 12, justifyContent: 'center' }}><DText>{dob ? formatBirthday(dob) : 'Select date of birth'}</DText></TouchTarget></View>
    <View style={{ gap: 8 }}>
      <DText kind="label">Gender *</DText>
      <DTabs grid options={['Male', 'Female', 'Other', 'Prefer not to say']}
        value={gender === 'prefer_not_to_say' ? 'Prefer not to say' : gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ''}
        onChange={value => setGender(value === 'Prefer not to say' ? 'prefer_not_to_say' : value.toLowerCase())} />
    </View>
    <TouchTarget accessibilityRole="button" accessibilityState={{ expanded: showOptional }}
      onPress={() => setShowOptional(!showOptional)}
      style={[ds.row, { minHeight: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.subtle }]}>
      <DText kind="label" style={{ flex: 1 }}>Optional profile details</DText>
      <AppIcon name={showOptional ? 'up' : 'down'} size={18} color={colors.primary} />
    </TouchTarget>
    {showOptional && <View style={{ gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 6 }}><TouchTarget accessibilityRole="button" accessibilityLabel="Add Profile Photo" disabled={busy} onPress={() => void act(choosePhoto)}><Avatar photo={photo} size={88} camera /></TouchTarget><DAction label="Add Profile Photo" disabled={busy} onPress={() => void act(choosePhoto)} /></View>
      <DField label="Mobile Number" placeholder="+91" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      <View style={{ gap: 10 }}><View style={[ds.row, { justifyContent: 'space-between' }]}><DText kind="label">Blood Group</DText></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityState={{ checked: blood === value }} onPress={() => setBlood(value)} style={{ width: '22%', minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: blood === value ? design.green : '#FFFFFF' }}><DText kind="label" color={blood === value ? '#FFFFFF' : design.ink}>{value}</DText></TouchTarget>)}</View></View>
      <DCard><DHeading title="Location & Vicinity" icon="location" /><DField label="Primary City" value={city} onChangeText={setCity} placeholder="City, State" /><DField label="Area / Locality" value={area} onChangeText={setArea} placeholder="Your area" /><DAction label="Use Current Location" disabled={busy} onPress={() => void act(locate)} /></DCard>
    </View>}
    <View style={[ds.row, { padding: 14, borderRadius: 12, backgroundColor: design.mint }]}><AppIcon name="shield" size={20} color={design.green} /><DText style={{ flex: 1 }}>Your health details stay in your Arogio account. You can update these details from Profile.</DText></View>
    {!!error && <DText color={colors.error}>{error}</DText>}<Button title={t('Save & Continue')} loading={busy} onPress={() => void next()} />
  </ScrollView>{picking && <ProfileBirthDatePicker value={dob} onSelect={value => { setDob(value); setPicking(false); }} onClose={() => setPicking(false)} />}</SafeAreaView>;
}
