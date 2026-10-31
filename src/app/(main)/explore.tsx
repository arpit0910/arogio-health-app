import { useTranslation } from "../../localization/LanguageProvider";
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';

export default function ExploreRoute() {
  const { t: tr } = useTranslation();
  const c = useCareStyles();
  return <AppScreen><Text accessibilityRole="header" style={c.heading}>{tr("Explore Arogio")}</Text><Text style={[c.text, { marginTop: 8 }]}>{tr("Find the tools that fit your day.")}</Text>
    <View style={{ marginTop: 24 }}><Text style={c.title}>{tr("Everyday care")}</Text><CareRow icon="drop" title={tr("Water")} detail={tr("Track drinks and manage reminders")} onPress={() => router.push('/water')} /><CareRow icon="pill" title={tr("Medicines")} detail={tr("Keep dose times in one place")} onPress={() => router.push('/medicines')} /><CareRow icon="calendar" title={tr("Cycle")} detail={tr("Private tracking and check-ins")} onPress={() => router.push('/cycle')} /></View>
    <View style={{ marginTop: 24 }}><Text style={c.title}>{tr("Activity")}</Text><CareRow icon="trend" title={tr("Activity & targets")} detail={tr("Your daily readings and goals")} onPress={() => router.push('/activity')} /><CareRow icon="sync" title={tr("Health apps")} detail={tr("Connect a compatible app")} onPress={() => router.push('/connected-health')} /></View>
  </AppScreen>;
}
