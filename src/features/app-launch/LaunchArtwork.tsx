import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useEffect, useState } from 'react';
import { Platform, Animated, Easing, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
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
  const size = Math.max(210, Math.min(width - 48, compact ? 294 : 350));
  const [sway] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion) { sway.setValue(0); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.timing(sway, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
    ]));
    animation.start(); return () => animation.stop();
  }, [motion, sway]);
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Boolean(onStepChange) && Math.abs(g.dx) > 35 && Math.abs(g.dy) < 25,
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 45) onStepChange?.(Math.max(0, Math.min(2, step + (g.dx < 0 ? 1 : -1))) as LaunchStep); },
  });
  return <View style={[s.screen, { backgroundColor: c.background }]} {...gesture.panHandlers}>
    <View pointerEvents="none" accessible={false} {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' })} style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: step === 0 ? -24 : -32, top: step === 0 ? -24 : -20 }}><FigmaAsset screen={step === 0 ? '3:462' : step === 1 ? '3:542' : '3:842'} name={step === 0 ? 'imgSvg' : step === 1 ? 'imgSvgTopLeftOrganicLeavesMotif' : 'imgSvgTopLeftGentleBotanicalLeafCluster'} width={step === 0 ? 224 : step === 1 ? 192 : 176} /></View>
      <Animated.View style={{ position: 'absolute', bottom: 0, left: -6, transform: [{ translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] }) }] }}><FigmaAsset screen={step === 0 ? '3:462' : step === 1 ? '3:542' : '3:842'} name={step === 0 ? 'imgSvg1' : step === 1 ? 'imgSvgBottomAmbientWaveLayer' : 'imgSvgBottomFlowingTranslucentOrganicCurves'} width={width + 12} /></Animated.View>
    </View>
    <View style={s.header}>
      {step > 0 ? <View style={s.brand}>
        <FigmaAsset screen="3:462" name="imgSvg2" width={30} height={30} />
        <Text style={[s.brandName, { color: c.ink }]}>Arogio</Text>
      </View> : <View />}
      {onSkip && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Skip introduction')} onPress={onSkip} style={s.skip}>
        <Text style={[s.skipText, { color: c.muted }]}>{t('Skip')}</Text>
      </TouchTarget>}
    </View>
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, step === 0 && s.firstContent, step === 2 && { gap: 8, paddingVertical: 4 }, compact && { gap: 16, paddingTop: 8 }]}>
      {step === 0 ? <>
        <Animated.View style={{ transform: [{ scale: sway.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }] }}><FigmaAsset screen="3:462" name="imgSvg2" width={144} height={144} /></Animated.View>
        <View style={s.message}>
          <Text accessibilityRole="header" style={[s.wordmark, { color: c.ink }]}>Arogio</Text>
          <Text style={[s.firstSubtitle, { color: c.muted }]}>{t('Your Health Companion')}</Text>
        </View>
      </> : <>
        <LaunchOrbit step={step} size={size} motion={motion} />
        <View style={[s.message, step === 2 && { gap: 6 }]}>
          <Text accessibilityRole="header" style={[s.headline, compact && { fontSize: 23, lineHeight: 31 }, { color: c.ink }]}>
            {t(step === 1 ? 'Find care near you' : 'Meet Jeeva AI & Daily Wellness')}
          </Text>
          <Text style={[s.description, { color: c.muted }]}>
            {t(step === 1 ? 'Browse doctors and hospitals, or find emergency contacts when you need them.' : 'Explore health topics with Jeeva, and keep water, medicines, and daily activity together.')}
          </Text>
        </View>
      </>}
    </ScrollView>
    <View style={[s.controls, compact && { paddingBottom: 12 }]}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('Introduction screens')} style={s.pagination}>{([0, 1, 2] as const).map(index => <Pressable hitSlop={8} key={index} accessibilityRole="radio" accessibilityLabel={`${t('Introduction screen')} ${index + 1}`} accessibilityState={{ checked: index === step }} disabled={!onStepChange} onPress={() => onStepChange?.(index)} style={s.dotTarget}><View style={{ width: index === step ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: index === step ? c.primary : c.border }} /></Pressable>)}</View>
      {onNext && <TouchTarget accessibilityRole="button" onPress={onNext} style={({ pressed }) => [s.next, { backgroundColor: c.brandSurface, opacity: pressed ? 0.75 : 1 }]}><Text style={[s.nextText, { color: c.onBrand }]}>{t(step === 2 ? 'Get Started' : 'Next')}</Text><AppIcon name="arrow" size={20} color={c.onBrand} /></TouchTarget>}
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
  headline: { fontFamily: fonts.bold, fontSize: 29, lineHeight: 36, letterSpacing: -0.7, textAlign: 'center' }, description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 360 },
  controls: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 12 }, pagination: { flexDirection: 'row', justifyContent: 'center' }, dotTarget: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  next: { minHeight: 56, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, nextText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  signIn: { minHeight: 32, alignItems: 'center', justifyContent: 'center' },
});
