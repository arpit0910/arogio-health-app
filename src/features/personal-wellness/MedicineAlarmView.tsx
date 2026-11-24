import { useState } from 'react';
import { Platform, ActivityIndicator, Pressable, ScrollView, StyleSheet, StatusBar, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { AppIcon } from '../../components/app/AppIcon';
import { fonts } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { formatClock } from '../../shared/date-time';
import type { Medicine } from './domain';

export type MedicineAlarmViewProps = {
  medicine?: Medicine; day: string; time: string; loading?: boolean; busy?: boolean;
  error?: string | null; remaining?: number; onDismiss: () => void;
  onAction: (action: 'medicine_take' | 'medicine_snooze', minutes?: number) => void;
};
export function MedicineAlarmView({ medicine, day, time, loading, busy, error, remaining = 1, onDismiss, onAction }: MedicineAlarmViewProps) {
  const [minutes, setMinutes] = useState(15);
  const insets = useSafeAreaInsets(), { language, t } = useTranslation();
  const window = useWindowDimensions(), compact = window.height < 780 || window.fontScale > 1.2;
  const dose = medicine?.doses.find(item => item.time === time);
  const date = new Date(`${day}T12:00:00Z`);
  const weekday = date.getUTCDay();
  const days = language === 'hi' ? ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const title = language === 'hi' ? `आपकी ${formatClock(time)} की दवा का समय` : `Time for your ${formatClock(time)} medication`;
  return <View style={s.root} accessibilityViewIsModal>
    <StatusBar barStyle="light-content" />
    <View pointerEvents="none" style={StyleSheet.absoluteFill} {...(Platform.OS === 'web' ? { 'aria-hidden': true } : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' })}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 390 884">
        <Defs>
          <LinearGradient id="alarm-ground" x1="0" y1="0" x2="0.7" y2="1"><Stop stopColor="#075747" /><Stop offset="1" stopColor="#052D26" /></LinearGradient>
          <RadialGradient id="alarm-light" cx="48%" cy="18%" r="70%"><Stop stopColor="#129A79" stopOpacity=".45" /><Stop offset="1" stopColor="#052D26" stopOpacity="0" /></RadialGradient>
        </Defs>
        <Rect width="390" height="884" fill="url(#alarm-ground)" /><Rect width="390" height="884" fill="url(#alarm-light)" />
        <Path d="M-40 225C98 441 188 384 254 616S414 696 480 830M-40 575C131 489 223 461 408 154" stroke="#39BB98" strokeOpacity=".13" strokeWidth="2" fill="none" />
        <Path d="M-15 395C111 501 128 485 174 639" stroke="#B1E7D3" strokeOpacity=".15" strokeWidth="2" strokeDasharray="7 9" fill="none" />
      </Svg>
    </View>
    <View style={[s.page, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ flexGrow: 1 }}>
      {!compact && <View style={s.week} accessible accessibilityLabel={date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}>
        {days.map((label, index) => <View key={index} style={[s.day, index === weekday && s.today]}><Text style={[s.dayText, index === weekday && s.todayText]}>{label}</Text></View>)}
      </View>}
      <View style={[s.hero, compact && { paddingVertical: 8 }]}>
        {!compact && <View style={s.icon}><AppIcon name="pill" size={48} color="#76E6C1" /><View style={s.badge}><Text style={s.badgeText}>{remaining}</Text></View></View>}
        <Text accessibilityRole="header" style={s.title}>{loading ? t('Loading medicine reminder…') : medicine && dose ? title : t('This reminder is no longer available')}</Text>
        {medicine && dose && <View style={s.details}><View style={s.dot} /><Text style={s.detailText}>{medicine.name}{medicine.strength ? ` · ${medicine.strength}${medicine.unit ?? ''}` : ''} · {dose.amount}</Text></View>}
        {!!medicine?.notes && <Text style={s.instructions}>{medicine.notes}</Text>}
        {dose?.meal && dose.meal !== 'any' && <Text style={s.instructions}>{t(dose.meal === 'before' ? 'Before food' : 'After food')}</Text>}
        {loading && <ActivityIndicator size="large" color="#76E6C1" />}
        {!loading && (!medicine || !dose) && <Text style={s.instructions}>{t('Check your medicine log for the latest schedule.')}</Text>}
      </View>
      </ScrollView>
      <View style={s.actions}>
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={onDismiss} style={({ pressed }) => [s.button, s.secondary, pressed && s.pressed, busy && s.disabled]}><Text style={s.secondaryText}>{t('Dismiss')}</Text></Pressable>
        {!!medicine && !!dose && <>
          <Pressable accessibilityRole="button" accessibilityState={{ busy: !!busy, disabled: !!busy }} disabled={busy || loading} onPress={() => onAction('medicine_take')} style={({ pressed }) => [s.button, s.take, pressed && s.pressed, busy && s.disabled]}>{busy ? <ActivityIndicator color="#003C2F" /> : <Text style={s.takeText}>{t('Take')}</Text>}</Pressable>
          <View style={s.snooze}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Snooze five minutes less')} disabled={busy || minutes <= 5} onPress={() => setMinutes(value => Math.max(5, value - 5))} style={({ pressed }) => [s.adjust, pressed && s.pressed, (busy || minutes <= 5) && s.disabled]}><AppIcon name="minus" size={22} color="#E5FFF5" /></Pressable>
            <Pressable accessibilityRole="button" disabled={busy || loading} onPress={() => onAction('medicine_snooze', minutes)} style={({ pressed }) => [s.snoozeButton, pressed && s.pressed, busy && s.disabled]}><Text style={s.snoozeText}>{language === 'hi' ? `${minutes} मिनट बाद याद दिलाएँ` : `Snooze ${minutes} mins`}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Snooze five minutes more')} disabled={busy || minutes >= 60} onPress={() => setMinutes(value => Math.min(60, value + 5))} style={({ pressed }) => [s.adjust, pressed && s.pressed, (busy || minutes >= 60) && s.disabled]}><AppIcon name="plus" size={22} color="#E5FFF5" /></Pressable>
          </View>
          <Text style={s.hint}>{t('Dismiss closes this alert without changing your dose log.')}</Text>
        </>}
      </View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#052D26' },
  page: { flex: 1, paddingHorizontal: 28, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 24 },
  week: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { width: 38, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  today: { borderRadius: 24, borderWidth: 1, borderColor: '#40C3A0', backgroundColor: '#1C705D' },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: '#AFD5C9' }, todayText: { color: '#E8FFF6', fontFamily: fonts.bold },
  hero: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 32 },
  icon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#2C806D', borderWidth: 1, borderColor: '#72B3A0', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  badge: { position: 'absolute', right: -6, top: -5, minWidth: 30, minHeight: 30, borderRadius: 18, backgroundColor: '#30CEA0', borderWidth: 2, borderColor: '#063C31', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 14, fontFamily: fonts.bold, color: '#003C2F' },
  title: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 32, lineHeight: 40, textAlign: 'center', letterSpacing: -0.7 },
  details: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 22, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#235F50', maxWidth: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4AE4B1' },
  detailText: { color: '#F1FFF8', fontSize: 16, lineHeight: 24, fontFamily: fonts.medium, flexShrink: 1 },
  instructions: { color: '#C1E9D9', fontSize: 17, lineHeight: 25, fontFamily: fonts.regular, textAlign: 'center' },
  actions: { gap: 12 }, button: { minHeight: 60, borderRadius: 32, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  secondary: { backgroundColor: '#315F53', borderWidth: 1, borderColor: '#759A8B' },
  secondaryText: { color: '#F2FFF9', fontSize: 18, fontFamily: fonts.semibold },
  take: { backgroundColor: '#00D59D' }, takeText: { color: '#003A2D', fontSize: 21, fontFamily: fonts.bold },
  snooze: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  adjust: { width: 52, minHeight: 52, borderRadius: 28, backgroundColor: '#315F53', borderWidth: 1, borderColor: '#759A8B', alignItems: 'center', justifyContent: 'center' },
  snoozeButton: { flex: 1, minHeight: 56, borderRadius: 30, backgroundColor: '#315F53', borderWidth: 1, borderColor: '#759A8B', alignItems: 'center', justifyContent: 'center', padding: 10 },
  snoozeText: { color: '#F2FFF9', fontSize: 17, fontFamily: fonts.medium, textAlign: 'center' },
  hint: { color: '#B8DCCE', fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: fonts.regular, marginTop: 4 },
  error: { color: '#FFE0CC', fontSize: 16, lineHeight: 24, fontFamily: fonts.medium },
  pressed: { opacity: 0.78 }, disabled: { opacity: 0.45 },
});
