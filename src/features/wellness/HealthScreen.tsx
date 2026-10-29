import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareBrand, CareRow, useCareStyles } from '../../components/app/CareUI';
import { useWellness } from './WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { homeWater } from '../home/homeModel';
import { useTrackingClock } from './useTrackingClock';
import { TrackingStatus } from './TrackingUI';

export function HealthScreen() {
  const c = useCareStyles();

  const { data, loading } = useWellness();
  const health = useHealthSync();
  const now = useTrackingClock();
  const water = homeWater(data, now);
  const medicines = data.medicines ?? [];
  const doseTimes = medicines.reduce((count, medicine) => count + medicine.doses.length, 0);
  return <AppScreen>
    <CareBrand />
    <View style={[c.section, { gap: 8 }]}><Text style={c.heading}>Care, at your pace.</Text><Text style={c.text}>Small check-ins for your everyday health.</Text></View>
    <TrackingStatus />
    <>
      <View style={c.section}>
        <Text accessibilityRole="header" style={c.title}>Your daily routines</Text>
        <CareRow icon="trend" title="Daily activity & targets" detail="Steps, active calories, food calories and your daily progress" onPress={() => router.push('/activity')} />
        <CareRow icon="drop" title="Water" detail={water ? `${water.totalMl.toLocaleString('en-IN')} of ${data.waterPlan!.targetMl.toLocaleString('en-IN')} ml logged - ${water.completedTasks} tasks logged` : loading ? 'Loading your water plan...' : 'Make a plan, then log a drink in one tap'} onPress={() => router.push('/water')} />
        <CareRow icon="pill" title="Medicine reminders" detail={medicines.length ? `${medicines.length} medicine${medicines.length === 1 ? '' : 's'} - ${doseTimes} daily dose times` : loading ? 'Loading your medicines...' : 'Keep medicine names, dose amounts and times together'} onPress={() => router.push('/medicines')} />
        <CareRow icon="calendar" title="Cycle tracking" detail={data.cycleSettings ? 'Your calendar, symptoms and private check-ins' : loading ? 'Loading your tracking preferences...' : 'Optional, private tracking that starts with you'} onPress={() => router.push('/cycle')} />
      </View>
      <View style={[c.section, c.line]}>
        <CareRow icon="sync" title="Connected health" detail={health.source ? `${health.source.name} - ${health.connected ? 'automatic sync on' : 'manage access and sync'}` : 'Choose one health app to explore your trends'} onPress={() => router.push('/connected-health')} />
      </View>
    </>
    <Text style={[c.text, c.section]}>You choose what to track. Reminder permissions and tracking data can be managed separately for each feature.</Text>
  </AppScreen>;
}
