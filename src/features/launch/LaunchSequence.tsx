import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../auth/context/AuthContext';
import { colors } from '../../theme/tokens';
import { LaunchArtwork } from './LaunchArtwork';

export { LaunchArtwork };

/** One launch surface, released as soon as session restoration is ready. */
export function LaunchSequence({ children }: PropsWithChildren) {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [laidOut, setLaidOut] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let active = true;
    let receivedChange = false;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active && !receivedChange) setReduceMotion(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      receivedChange = true;
      setReduceMotion(value);
    });
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!laidOut) return;
    // AppProviders mounts this component only after its bundled fonts load.
    void SplashScreen.hideAsync().catch(() => {});
  }, [laidOut]);

  useEffect(() => {
    if (!laidOut || isLoading) return;
    const exit = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 200, useNativeDriver: true, isInteraction: false });
    exit.start(({ finished }) => { if (finished) setVisible(false); });
    return () => exit.stop();
  }, [laidOut, isLoading, opacity, reduceMotion]);

  return <View style={s.fill}>
    <View style={s.fill} pointerEvents={visible ? 'none' : 'auto'} accessibilityElementsHidden={visible} importantForAccessibility={visible ? 'no-hide-descendants' : 'auto'}>{children}</View>
    {visible && <Animated.View onLayout={() => setLaidOut(true)} style={[StyleSheet.absoluteFill, s.overlay, { opacity }]}>
      <SafeAreaView style={s.fill}><LaunchArtwork motion={!reduceMotion && laidOut} /></SafeAreaView>
    </Animated.View>}
  </View>;
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  overlay: { backgroundColor: colors.background },
});
