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
      <View style={[s.glowTop, { backgroundColor: c.mintSurface }]} />
      <Animated.View style={[s.glowBottom, { backgroundColor: c.subtle, transform: [{ translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }) }] }]} />
    </View>
    <View style={s.header}>
      <View style={s.brand}>
        <View style={[s.headerBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
          <FigmaAsset screen="3:462" name="imgSvg2" width={24} height={24} />
        </View>
        <Text style={[s.brandName, { color: c.ink }]}>Arogio</Text>
      </View>
      {onSkip && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Skip introduction')} onPress={onSkip} style={[s.skip, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[s.skipText, { color: c.primaryPressed }]}>{t('Skip')}</Text>
      </TouchTarget>}
    </View>
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, step === 0 && s.firstContent, step === 2 && { gap: 12, paddingVertical: 8 }, compact && { gap: 14, paddingTop: 8 }]}>
      {step === 0 ? <>
        <Animated.View style={[s.heroHalo, { backgroundColor: c.mintSurface, transform: [{ scale: sway.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }] }]}>
          <View style={[s.heroBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
            <FigmaAsset screen="3:462" name="imgSvg2" width={96} height={96} />
          </View>
        </Animated.View>
        <View style={s.message}>
          <View style={[s.pill, { backgroundColor: c.mintSurface }]}>
            <Text style={[s.pillText, { color: c.primaryPressed }]}>{t('Health. Help. Hope.')}</Text>
          </View>
          <Text accessibilityRole="header" style={[s.wordmark, { color: c.ink }]}>Arogio</Text>
          <Text style={[s.firstSubtitle, { color: c.muted }]}>{t('Your Health Companion')}</Text>
        </View>
      </> : <>
        <View style={[s.orbitCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <LaunchOrbit step={step} size={Math.min(size, 280)} motion={motion} />
        </View>
        <View style={[s.message, step === 2 && { gap: 8 }]}>
          <Text accessibilityRole="header" style={[s.headline, compact && { fontSize: 24, lineHeight: 32 }, { color: c.ink }]}>
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
      {onNext && <TouchTarget accessibilityRole="button" onPress={onNext} style={({ pressed }) => [s.next, { backgroundColor: c.brandSurface, opacity: pressed ? 0.85 : 1 }]}><Text style={[s.nextText, { color: c.onBrand }]}>{t(step === 2 ? 'Get Started' : 'Next')}</Text><AppIcon name="arrow" size={20} color={c.onBrand} /></TouchTarget>}
      {step === 2 && onSignIn && <Pressable hitSlop={8} accessibilityRole="button" onPress={onSignIn} style={s.signIn}><Text style={[s.signInPrompt, { color: c.muted }]}>{t('Already have an account?')}{'  '}<Text style={{ color: c.primaryPressed, fontFamily: fonts.semibold, textDecorationLine: 'underline' }}>{t('Sign In')}</Text></Text></Pressable>}
    </View>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  glowTop: { position: 'absolute', top: -120, right: -80, width: 280, height: 280, borderRadius: 140, opacity: 0.55 },
  glowBottom: { position: 'absolute', bottom: -140, left: -90, width: 320, height: 320, borderRadius: 160, opacity: 0.7 },
  header: { width: '100%', maxWidth: 480, alignSelf: 'center', minHeight: 60, paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBadge: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  skip: { paddingHorizontal: 14, minHeight: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  content: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24, paddingVertical: 16 },
  firstContent: { justifyContent: 'center', gap: 24, paddingBottom: 32 },
  heroHalo: { width: 176, height: 176, borderRadius: 88, alignItems: 'center', justifyContent: 'center' },
  heroBadge: { width: 132, height: 132, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  orbitCard: { borderRadius: 28, borderWidth: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  message: { alignItems: 'center', gap: 10, width: '100%' },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  wordmark: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 48, letterSpacing: -1, width: '100%', textAlign: 'center' },
  firstSubtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, width: '100%', textAlign: 'center' },
  headline: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, letterSpacing: -0.6, textAlign: 'center' },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 340 },
  controls: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  pagination: { flexDirection: 'row', justifyContent: 'center' },
  dotTarget: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  next: { minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextText: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  signIn: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  signInPrompt: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
});
