import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareBrand, CareRow, careStyles as c } from '../../components/app/CareUI';
import { useWellness } from './WellnessContext';
import { waterDay } from './domain';
import { TrackingStatus } from './TrackingUI';
export function HealthScreen() {
  const { data } = useWellness(), plan = data.waterPlan;
  const total = plan ? data.waterLogs.filter(l => l.day === waterDay(plan)).reduce((sum,l) => sum+l.amountMl,0) : 0;
  return <AppScreen><CareBrand /><View style={c.section}><Text style={c.heading}>Care, at your pace.</Text><Text style={c.text}>Small check-ins for your everyday health.</Text></View><TrackingStatus /><View style={c.section}><CareRow title="Medicine reminders" detail={(data.medicines?.length ?? 0) ? `${data.medicines!.length} medicines / Manage daily dose times` : 'Add medicines and daily dose times'} onPress={() => router.push('/medicines')} /><CareRow title="Water" detail={plan ? `${total} of ${plan.targetMl} ml today · Open your drinking tasks` : 'Set your target and waking hours'} onPress={() => router.push('/water')} /><CareRow title="Cycle tracking" detail={data.cycleSettings ? 'Your calendar, symptoms and private check-ins' : 'Optional, private tracking that starts with you'} onPress={() => router.push('/cycle')} /></View><Text style={[c.text,c.section]}>You choose what to track. Reminder permissions and tracking data can be managed separately for each feature.</Text></AppScreen>;
}
