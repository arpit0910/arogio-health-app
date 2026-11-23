import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from '../../localization/LanguageProvider';
import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareGroup, CareRow, useCareStyles } from '../../components/app/CareUI';
import { PageIntro } from '../../components/app/PageIntro';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';

export default function ExploreRoute() {
  const router = useRouter();
  const { t: tr } = useTranslation(), c = useCareStyles(), colors = usePalette();
  return <AppScreen>
    <PageIntro title="Find something good for you" description="Ideas to explore, a moment to pause, and help when you need it." icon="explore" tone="lavender" />
    <TouchTarget accessibilityRole="button" accessibilityLabel={tr('Explore health articles')} onPress={() => router.push('/articles')} style={({ pressed }) => [s.feature, { backgroundColor: colors.subtle, opacity: pressed ? 0.8 : 1 }]}>
      <Image source={require('../../../assets/articles/mindfulness.jpg')} accessible={false} style={s.image} />
      <View style={s.featureCopy}>
        <Text style={c.title}>{tr('A fresh perspective')}</Text>
        <Text style={c.text}>{tr('Explore articles on movement, rest and everyday wellbeing.')}</Text>
        <View style={s.inline}><Text style={{ fontFamily: fonts.semibold, color: colors.primary }}>{tr('Browse articles')}</Text><AppIcon name="right" size={18} /></View>
      </View>
    </TouchTarget>
    <CareGroup title="Make room for a pause">
      <CareRow icon="leaf" title={tr('Meditation & affirmations')} detail={tr('Short guided practices and encouraging videos')} onPress={() => router.navigate('/meditation')} />
      <CareRow icon="cloud" title={tr('Gentle breathing')} detail={tr('Follow a comfortable two-minute rhythm')} onPress={() => router.navigate({ pathname: '/meditation', params: { practice: 'breathing' } })} />
    </CareGroup>
    <CareGroup title="Help close at hand">
      <CareRow icon="bloodBank" title={tr('Blood banks')} detail={tr('Find nearby blood banks and contact details')} onPress={() => router.push('/blood-banks')} />
      <CareRow icon="phone" title={tr('Emergency contacts')} detail={tr('Find a number when you need help')} onPress={() => router.push('/emergency')} />
    </CareGroup>
  </AppScreen>;
}
const s = StyleSheet.create({
  feature: { borderRadius: 18, overflow: 'hidden' },
  image: { width: '100%', height: 160 },
  featureCopy: { padding: 20, gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
});
