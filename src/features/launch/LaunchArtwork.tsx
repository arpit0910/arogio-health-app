import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { authAssets } from '../auth/assets/authAssets';
import { colors, fonts } from '../../theme/tokens';

/** The logo stays visible even before motion preferences or fonts are ready. */
export function LaunchArtwork({ motion = false }: { motion?: boolean }) {
  const { width, height, fontScale } = useWindowDimensions();
  const emblemSize = Math.min(width - 48, height < 640 || fontScale > 1.4 ? 184 : 232);
  const entrancePlayed = useRef(false);
  const [entrance] = useState(() => new Animated.Value(1));
  const [breath] = useState(() => new Animated.Value(0));
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!motion || !active) {
      entrance.setValue(1);
      breath.setValue(0);
      return;
    }
    const arrival = entrancePlayed.current ? null : Animated.timing(entrance, {
      toValue: 1, duration: 650, easing: Easing.out(Easing.exp),
      useNativeDriver: true, isInteraction: false,
    });
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(breath, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    if (arrival) {
      entrancePlayed.current = true;
      entrance.setValue(0);
      arrival.start();
    }
    breathing.start();
    return () => { arrival?.stop(); breathing.stop(); };
  }, [motion, active, entrance, breath]);

  return <View style={s.artwork} accessible accessibilityLabel="Arogio. Your Health Companion.">
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={s.topArc} />
      <View style={s.bottomField} />
      <View style={s.bottomArc} />
    </View>
    <View style={s.brand}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: emblemSize, height: emblemSize }}>
        <View style={[s.emblem, { left: (emblemSize - 232) / 2, top: (emblemSize - 232) / 2, transform: [{ scale: emblemSize / 232 }] }]}>
          <Animated.View style={[s.breathingField, {
            opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.85] }),
            transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] }) }],
          }]} />
          <Svg width={232} height={232} viewBox="0 0 232 232" style={StyleSheet.absoluteFill}>
            <Path d="M37 151A87 87 0 0 1 136 31M195 81A87 87 0 0 1 96 201" fill="none" stroke={colors.border} strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
          <Animated.View style={[s.seed, s.seedGreen, { transform: [
            { translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
            { rotate: breath.interpolate({ inputRange: [0, 1], outputRange: ['30deg', '42deg'] }) },
          ] }]} />
          <Animated.View style={[s.seed, s.seedLight, { transform: [
            { translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
            { rotate: '-35deg' },
          ] }]} />
          <Animated.View style={[s.seedPlum, { transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]} />
          <Animated.View style={{ transform: [
            { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
            { rotate: entrance.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) },
          ] }}>
            <SvgXml xml={authAssets.brand} width={112} height={101} />
          </Animated.View>
        </View>
      </View>
      <Text accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={s.wordmark}>Arogio</Text>
      <Text style={s.tagline}>Your Health Companion</Text>
    </View>
  </View>;
}

const s = StyleSheet.create({
  artwork: { flex: 1, overflow: 'hidden', backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  brand: { width: '100%', maxWidth: 360, alignItems: 'center', gap: 12 },
  emblem: { position: 'absolute', width: 232, height: 232, alignItems: 'center', justifyContent: 'center' },
  breathingField: { position: 'absolute', width: 158, height: 158, borderRadius: 79, backgroundColor: colors.subtle },
  seed: { position: 'absolute', borderTopLeftRadius: 16, borderBottomRightRadius: 16, borderTopRightRadius: 3, borderBottomLeftRadius: 3 },
  seedGreen: { width: 15, height: 27, right: 24, top: 44, backgroundColor: colors.primary },
  seedLight: { width: 11, height: 20, left: 42, top: 26, backgroundColor: colors.border },
  seedPlum: { position: 'absolute', width: 9, height: 9, borderRadius: 5, left: 27, bottom: 57, backgroundColor: colors.accent },
  topArc: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: colors.border, opacity: 0.5, top: -192, right: -120 },
  bottomField: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: colors.subtle, opacity: 0.4, bottom: -216, left: -100 },
  bottomArc: { position: 'absolute', width: 368, height: 368, borderRadius: 184, borderWidth: 1, borderColor: colors.border, opacity: 0.45, bottom: -216, left: -100 },
  wordmark: { width: '100%', maxWidth: 320, paddingHorizontal: 12, paddingVertical: 4, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 40, lineHeight: 60, letterSpacing: 0, color: colors.ink, includeFontPadding: true, flexShrink: 0 },
  tagline: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted, textAlign: 'center' },
});
