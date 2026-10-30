import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';

export default function ExploreRoute() {
  const c = useCareStyles();
  return <AppScreen><Text accessibilityRole="header" style={c.heading}>Explore Arogio</Text><Text style={[c.text, { marginTop: 8 }]}>Find the tools that fit your day.</Text>
    <View style={{ marginTop: 24 }}><Text style={c.title}>Everyday care</Text><CareRow icon="drop" title="Water" detail="Track drinks and manage reminders" onPress={() => router.push('/water')} /><CareRow icon="pill" title="Medicines" detail="Keep dose times in one place" onPress={() => router.push('/medicines')} /><CareRow icon="calendar" title="Cycle" detail="Private tracking and check-ins" onPress={() => router.push('/cycle')} /></View>
    <View style={{ marginTop: 24 }}><Text style={c.title}>Activity</Text><CareRow icon="trend" title="Activity & targets" detail="Your daily readings and goals" onPress={() => router.push('/activity')} /><CareRow icon="sync" title="Health apps" detail="Connect a compatible app" onPress={() => router.push('/connected-health')} /></View>
  </AppScreen>;
}
