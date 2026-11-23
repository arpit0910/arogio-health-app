import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, SvgXml } from 'react-native-svg';
import { type AppIconName } from '../../components/app/AppIcon';
import { authAssets } from '../authentication/assets/authAssets';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { FigmaAsset } from '../../components/app/FigmaAsset';
import { orbitGeometry, spiralMotion } from './spiralMotion';

function spiral() {
  return Array.from({ length: 181 }, (_, i) => {
    const angle = i / 180 * Math.PI * 3.5, radius = 38 + i / 180 * 102;
    return `${i ? 'L' : 'M'}${150 + Math.cos(angle) * radius},${150 + Math.sin(angle) * radius}`;
  }).join(' ');
}
const spiralPath = spiral();

export function LaunchLeaf({ size = 90, color = '#42CDA2' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 100 100"><Defs><LinearGradient id="launch-leaf" x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#B8F5D3" /><Stop offset="1" stopColor={color} /></LinearGradient></Defs><Path d="M12 8C56 6 88 48 91 91C47 83 7 53 12 8Z" fill="url(#launch-leaf)" /><Path d="M13 9 90 90" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1} /></Svg>;
}

/** Cards travel around the centre on expanding/contracting spiral paths, without rotating text. */
export function LaunchOrbit({ step, size, motion }: { step: number; size: number; motion: boolean }) {
  const c = usePalette(), { t } = useTranslation();
  const geometry = orbitGeometry(size);
  const [turn] = useState(() => new Animated.Value(0)), [float] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion) { turn.setValue(0); float.setValue(0); return; }
    const rotation = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true, isInteraction: false }));
    const drift = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    rotation.start(); drift.start();
    return () => { rotation.stop(); drift.stop(); };
  }, [motion, turn, float]);
  const cards: { icon: AppIconName; title: string; detail: string; phase: number }[] = step === 1 ? [
    { icon: 'stethoscope', title: 'Doctors', detail: 'Specialists', phase: -Math.PI / 2 },
    { icon: 'hospital', title: 'Hospitals', detail: 'ICU & beds', phase: Math.PI / 6 },
    { icon: 'ambulance', title: '108 SOS', detail: 'Emergency', phase: Math.PI * 5 / 6 },
  ] : [
    { icon: 'heart', title: 'Vitals', detail: 'Health sync', phase: -Math.PI / 2 },
    { icon: 'pill', title: 'Meds', detail: 'Daily doses', phase: Math.PI / 6 },
    { icon: 'drop', title: 'Water', detail: 'Hydration', phase: Math.PI * 5 / 6 },
  ];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: geometry.height }}>
    <Animated.View style={{ position: 'absolute', left: 0, top: (geometry.height - size) / 2, width: size, height: size, transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      <Svg width={size} height={size} viewBox="0 0 300 300"><Defs><LinearGradient id="orbit-line" x1="0" y1="0" x2="1" y2="1"><Stop stopColor={c.primary} stopOpacity={0.08} /><Stop offset="1" stopColor={c.primary} stopOpacity={0.65} /></LinearGradient></Defs><Path d={spiralPath} stroke="url(#orbit-line)" strokeWidth={1} fill="none" /><Circle cx={150} cy={150} r={138} stroke={c.primary} strokeOpacity={0.22} strokeDasharray="2 4" fill="none" /><Circle cx={150} cy={12} r={4} fill={c.primary} /><Circle cx={38} cy={230} r={3} fill={c.secondary} /></Svg>
    </Animated.View>
    <Animated.View style={[s.innerRing, { width: size * 0.64, height: size * 0.64, left: size * 0.18, top: (geometry.height - size * 0.64) / 2, borderColor: c.mintSurface, backgroundColor: c.surface, transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }, { scale: float.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.03] }) }] }]}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200"><Path d="M100 5A95 95 0 0 1 195 100M100 195A95 95 0 0 1 5 100" fill="none" stroke={c.primary} strokeWidth={2} strokeOpacity={0.2} /></Svg>
    </Animated.View>
    <View style={[s.center, { left: (size - geometry.centerWidth) / 2, top: (geometry.height - geometry.centerHeight) / 2, width: geometry.centerWidth, height: geometry.centerHeight }]}>
      <Animated.View style={[s.core, { width: Math.min(58, size * 0.17), height: Math.min(58, size * 0.17), backgroundColor: c.brandSurface, transform: [{ scale: float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }]}><FigmaAsset screen={step === 1 ? "3:542" : "3:842"} name={step === 1 ? "imgSvgCaduceusHealthSearchIcon" : "imgSvgJeevaAiStethoscopeBrainSparkIcon"} width={step === 1 ? 26 : 32} height={step === 1 ? 26 : 32} /></Animated.View>
      <Text numberOfLines={1} maxFontSizeMultiplier={1} style={[s.centerLabel, { color: c.primary }]}>{step === 1 ? t('LIVE RADAR') : 'JEEVA AI 2.0'}</Text>
    </View>
    {cards.map((card, index) => {
      const path = spiralMotion(size, card.phase);
      return <Animated.View key={card.title} style={[s.card, { left: (size - geometry.cardWidth) / 2, top: (geometry.height - geometry.cardHeight) / 2, width: geometry.cardWidth, height: geometry.cardHeight, backgroundColor: c.surface, borderColor: c.mintSurface, transform: [{ translateX: turn.interpolate({ inputRange: path.inputRange, outputRange: path.x }) }, { translateY: turn.interpolate({ inputRange: path.inputRange, outputRange: path.y }) }] }]}><View style={[s.cardIcon, { backgroundColor: c.subtle }]}><FigmaAsset screen={step === 1 ? "3:542" : "3:842"} name={step === 1 ? ["imgSvgDoctorStethoscopeIcon", "imgSvgHospitalBedIcon", "imgSvgAmbulanceSirenIcon"][index] : ["imgSvg3", "imgSvg4", "imgSvg5"][index]} width={14} height={14} /></View><View style={s.copy}><Text numberOfLines={1} maxFontSizeMultiplier={1} style={[s.cardTitle, { color: c.ink }]}>{t(card.title)}</Text><Text numberOfLines={1} maxFontSizeMultiplier={1} style={[s.cardDetail, { color: c.muted }]}>{t(card.detail)}</Text></View></Animated.View>;
    })}
  </View>;
}

export function LaunchLogo({ size = 100 }: { size?: number }) {
  return <SvgXml xml={authAssets.brand} width={size} height={size * 0.93} />;
}
const s = StyleSheet.create({
  innerRing: { position: 'absolute', borderRadius: 300, borderWidth: 1 }, center: { position: 'absolute', alignItems: 'center', justifyContent: 'center', gap: 5 },
  core: { width: 66, height: 66, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontFamily: fonts.bold, fontSize: 9, lineHeight: 14, letterSpacing: 0.2 },
  card: { position: 'absolute', padding: 5, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardIcon: { width: 18, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 7 }, copy: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 9, lineHeight: 13 }, cardDetail: { fontFamily: fonts.regular, fontSize: 8, lineHeight: 11 },
});
