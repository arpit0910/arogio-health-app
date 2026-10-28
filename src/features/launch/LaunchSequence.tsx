import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useAuth } from '../auth/context/AuthContext';
import { authAssets } from '../auth/assets/authAssets';
import { colors, fonts } from '../../theme/tokens';

export function LaunchArtwork({ health = false }: { health?: boolean }) {
  return <View style={s.artwork} accessible accessibilityLabel={health ? 'Arogio. Healthy choices. Brighter tomorrows.' : 'Arogio. Your Health Companion.'}>
    <SvgXml xml={authAssets.brand} width={health ? 80 : 112} height={health ? 72 : 100} />
    <Text style={s.wordmark} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Arogio</Text><Text style={s.tagline}>Your Health Companion</Text>
    {health && <View style={s.message}><Text style={s.messageTitle}>Healthy choices.{'\n'}Brighter tomorrows.</Text><Text style={s.messageCopy}>A little care for your health and wellbeing.</Text></View>}
  </View>;
}
export function LaunchSequence({ children }: PropsWithChildren) {
  const { isLoading } = useAuth();
  const [secondScreen, setSecondScreen] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [crossfade] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(650),
      Animated.timing(crossfade, { toValue: 1, duration: reduceMotion ? 0 : 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(850),
    ]);
    const timer = setTimeout(() => setSecondScreen(true), 650);
    sequence.start(({ finished }) => { if (finished) setSequenceDone(true); });
    return () => { clearTimeout(timer); sequence.stop(); };
  }, [crossfade, reduceMotion]);
  useEffect(() => {
    if (!sequenceDone || isLoading) return;
    const exit = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 150, useNativeDriver: true });
    exit.start(({ finished }) => { if (finished) setVisible(false); });
    return () => exit.stop();
  }, [sequenceDone, isLoading, opacity, reduceMotion]);
  return <View style={s.fill}>
    <View style={s.fill} pointerEvents={visible ? 'none' : 'auto'} accessibilityElementsHidden={visible} importantForAccessibility={visible ? 'no-hide-descendants' : 'auto'}>{children}</View>
    {visible && <Animated.View style={[StyleSheet.absoluteFill, s.overlay, { opacity }]}><SafeAreaView style={s.fill} accessible accessibilityRole="image" accessibilityLabel={secondScreen ? 'Arogio. Healthy choices. Brighter tomorrows.' : 'Arogio. Your Health Companion.'}>
      <LaunchArtwork /><Animated.View style={[StyleSheet.absoluteFill, { opacity: crossfade }]}><LaunchArtwork health /></Animated.View>
    </SafeAreaView></Animated.View>}
  </View>;
}
const s = StyleSheet.create({
  fill: { flex: 1 }, overlay: { backgroundColor: colors.background },
  artwork: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  wordmark: { width: '100%', paddingHorizontal: 8, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 44, lineHeight: 60, letterSpacing: 0, color: colors.ink, marginTop: 12 },
  tagline: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, lineHeight: 23, textAlign: 'center' },
  message: { marginTop: 40, maxWidth: 360, padding: 24, borderRadius: 16, backgroundColor: colors.primary, gap: 14 },
  messageTitle: { color: '#FFFFFF', fontFamily: fonts.medium, fontSize: 28, lineHeight: 36 },
  messageCopy: { color: '#E2EBDD', fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
});
