import { useRef, useState } from 'react';
import { Platform, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DAction, DCard, DHeading, DPill, DProgress, DText, design, ds } from '../../components/app/DesignUI';
import { FigmaAsset } from '../../components/app/FigmaAsset';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useHealthSync } from './HealthSyncProvider';
import { appHealthMetrics, connectableHealthApps, type HealthApp } from './connection';
import { installHealthConnect } from './healthConnect';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';

export function HealthConnectScreen() {
  const router = useRouter(), { setup } = useLocalSearchParams<{ setup?: string }>(), health = useHealthSync();
  const colors = usePalette(), { t } = useTranslation();
  const [choosing, setChoosing] = useState(false), [error, setError] = useState(''), [working, setWorking] = useState(false), lock = useRef(false);
  const leave = () => setup ? router.replace('/home') : router.canGoBack() ? router.back() : router.replace('/home');
  async function connect(app?: HealthApp, enter = false) {
    if (lock.current || health.busy) return;
    lock.current = true; setWorking(true); setError('');
    try {
      if (health.connected && !app) { await health.disconnect(); return; }
      if (Platform.OS !== 'android') { setError('Health Connect is available in the Android app.'); return; }
      if (health.availability === 'update-required') { await installHealthConnect(); return; }
      if (health.availability !== 'available') { await health.checkAvailability(); setError('Health Connect is not ready. Check availability and try again.'); return; }
      const apps = connectableHealthApps(app ? [app] : await health.refreshApps());
      if (!apps.length) { setError('No compatible apps found. Enable Health Connect sharing in your health app, then try again.'); return; }
      if (apps.length > 1 && !app) { setChoosing(true); return; }
      if (await health.connectSource(apps[0], appHealthMetrics(apps[0]))) { setChoosing(false); if (enter) leave(); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not connect. Please try again.'); }
    finally { lock.current = false; setWorking(false); }
  }
  if (setup) {
    const busy = working || health.busy;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 440, alignSelf: 'center', padding: 16, paddingBottom: 36, gap: 20 }}>
          <DText kind="label">Step 2 of 2</DText>
          <DProgress value={1} color={colors.primary} />
          <View style={{ backgroundColor: colors.mintSurface, borderRadius: 24, padding: 20, gap: 12 }}>
            <AppIcon name="shield" color={colors.primary} size={28} />
            <DHeading title="Connect your health data" subtitle="Use Arogio on its own, or bring in readings from a compatible Android health app." />
          </View>
          <DText>Health Connect lets you choose which readings to share. Manage access anytime in Settings.</DText>
          {choosing && connectableHealthApps(health.apps).map(app => (
            <DAction key={app.id} label={app.name} disabled={busy} onPress={() => void connect(app, true)} />
          ))}
          {!!(error || health.error) && <DText color={colors.error}>{error || health.error}</DText>}
          {Platform.OS === 'android' && !health.connected && (
            <Button title={t('Connect on Android')} loading={busy} onPress={() => void connect(undefined, true)} />
          )}
          <Button title={t('Continue to Home')} variant={Platform.OS === 'android' && !health.connected ? 'secondary' : 'primary'} disabled={busy} onPress={leave} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: design.background }}><ScrollView contentContainerStyle={{ width: '100%', maxWidth: 440, alignSelf: 'center', padding: 16, paddingBottom: 36, gap: 24 }}>
    <View style={ds.row}><TouchTarget accessibilityRole="button" accessibilityLabel="Back" onPress={leave}><AppIcon name="back" size={22} color={design.ink} /></TouchTarget><DText kind="title" style={{ flex: 1 }}>Health Connect</DText><DAction label="Skip" onPress={leave} /></View>
    <DCard style={{ backgroundColor: '#EDF6F2', height: 192, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 16 }}><View style={{ width: 208, height: 80, position: 'relative', marginTop: 4 }}><View style={{ position: 'absolute', top: 12, left: 0, width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] }}><FigmaAsset screen="3:294" name="imgContainer" width={15.167} /><DText kind="small" style={{ fontSize: 9, lineHeight: 13 }}>Watch</DText></View><View style={{ position: 'absolute', left: 56, top: -8, width: 96, height: 96, borderRadius: 48, backgroundColor: '#D6EDE7', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#B4D8CE', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#00624E', alignItems: 'center', justifyContent: 'center' }}><FigmaAsset screen="3:294" name="imgContainer1" width={26.667} /></View></View></View><View style={{ position: 'absolute', top: 12, right: 0, width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '6deg' }] }}><FigmaAsset screen="3:294" name="imgContainer2" width={16.25} /><DText kind="small" style={{ fontSize: 9, lineHeight: 13 }}>Arogio</DText></View></View><FigmaAsset screen="3:294" name="imgVector" width={260} height={26} /><DPill>Optional health data sync</DPill></DCard>
    <View style={{ gap: 10, alignItems: 'center' }}><DText kind="title" style={{ fontSize: 24, lineHeight: 32, alignSelf: 'flex-start' }}>Sync Your Health Data</DText><DText style={{ lineHeight: 21 }}>Connect a compatible Android health app through Health Connect to import available readings. You choose the records you share.</DText></View>
    <DCard><View style={[ds.row, { justifyContent: 'space-between' }]}><DPill>Recommended for Android</DPill><DPill>{health.connected ? 'Connected' : health.availability === 'available' ? 'Available' : 'Not connected'}</DPill></View><View style={ds.row}><FigmaAsset screen="3:294" name="imgContainer4" width={32} height={24} /><View style={{ flex: 1 }}><DText kind="title">Google Health Connect</DText><DText>Sync steps, sleep stages, active calories and heart rate.</DText></View><Switch accessibilityLabel="Google Health Connect" disabled={working || health.busy} value={health.connected} onValueChange={() => void connect()} trackColor={{ false: design.mint, true: design.green }} /></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{['Steps', 'Sleep Stages', 'Hydration', 'Heart Rate'].map(label => <DPill key={label}>{label}</DPill>)}</View>
      {choosing && connectableHealthApps(health.apps).map(app => <DAction key={app.id} label={app.name} onPress={() => void connect(app)} />)}
    </DCard>
    <DCard><View style={ds.row}><FigmaAsset screen="3:294" name="imgContainer10" width={30} /><View style={{ flex: 1 }}><DText kind="title">Apple HealthKit</DText><DPill>iOS Sync</DPill><DText>Securely import Apple Watch workouts, HRV, and respiratory metrics.</DText></View><DPill>Not available in this build</DPill></View></DCard>
    <DCard><View style={ds.row}><FigmaAsset screen="3:294" name="imgContainer11" width={28} /><View style={{ flex: 1 }}><DText kind="title">Garmin, Fitbit & Others</DText><DText>Noise, boAt, Fire-Boltt, or Garmin wearable bridges.</DText></View><Switch accessibilityLabel="Other wearables" value={Boolean(health.source && !/google/i.test(health.source.name) && health.connected)} onValueChange={() => { setChoosing(true); void health.refreshApps(); }} trackColor={{ false: design.mint, true: design.green }} /></View>{choosing && <DAction label="Manage installed health apps >" onPress={() => router.push('/connected-health-settings')} />}</DCard>
    <DCard style={{ backgroundColor: design.pale }}><DHeading title="Your Privacy, Protected" icon="shield" />{['Read-only access: You choose the records you share.', 'Secure access: Your health app controls permissions.', 'Zero-commitment: Disconnect at any time.'].map(text => <View key={text} style={ds.row}><AppIcon name="check" size={16} color={design.green} /><DText style={{ flex: 1 }}>{text}</DText></View>)}</DCard>
    {!!(error || health.error) && <DText color="#BD3038">{error || health.error}</DText>}
    <Button title="Enable Sync & Enter App" loading={working || health.busy} onPress={() => { if (health.connected) leave(); else void connect(undefined, true); }} />
    <DAction label="Connect Later (Continue to Home)" onPress={leave} />
  </ScrollView></SafeAreaView>;
}
