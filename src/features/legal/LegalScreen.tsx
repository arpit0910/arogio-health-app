import { useTranslation } from "../../localization/LanguageProvider";
import { AppHeader } from '../../components/app/AppHeader';
import { usePalette } from '../../theme/AppearanceProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts, layout } from '../../theme/tokens';

const documents = {
  terms: {
    title: 'Terms of Service',
    sections: [
      ['About Arogio', 'Arogio provides tools to help you follow your health journey. These draft terms describe the intended use of the app. Final service terms must be approved before public launch.'],
      ['Your account', 'Use accurate account information and keep your sign-in credentials private. Do not use another person’s account or attempt to access information without permission.'],
      ['Using the app', 'Use Arogio lawfully and respectfully. Do not interfere with the service, misuse its features, or upload information you do not have permission to share.'],
      ['Health information', 'Health tracking information is for general information. It does not replace advice, diagnosis, or treatment from a qualified healthcare professional.'],
      ['Before these terms are published', 'The service operator, eligibility rules, support contact, account closure process, applicable law, and dispute terms still need to be confirmed.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Information used by this app', 'The current app sends your email address and password to the Arogio authentication service when you sign in or register. Registration can include your name. Google sign-in sends a Google identity token to that service.'],
      ['Health profile', 'The current profile supports height, weight, and BMI. Providing health information requires care; the final policy must describe the backend’s processing and access practices.'],
      ['Connected health data', 'On Android, Arogio can read steps, sleep, heart rate, weight, distance, active and total energy, exercise duration, floors climbed and water intake from Health Connect after you choose data types and grant access. You select one installed Health Connect-compatible source app at a time. Only that app supplies analytics, and changing the source clears the previous overview and cache. Compatible app names are discovered locally and not uploaded. Readings are used for the on-device overview and held in memory during the signed-in app session. Automatic refresh runs every five minutes while the app is active and when you return. Optional background refresh uses Android scheduling (at least 15 minutes, possibly later) and keeps a recent overview encrypted on the device. Connection preferences are saved on the device. They are not uploaded to the Arogio API or written back to Health Connect. Disconnect clears the displayed and cached readings and stops refreshes. Signing out clears cached readings and stops background work. You can revoke permissions in Android Health Connect settings. This does not delete records from source apps.'],
      ['Sign-in on your device', 'On mobile, remembered session tokens are stored using the operating system’s secure storage. When Remember me is off, the email sign-in session is kept in memory for the current app session. The web preview uses browser storage for remembered sessions.'],
      ['Your choices', 'You can sign out from the app. The final policy must explain how to request access, correction, export, or deletion of account information. Those request processes are not yet configured here.'],
      ['Before this policy is published', 'The service operator and privacy contact, purposes and legal grounds, retention periods, hosting locations, third parties, and user rights procedures require confirmation. This draft does not make claims about backend practices that have not been verified.'],
    ],
  },
} as const;

export function LegalScreen({ document }: { document: keyof typeof documents }) {
  const { t: tr } = useTranslation();
  const styles = useStyles();

  const content = documents[document];
  return <SafeAreaView style={styles.safe}>
    <AppHeader back title={content.title} />
    <ScrollView bounces={false} alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>{tr(content.title)}</Text>
      <View style={styles.notice}><Text style={styles.noticeText}>{tr("Draft for review · Not yet approved for public launch")}</Text></View>
      {content.sections.map(([title, body]) => <View key={title} style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>{tr(title)}</Text><Text style={styles.body}>{tr(body)}</Text>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: layout.maxFormWidth + 160, alignSelf: 'center', padding: 24, paddingBottom: 48 },
  back: { width: 44, minHeight: 44, justifyContent: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.heading, color: colors.ink, fontSize: 28, lineHeight: 36 },
  notice: { padding: 14, borderRadius: 12, backgroundColor: colors.subtle, marginVertical: 20 },
  noticeText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 13, lineHeight: 20 },
  section: { marginBottom: 24 },
  heading: { fontFamily: fonts.semibold, color: colors.ink, fontSize: 17, lineHeight: 25, marginBottom: 8 },
  body: { fontFamily: fonts.regular, color: colors.muted, fontSize: 14, lineHeight: 23 },
});
};
