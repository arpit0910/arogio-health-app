import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform, AccessibilityInfo, Animated, AppState, BackHandler, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import { usePalette } from '../../theme/AppearanceProvider';
import { LaunchArtwork, type LaunchStep } from './LaunchArtwork';
import { launchAutoAdvance, launchDurations } from './launchTiming';

export { LaunchArtwork };

// Process-local: auth/provider remounts must not replay the opening sequence.
// A cold application start creates a new JS runtime and resets this flag.
let launchFinished = false;

/** A bounded, skippable three-scene introduction once per root mount. */
export function LaunchSequence({ children }: PropsWithChildren) {
  const c = usePalette(), router = useRouter();
  const [visible, setVisible] = useState(() => !launchFinished), [laidOut, setLaidOut] = useState(false);
  const [step, setStep] = useState<LaunchStep>(0);
  const [reduceMotion, setReduceMotion] = useState(true), [screenReader, setScreenReader] = useState(true), [preferencesReady, setPreferencesReady] = useState(false);
  const [active, setActive] = useState(AppState.currentState == null || AppState.currentState === 'active');
  const [exitOpacity] = useState(() => new Animated.Value(1)), [entrance] = useState(() => new Animated.Value(1));
  const finishing = useRef(false), exit = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    let alive = true, motionChanged = false, readerChanged = false;
    void Promise.allSettled([AccessibilityInfo.isReduceMotionEnabled(), AccessibilityInfo.isScreenReaderEnabled()]).then(([motion, reader]) => {
      if (!alive) return;
      if (!motionChanged && motion.status === 'fulfilled') setReduceMotion(motion.value);
      if (!readerChanged && reader.status === 'fulfilled') setScreenReader(reader.value);
      setPreferencesReady(true);
    });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { motionChanged = true; setReduceMotion(value); });
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', value => { readerChanged = true; setScreenReader(value); });
    const state = AppState.addEventListener('change', value => setActive(value === 'active'));
    return () => { alive = false; motion.remove(); reader.remove(); state.remove(); exit.current?.stop(); };
  }, []);
  useEffect(() => {
    if (laidOut || !visible) void SplashScreen.hideAsync().catch(() => {});
  }, [laidOut, visible]);
  const finish = useCallback((signIn = false) => {
    if (finishing.current) return;
    finishing.current = true;
    launchFinished = true;
    exit.current = Animated.timing(exitOpacity, { toValue: 0, duration: reduceMotion ? 0 : 220, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false });
    exit.current.start(({ finished }) => { if (finished) { setVisible(false); if (signIn) router.replace('/login'); } });
  }, [exitOpacity, reduceMotion, router]);
  const next = useCallback(() => { if (finishing.current) return; if (step < 2) setStep((step + 1) as LaunchStep); else finish(); }, [step, finish]);
  useEffect(() => {
    if (!visible || !launchAutoAdvance(active, laidOut, preferencesReady, screenReader)) return;
    const timer = setTimeout(next, launchDurations[step]);
    return () => clearTimeout(timer);
  }, [visible, active, laidOut, preferencesReady, screenReader, step, next]);
  useEffect(() => {
    entrance.setValue(reduceMotion ? 1 : 0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: reduceMotion ? 0 : 320, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false });
    animation.start(); return () => animation.stop();
  }, [step, reduceMotion, entrance]);
  useEffect(() => {
    if (!visible) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => { if (finishing.current) return true; if (step > 0) setStep((step - 1) as LaunchStep); else finish(); return true; });
    return () => back.remove();
  }, [visible, step, finish]);

  return <View style={[s.fill, { backgroundColor: c.background }]}>
    <View style={s.fill} pointerEvents={visible ? 'none' : 'auto'} {...(Platform.OS === 'web' ? { 'aria-hidden': visible } : { accessibilityElementsHidden: visible, importantForAccessibility: visible ? 'no-hide-descendants' : 'auto' })}>{children}</View>
    {visible && <Animated.View onLayout={() => setLaidOut(true)} style={[StyleSheet.absoluteFill, { backgroundColor: c.background, opacity: exitOpacity }]}>
      <SafeAreaView style={s.fill}><Animated.View style={[s.fill, { opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }), transform: [{ translateX: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <LaunchArtwork step={step} motion={!reduceMotion && active && laidOut} onNext={next} onSkip={() => finish()} onSignIn={() => finish(true)} onStepChange={value => { if (!finishing.current) setStep(value); }} />
      </Animated.View></SafeAreaView>
    </Animated.View>}
  </View>;
}
const s = StyleSheet.create({ fill: { flex: 1 } });
