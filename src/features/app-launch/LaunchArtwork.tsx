import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useEffect, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from '../../localization/LanguageProvider';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';
import { LaunchOrbit } from './LaunchOrbit';
import { FigmaAsset } from '../../components/app/FigmaAsset';

export type LaunchStep = 0 | 1 | 2;
export function LaunchArtwork({ motion = false, step = 0, onNext, onSkip, onSignIn, onStepChange }: {
  motion?: boolean; step?: LaunchStep; onNext?: () => void; onSkip?: () => void; onSignIn?: () => void; onStepChange?: (step: LaunchStep) => void;
}) {
  const c = usePalette(), { t } = useTranslation(), { width, height, fontScale } = useWindowDimensions();
  const compact = height < 740 || fontScale > 1.3;
  const size = Math.max(288, Math.min(width - 16, 390));
  const [sway] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion) { sway.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(sway, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start(); return () => animation.stop();
  }, [motion, sway]);
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Boolean(onStepChange) && Math.abs(g.dx) > 35 && Math.abs(g.dy) < 25,
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 45) onStepChange?.(Math.max(0, Math.min(2, step + (g.dx < 0 ? 1 : -1))) as LaunchStep); },
  });
  return <View style={[s.screen, { backgroundColor: c.background }]} {...gesture.panHandlers}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: step === 0 ? -24 : -32, top: step === 0 ? -24 : -20 }}><FigmaAsset screen={step === 0 ? '3:462' : step === 1 ? '3:542' : '3:842'} name={step === 0 ? 'imgSvg' : step === 1 ? 'imgSvgTopLeftOrganicLeavesMotif' : 'imgSvgTopLeftGentleBotanicalLeafCluster'} width={step === 0 ? 224 : step === 1 ? 192 : 176} /></View>
      <Animated.View style={{ position: 'absolute', bottom: 0, left: -6, transform: [{ translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) }] }}><FigmaAsset screen={step === 0 ? '3:462' : step === 1 ? '3:542' : '3:842'} name={step === 0 ? 'imgSvg1' : step === 1 ? 'imgSvgBottomAmbientWaveLayer' : 'imgSvgBottomFlowingTranslucentOrganicCurves'} width={width + 12} /></Animated.View>
    </View>
    <View style={[s.header, step === 2 && { minHeight: 74, flexDirection: 'column', justifyContent: 'center', gap: 10 }]}>{step === 2 && <View style={[s.badge, { borderColor: c.mintSurface, backgroundColor: c.surface }]}><View style={[s.badgeDot, { backgroundColor: c.primary }]} /><Text style={[s.badgeText, { color: c.primary }]}>{t('ABDM & AYUSH COMPLIANT')}</Text></View>}{step > 0 ? <View style={s.brand}>{step === 1 ? <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}><FigmaAsset screen="3:542" name="imgSvgScaledHumanoidMascotFromBrandPng" width={26} height={26} /></View> : <FigmaAsset screen="3:462" name="imgSvg2" width={28} height={28} />}<View><Text style={[s.brandName, { color: c.ink }]}>Arogio</Text>{step === 1 && <Text style={[s.badgeText, { color: c.secondary, fontSize: 8, lineHeight: 11 }]}>{t('HEALTH COMPANION')}</Text>}</View></View> : <View />}{step === 1 && onSkip && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Skip introduction')} onPress={onSkip} style={s.skip}><Text style={[s.skipText, { color: c.muted }]}>{t('Skip')}</Text></TouchTarget>}</View>
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, step === 0 && s.firstContent, step === 2 && { gap: 8, paddingVertical: 4 }, compact && { gap: 16, paddingTop: 8 }]}>
      {step === 0 ? <>
        <Animated.View style={{ transform: [{ scale: sway.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }] }}><FigmaAsset screen="3:462" name="imgSvg2" width={144} height={144} /></Animated.View>
        <View style={s.message}><Text accessibilityRole="header" style={[s.wordmark, { color: c.ink }]}>Arogio</Text><Text style={[s.firstSubtitle, { color: c.muted }]}>{t('Your Health Companion')}</Text><View style={[s.badge, { borderColor: c.mintSurface, backgroundColor: c.surface, width: '100%', maxWidth: 310 }]}><View style={[s.badgeDot, { backgroundColor: c.primary }]} /><Text style={[s.badgeText, { color: c.primary, flex: 1, textAlign: 'center' }]}>{t('HOLISTIC CARE • DAILY WELLNESS')}</Text></View></View>
      </> : <>
        <LaunchOrbit step={step} size={size} motion={motion} />
        <View style={[s.message, step === 2 && { gap: 6 }]}>
          {step === 1 && <View style={[s.badge, { borderColor: c.mintSurface, backgroundColor: c.surface }]}><FigmaAsset screen="3:542" name="imgSvg" width={14} height={14} /><Text style={[s.badgeText, { color: c.primary }]}>{t('Trusted Healthcare Network')}</Text></View>}
          <Text accessibilityRole="header" style={[s.headline, compact && { fontSize: 23, lineHeight: 31 }, { color: c.ink }]}>{t(step === 1 ? 'Instant Care, ' : 'Meet Jeeva AI &')}{step === 1 ? '' : '\n'}<Text style={{ color: c.primary }}>{t(step === 1 ? 'Anywhere' : 'Daily Wellness')}</Text></Text>
          <Text style={[s.description, { color: c.muted }]}>{t(step === 1 ? 'Search top doctors, emergency beds, verified blood banks, and diagnostic labs across the nation in seconds.' : '24/7 symptom triage, smart medicine reminders, daily biometric sync, and personalized health guidance for your family.')}</Text>
          <View style={s.features}>{(step === 1 ? ['Verified Hubs', 'Emergency 108', 'ABDM Empanelled'] : ['Jeeva AI 24/7 Triage', 'Smart Pill Tracker', 'Ayush & Traditional Remedies']).map(text => <View key={text} style={[s.feature, { backgroundColor: c.surface, borderColor: c.mintSurface }]}><Text style={[s.featureText, { color: c.primary }]}>{t(text)}</Text></View>)}</View>
        </View>
      </>}
    </ScrollView>
    <View style={[s.controls, compact && { paddingBottom: 12 }]}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('Introduction screens')} style={s.pagination}>{([0, 1, 2] as const).map(index => <Pressable hitSlop={8} key={index} accessibilityRole="radio" accessibilityLabel={`${t('Introduction screen')} ${index + 1}`} accessibilityState={{ checked: index === step }} disabled={!onStepChange} onPress={() => onStepChange?.(index)} style={s.dotTarget}><View style={{ width: index === step ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: index === step ? c.primary : c.border }} /></Pressable>)}</View>
      {onNext && <TouchTarget accessibilityRole="button" onPress={onNext} style={({ pressed }) => [step === 0 ? s.discover : s.next, { backgroundColor: step === 0 ? 'transparent' : c.brandSurface, opacity: pressed ? 0.75 : 1 }]}><Text style={[step === 0 ? s.skipText : s.nextText, { color: step === 0 ? c.muted : c.onBrand }]}>{t(step === 0 ? 'Swipe to discover' : step === 1 ? 'Next' : 'Get Started')}</Text><AppIcon name="arrow" size={20} color={step === 0 ? c.muted : c.onBrand} /></TouchTarget>}
      {step === 0 && <Text style={[s.footer, { color: c.muted }]}>{t('MADE WITH EMPATHY FOR INDIA')}</Text>}
      {step === 2 && onSignIn && <Pressable hitSlop={8} accessibilityRole="button" onPress={onSignIn} style={s.signIn}><Text style={[s.skipText, { color: c.muted }]}>{t('Already have an account?')}{'  '}<Text style={{ color: c.primary, fontFamily: fonts.bold, textDecorationLine: 'underline' }}>{t('Sign In')}</Text></Text></Pressable>}
    </View>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' }, header: { width: '100%', maxWidth: 480, alignSelf: 'center', minHeight: 56, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 }, brandName: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 29 }, skip: { paddingHorizontal: 8 }, skipText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  content: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', alignItems: 'center', justifyContent: 'space-evenly', gap: 24, paddingHorizontal: 24, paddingVertical: 16 },
  firstContent: { justifyContent: 'center', gap: 24, paddingBottom: 64 }, message: { alignItems: 'center', gap: 14, width: '100%' },
  wordmark: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 55, letterSpacing: -1, width: '100%', textAlign: 'center' }, firstSubtitle: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, width: '100%', textAlign: 'center' },
  headline: { fontFamily: fonts.bold, fontSize: 25, lineHeight: 32, letterSpacing: -0.7, textAlign: 'center' }, description: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 360 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 24, paddingVertical: 5, paddingHorizontal: 12 }, badgeDot: { width: 6, height: 6, borderRadius: 3 }, badgeText: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 15, letterSpacing: 0.3, flexShrink: 1 },
  features: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }, feature: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 }, featureText: { fontFamily: fonts.medium, fontSize: 10, lineHeight: 15 },
  controls: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 12 }, pagination: { flexDirection: 'row', justifyContent: 'center' }, dotTarget: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  next: { minHeight: 56, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, nextText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 }, discover: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  signIn: { minHeight: 32, alignItems: 'center', justifyContent: 'center' }, footer: { fontFamily: fonts.medium, fontSize: 9, lineHeight: 15, letterSpacing: 0.6, textAlign: 'center', paddingTop: 18 },
  topLeaf: { position: 'absolute', left: -18, top: -38, opacity: 0.7 }, waves: { position: 'absolute', bottom: -6, left: -16, right: -16, height: 150 }, bottomLeaf: { position: 'absolute', left: 32, bottom: 0, opacity: 0.65 },
});
