import { useTranslation } from "../../localization/LanguageProvider";
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareRow, useCareStyles } from '../../components/app/CareUI';
import { useWellness } from './WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { TodayActivity } from '../activity/TodayActivity';
import { TrackingStatus } from './TrackingUI';
import { homeWater } from '../home/homeModel';
import { useTrackingClock } from './useTrackingClock';
import { FeatureCard } from '../../components/app/FeatureCard';

export function HealthScreen() {
  const { t: tr, locale } = useTranslation();
  const c = useCareStyles(), { data, loading, refresh } = useWellness(), health = useHealthSync();
  const water = homeWater(data, useTrackingClock());
  return <AppScreen refreshing={loading || health.busy} onRefresh={() => void Promise.allSettled([refresh(), health.run()])}>
    <Text accessibilityRole="header" style={c.heading}>{tr("Your health")}</Text>
    <Text style={[c.text, { marginTop: 8 }]}>{tr("Your activity and everyday care, together.")}</Text>
    <TrackingStatus />
    <View style={{ marginTop: 28, gap: 14 }}><Text accessibilityRole="header" style={c.title}>{tr("Daily care")}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <FeatureCard title="Water" detail={water ? `${water.totalMl.toLocaleString(locale)} of ${data.waterPlan!.targetMl.toLocaleString(locale)} ml today` : 'Set a target and log drinks'} icon="drop" route="/water" tone="blue" />
        <FeatureCard title="Medicines" detail={data.medicines?.length ? `${data.medicines.length} saved medicines` : 'Keep your dose times together'} icon="pill" route="/medicines" tone="rose" />
      </View>
      <CareRow icon="calendar" title={tr("Cycle journal")} detail={tr("Your private dates and check-ins")} onPress={() => router.push('/cycle')} />
    </View>
    <CareRow icon="goal" title={tr("Activity & targets")} detail={tr("Log activity and manage your daily goals")} onPress={() => router.push('/activity')} />
    <TodayActivity />
    <View style={{ marginTop: 24 }}><CareRow icon="sync" title={tr("Health apps")} detail={tr(health.connected ? `${health.source?.name ?? 'Health app'} - Automatic updates` : 'Connect an app for automatic readings')} onPress={() => router.push('/connected-health')} /></View>
    <View style={{ marginTop: 24 }}><CareRow icon="user" title={tr("Body details")} detail={tr("Weight, height and profile")} onPress={() => router.push('/profile')} /></View>
  </AppScreen>;
}
