import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/context/AuthContext';

const artwork = {
  brand: require('../../../assets/splash/brand.png'),
  health: require('../../../assets/splash/health.png'),
};

/** Also used while fonts load, so startup never falls back to a blank spinner. */
export function LaunchArtwork() {
  return <View style={styles.canvas} accessible accessibilityLabel="Arogio. Your Health Companion">
    <Image source={artwork.brand} style={styles.artwork} resizeMode="contain" accessible={false} />
  </View>;
}

/** An overlay preserves the initial route, including links opened from outside the app. */
export function LaunchSequence({ children }: PropsWithChildren) {
  const { isLoading } = useAuth();
  const [loaded, setLoaded] = useState({ brand: false, health: false });
  const [secondScreen, setSecondScreen] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [crossfade] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReduceMotion(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!loaded.brand || !loaded.health) return;
    const sequence = Animated.sequence([
      Animated.delay(1100),
      Animated.timing(crossfade, { toValue: 1, duration: reduceMotion ? 0 : 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1500),
    ]);
    const labelTimer = setTimeout(() => setSecondScreen(true), 1100);
    sequence.start(({ finished }) => { if (finished) setSequenceDone(true); });
    return () => { clearTimeout(labelTimer); sequence.stop(); };
  }, [loaded.brand, loaded.health, crossfade, reduceMotion]);

  useEffect(() => {
    if (!sequenceDone || isLoading) return;
    const exit = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 250, useNativeDriver: true });
    exit.start(({ finished }) => { if (finished) setVisible(false); });
    return () => exit.stop();
  }, [sequenceDone, isLoading, opacity, reduceMotion]);

  return <View style={styles.fill}>
    <View style={styles.fill} pointerEvents={visible ? 'none' : 'auto'} accessibilityElementsHidden={visible} importantForAccessibility={visible ? 'no-hide-descendants' : 'auto'}>{children}</View>
    {visible && <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}>
      <SafeAreaView style={styles.canvas} accessible accessibilityRole="image" accessibilityLiveRegion="polite"
        accessibilityLabel={secondScreen ? 'Arogio. Your Health Companion. Healthy Choices, Brighter Tomorrows.' : 'Arogio. Your Health Companion.'}>
        <View style={styles.frame}>
          <Image source={artwork.brand} style={styles.artwork} resizeMode="contain" accessible={false}
            onLoad={() => setLoaded(value => ({ ...value, brand: true }))} onError={() => setLoaded(value => ({ ...value, brand: true }))} />
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: crossfade }]}>
            <Image source={artwork.health} style={styles.artwork} resizeMode="contain" accessible={false}
              onLoad={() => setLoaded(value => ({ ...value, health: true }))} onError={() => setLoaded(value => ({ ...value, health: true }))} />
          </Animated.View>
        </View>
      </SafeAreaView>
    </Animated.View>}
  </View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  canvas: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  overlay: { backgroundColor: '#FFFFFF' },
  frame: { flex: 1, width: '100%', maxWidth: 600 },
  artwork: { width: '100%', height: '100%' },
});
