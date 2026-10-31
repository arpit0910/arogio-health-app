import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette } from '../../theme/AppearanceProvider';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path, SvgXml } from 'react-native-svg';
import { authAssets } from '../auth/assets/authAssets';
import { colors as lightColors, fonts } from '../../theme/tokens';
import { AppIcon } from '../../components/app/AppIcon';

/** A complete static composition is visible before motion preferences are ready. */
export function LaunchArtwork({ motion = false }: { motion?: boolean }) {
  const { t: tr } = useTranslation();
  const colors = usePalette(), s = useStyles();
  const { width, height, fontScale } = useWindowDimensions();
  const compact = height < 680 || fontScale > 1.3;
  const heroSize = Math.max(160, Math.min(width - 48, compact ? 204 : 300));
  const showLabels = !compact && fontScale <= 1.3;
  const entrancePlayed = useRef(false);
  const [entrance] = useState(() => new Animated.Value(1));
  const [breath] = useState(() => new Animated.Value(0));
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (!motion || !active) { entrance.setValue(1); breath.setValue(0); return; }
    const arrival = entrancePlayed.current ? null : Animated.timing(entrance, {
      toValue: 1, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true, isInteraction: false,
    });
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(breath, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    if (arrival) { entrancePlayed.current = true; entrance.setValue(0); arrival.start(); }
    breathing.start();
    return () => { arrival?.stop(); breathing.stop(); };
  }, [motion, active, entrance, breath]);

  return <View style={s.artwork}>
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={s.topArc} /><View style={s.bottomField} /><View style={s.bottomArc} />
    </View>
    <ScrollView style={s.scroll} bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, compact && s.compactContent]}>
      <View style={s.brand}>
        <Text style={[s.wordmark, compact && s.compactWordmark]}>{tr("Arogio")}</Text>
        <Text style={s.tagline}>{tr("Your Health Companion")}</Text>
      </View>
      <Animated.View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: heroSize, height: heroSize,
        transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <Animated.View style={[s.breathingField, { width: heroSize * .65, height: heroSize * .65, borderRadius: heroSize,
          opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [.65, .8] }),
          transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [.98, 1.02] }) }] }]} />
        <Svg width={heroSize} height={heroSize} viewBox="0 0 300 300" style={StyleSheet.absoluteFill}>
          <Circle cx={150} cy={150} r={118} stroke={colors.border} strokeWidth={1} strokeOpacity={.4} fill="none" />
          <Path d="M46 191A112 112 0 0 1 169 39M254 109A112 112 0 0 1 131 261" fill="none" stroke={colors.primary} strokeOpacity={.5} strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={61} cy={226} r={4} fill={colors.primary} /><Circle cx={233} cy={54} r={3} fill={colors.accent} />
        </Svg>
        <View style={[s.logoField, { width: heroSize * .53, height: heroSize * .53, borderRadius: heroSize }]}>
          <Animated.View style={{ transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [.9, 1] }) }] }}>
            <SvgXml xml={authAssets.brand} width={heroSize * .32} height={heroSize * .288} />
          </Animated.View>
        </View>
        <Animated.View style={[s.careBadge, s.waterBadge, { left: 0, top: heroSize * .29, transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }] }]}>
          <AppIcon name="drop" color={colors.primary} size={22} />{showLabels && <Text style={s.badgeText}>{tr("Hydrate")}</Text>}
        </Animated.View>
        <Animated.View style={[s.careBadge, s.moveBadge, { right: 0, top: heroSize * .12, transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) }] }]}>
          <AppIcon name="walk" color={colors.primary} size={22} />{showLabels && <Text style={s.badgeText}>{tr("Move")}</Text>}
        </Animated.View>
        <Animated.View style={[s.careBadge, s.restBadge, { right: heroSize * .05, bottom: heroSize * .1, transform: [{ translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }] }]}>
          <AppIcon name="moon" color={colors.primary} size={22} />{showLabels && <Text style={s.badgeText}>{tr("Rest")}</Text>}
        </Animated.View>
      </Animated.View>
      <View style={s.message}>
        <Text accessibilityRole="header" style={[s.headline, compact && s.compactHeadline]}>{tr("Your health,")}{'\n'}{tr("at your pace.")}</Text>
        <Text style={s.description}>{tr("Make space for movement, rest,")}{compact ? ' ' : '\n'}{tr("and a little care for yourself.")}</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityLabel={tr("Opening Arogio")} accessibilityState={{ busy: true }} style={s.loading}>
        <View accessible={false} style={s.dots}>{[0, 1, 2].map(index => <Animated.View key={index} style={[s.dot, {
          opacity: breath.interpolate({ inputRange: [0, 1], outputRange: index === 1 ? [.7, .45] : [.45, .7] }),
        }]} />)}</View>
        <Text accessible={false} style={s.loadingText}>{tr("Opening Arogio")}</Text>
      </View>
    </ScrollView>
  </View>;
}
const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    artwork: { flex: 1, overflow: 'hidden', backgroundColor: c.background }, scroll: { flex: 1 },
    content: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingHorizontal: 24, paddingVertical: 36 },
    compactContent: { gap: 16, paddingVertical: 20 },
    brand: { alignItems: 'center', gap: 4, width: '100%' },
    wordmark: { fontFamily: fonts.semibold, fontSize: 40, lineHeight: 54, letterSpacing: -.8, color: c.ink, textAlign: 'center' },
    compactWordmark: { fontSize: 34, lineHeight: 46 },
    tagline: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: c.muted, textAlign: 'center' },
    breathingField: { position: 'absolute', alignSelf: 'center', top: '17.5%', backgroundColor: c.subtle },
    logoField: { position: 'absolute', top: '23.5%', alignSelf: 'center', backgroundColor: lightColors.subtle, alignItems: 'center', justifyContent: 'center' },
    careBadge: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: c.border },
    waterBadge: { backgroundColor: c.subtle }, moveBadge: { backgroundColor: c.surface }, restBadge: { backgroundColor: c.surface },
    badgeText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: c.ink },
    message: { alignItems: 'center', gap: 14, width: '100%', maxWidth: 420 },
    headline: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 41, letterSpacing: -.6, textAlign: 'center', color: c.ink },
    compactHeadline: { fontSize: 27, lineHeight: 35 },
    description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: c.muted, textAlign: 'center' },
    loading: { alignItems: 'center', gap: 10, paddingTop: 4 }, dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.primary },
    loadingText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 19, color: c.muted },
    topArc: { position: 'absolute', width: 400, height: 400, borderRadius: 200, borderWidth: 1, borderColor: c.border, opacity: .5, top: -270, right: -180 },
    bottomField: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: c.subtle, opacity: .45, bottom: -270, left: -180 },
    bottomArc: { position: 'absolute', width: 450, height: 450, borderRadius: 225, borderWidth: 1, borderColor: c.border, opacity: .45, bottom: -270, left: -180 },
  });
};
