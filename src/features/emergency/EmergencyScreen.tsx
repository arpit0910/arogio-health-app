import { useSafetyContact } from './safetyContact';
import { useAuth } from '../authentication/context/AuthContext';
import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { AppIcon, type AppIconName } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';

export function EmergencyScreen() {
  const router = useRouter(), contact = useSafetyContact(), { user } = useAuth();
  const { t: tr } = useTranslation();
  const colors = usePalette(), s = useStyles();
  const [error, setError] = useState<{ number: string; message: string } | null>(null);
  const dialLock = useRef(false);
  async function dial(number: string) {
    if (dialLock.current) return;
    dialLock.current = true;
    setError(null);
    try { await Linking.openURL(`tel:${number}`); }
    catch { setError({ number, message: 'The dialer could not open. Dial the number on your phone.' }); }
    finally { dialLock.current = false; }
  }
  function dialError(number: string) {
    return error?.number === number ? <Text accessibilityRole="alert" style={s.error}>{tr(error.message)}</Text> : null;
  }
  function bankAction(icon: AppIconName, title: string, onPress: () => void) {
    return <TouchTarget accessibilityRole="button" accessibilityLabel={tr(title)} onPress={onPress}
      style={({ pressed }) => [s.bankAction, pressed && s.pressed]}>
      <View style={s.bankIcon}><AppIcon name={icon} size={23} /></View>
      <Text style={[s.actionTitle, s.flex]}>{tr(title)}</Text>
      <AppIcon name="right" size={18} color={colors.muted} />
    </TouchTarget>;
  }
  return <AppScreen title={tr('Emergency')} back>
    <View style={s.page}>
      <View style={s.intro}>
        <Text accessibilityRole="header" style={s.heading}>{tr('Emergency help')}</Text>
        <Text style={s.body}>{tr('Emergency contacts for India. Choose a service to open your phone dialer.')}</Text>
        <Text style={s.detail}>{tr('Arogio cannot dispatch or monitor emergency help. These contacts are bundled for offline access; mobile service is needed to call.')}</Text>
      </View>

      {user && <View style={s.banks}><Text style={s.title}>{tr('Your SOS contact')}</Text>{contact.isPending ? <Text style={s.detail}>{tr('Loading contact...')}</Text> : contact.isError ? <Button title={tr('Retry contact')} variant="secondary" onPress={() => void contact.refetch()} /> : contact.data ? <><Text style={s.body}>{contact.data.name}</Text><Text style={s.detail}>{contact.data.phone}</Text><Button title={tr('Call SOS contact')} onPress={() => void dial(contact.data!.phone)} />{dialError(contact.data.phone)}</> : <Text style={s.detail}>{tr('Add a trusted person to call in an emergency.')}</Text>}<Button title={tr(contact.data ? 'Edit SOS contact' : 'Add SOS contact')} variant="secondary" onPress={() => router.push('/safety-contact')} /></View>}
      <View style={s.primaryContact}>
        <View style={s.contactHeading}>
          <View style={[s.flex, s.contactCopy]}>
            <Text accessibilityRole="header" style={s.primaryTitle}>{tr('Emergency services')}</Text>
            <Text selectable style={s.primaryNumber}>112</Text>
          </View>
          <View style={s.primaryIcon}><AppIcon name="phone" size={30} color={colors.primary} /></View>
        </View>
        <Text style={s.primaryDescription}>{tr('Police, fire and medical emergencies across India.')}</Text>
        <Button title={tr('Call 112')} variant="danger" leading={<AppIcon name="phone" size={21} color={colors.error} />} onPress={() => void dial('112')} />
        {dialError('112')}
      </View>

      <View style={s.ambulance}>
        <View style={s.contactHeading}>
          <View style={[s.flex, s.contactCopy]}>
            <Text accessibilityRole="header" style={s.title}>{tr('Ambulance')}</Text>
            <Text selectable style={s.secondaryNumber}>108</Text>
          </View>
          <View style={s.primaryIcon}><AppIcon name="ambulance" size={30} color={colors.primary} /></View>
        </View>
        <Text style={s.body}>{tr('Rajasthan ambulance contact. Availability is not live; you can also call 112.')}</Text>
        <Button title={tr('Call 108')} variant="danger" leading={<AppIcon name="phone" size={21} color={colors.error} />} onPress={() => void dial('108')} />
        {dialError('108')}
      </View>
      <View style={s.banks}><Text style={s.title}>{tr('Find care')}</Text><Button title={tr('Find Hospital')} variant="secondary" onPress={() => router.push('/find-care?kind=hospital')} /><Text style={s.detail}>{tr('Sources checked 10 November 2026: Ministry of Home Affairs (112) and Rajasthan Health Department (108).')}</Text><Button title={tr('112 official source')} variant="secondary" onPress={() => void Linking.openURL('https://www.mha.gov.in/emergency-response-support-system-erss').catch(() => setError({ number: 'source', message: 'Source could not open. Check your connection.' }))} /><Button title={tr('108 official source')} variant="secondary" onPress={() => void Linking.openURL('https://rajswasthya.rajasthan.gov.in/nhmpro.php?id=30').catch(() => setError({ number: 'source', message: 'Source could not open. Check your connection.' }))} />{dialError('source')}</View>

      <View style={s.banks}>
        <View style={s.bankHeading}>
          <Text accessibilityRole="header" style={s.title}>{tr('Blood banks')}</Text>
          <Text style={s.body}>{tr('Find a blood bank and call to confirm blood availability.')}</Text>
        </View>
        <View style={s.bankActions}>
          {bankAction('location', 'Find nearby blood banks', () => router.push('/blood-banks?nearby=1'))}
          <View style={s.divider} />
          {bankAction('search', 'Search by city or pincode', () => router.push('/blood-banks'))}
        </View>
      </View>
    </View>
  </AppScreen>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    page: { gap: 24 },
    intro: { gap: 8 },
    heading: { ...typeStyles.heading, color: c.ink },
    body: { ...typeStyles.body, color: c.muted },
    detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: c.muted },
    title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26, color: c.ink },
    flex: { flex: 1, minWidth: 0 },
    contactCopy: { gap: 4 },
    primaryContact: { padding: 20, gap: 16, borderRadius: 16, backgroundColor: c.errorSurface },
    contactHeading: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    primaryTitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, color: c.ink },
    primaryNumber: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 40, letterSpacing: -0.5, color: c.ink },
    primaryIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    primaryDescription: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: c.muted },
    ambulance: { gap: 16, padding: 20, borderRadius: 16, backgroundColor: c.surface },
    secondaryNumber: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 40, letterSpacing: -0.5, color: c.ink },
    banks: { gap: 16 },
    bankHeading: { gap: 6 },
    bankActions: { borderRadius: 16, backgroundColor: c.surface, overflow: 'hidden' },
    bankAction: { minHeight: 76, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    bankIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.subtle, alignItems: 'center', justifyContent: 'center' },
    actionTitle: { ...typeStyles.rowTitle, color: c.ink },
    divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
    pressed: { backgroundColor: c.subtle },
    error: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, color: c.error },
  });
};
