import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import { usePalette } from '../../theme/AppearanceProvider';

/** Animate changes after saving a real reading, respecting the device motion setting. */
export function GoalProgress({ value, target, label }: { value: number; target: number; label: string }) {
  const colors = usePalette(), fraction = Math.max(0, Math.min(1, value / Math.max(1, target)));
  const [progress] = useState(() => new Animated.Value(fraction));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: fraction, duration: reduceMotion ? 0 : 420, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [fraction, progress, reduceMotion]);
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: target, now: Math.min(value, target), text: `${value} / ${target}` }}
    style={{ height: 7, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }}>
    <Animated.View style={{ height: 7, borderRadius: 4, backgroundColor: colors.primary, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
  </View>;
}
