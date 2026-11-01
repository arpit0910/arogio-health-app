import { useTranslation } from "../../localization/LanguageProvider";
import { Text, View, Image } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';
import { FeatureCard } from '../../components/app/FeatureCard';
import { usePalette } from '../../theme/AppearanceProvider';

export default function ExploreRoute() {
  const { t: tr } = useTranslation(), c = useCareStyles(), colors = usePalette();
  return <AppScreen>
    <Text accessibilityRole="header" style={c.heading}>{tr("A little care, every day")}</Text>
    <Text style={[c.text, { marginTop: 8 }]}>{tr("Choose what you want to take care of today.")}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
      <FeatureCard title="Water" detail="Log a drink and plan reminders" icon="drop" route="/water" tone="blue" />
      <FeatureCard title="Medicines" detail="Keep your dose times together" icon="pill" route="/medicines" tone="rose" />
      <FeatureCard title="Activity" detail="Track movement and daily goals" icon="walk" route="/activity" tone="mint" />
      <FeatureCard title="Cycle journal" detail="Private dates and check-ins" icon="calendar" route="/cycle" tone="lavender" />
    </View>
    <View style={{ marginTop: 28, gap: 12 }}>
      <Text accessibilityRole="header" style={c.title}>{tr("Here to help")}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, backgroundColor: colors.subtle, borderRadius: 16 }}>
        <Image source={require('../../../assets/home/jeeva.png')} style={{ width: 64, height: 64, borderRadius: 32 }} accessible={false} />
        <View style={{ flex: 1, gap: 4 }}><Text style={c.title}>{tr("Meet Jeeva")}</Text><Text style={c.text}>{tr("A space for your wellness questions.")}</Text></View>
      </View>
      <CareRow icon="heart" title={tr("Talk to Jeeva")} detail={tr("Open your wellness conversation")} onPress={() => router.navigate('/jeeva')} />
      <CareRow icon="sync" title={tr("Health apps")} detail={tr("Connect a compatible app for automatic readings")} onPress={() => router.push('/connected-health')} />
      <CareRow icon="book" title={tr("Health articles")} detail={tr("Read and explore at your own pace")} onPress={() => router.push('/articles')} />
      <CareRow icon="drop" title={tr("Blood banks")} detail={tr("Find nearby blood banks and contact details")} onPress={() => router.push('/blood-banks')} />
    </View>
  </AppScreen>;
}
