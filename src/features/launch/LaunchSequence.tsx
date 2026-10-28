import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../auth/context/AuthContext';
import { authAssets } from '../auth/assets/authAssets';
import { colors, fonts } from '../../theme/tokens';

export function LaunchArtwork() {
  return <View style={s.artwork} accessible accessibilityLabel="Arogio. Your Health Companion.">
    <SvgXml xml={authAssets.brand} width={112} height={101} />
    <Text style={s.wordmark}>Arogio</Text>
    <Text style={s.tagline}>Your Health Companion</Text>
  </View>;
}

/** One launch surface, released as soon as session restoration is ready. */
export function LaunchSequence({ children }: PropsWithChildren) {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [laidOut, setLaidOut] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!laidOut) return;
    // AppProviders mounts this component only after its bundled fonts load.
    void SplashScreen.hideAsync().catch(() => {});
  }, [laidOut]);

  useEffect(() => {
    if (!laidOut || isLoading) return;
    const exit = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 150, useNativeDriver: true });
    exit.start(({ finished }) => { if (finished) setVisible(false); });
    return () => exit.stop();
  }, [laidOut, isLoading, opacity, reduceMotion]);

  return <View style={s.fill}>
    <View style={s.fill} pointerEvents={visible ? 'none' : 'auto'} accessibilityElementsHidden={visible} importantForAccessibility={visible ? 'no-hide-descendants' : 'auto'}>{children}</View>
    {visible && <Animated.View onLayout={() => setLaidOut(true)} style={[StyleSheet.absoluteFill, s.overlay, { opacity }]}>
      <SafeAreaView style={s.fill}><LaunchArtwork /></SafeAreaView>
    </Animated.View>}
  </View>;
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  overlay: { backgroundColor: colors.background },
  artwork: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  wordmark: { textAlign: 'center', fontFamily: fonts.semibold, fontSize: 40, lineHeight: 54, color: colors.ink },
  tagline: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted, textAlign: 'center' },
});
