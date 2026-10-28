import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, layout } from '../../theme/tokens';
import { AuthIcon } from '../auth/components/AuthIcon';

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
      ['Connected health data', 'On Android, Arogio can read steps, sleep, heart rate and weight from Health Connect after you choose data types and grant access. Readings are used for the on-device overview and held in memory for the screen session. They are not uploaded to the Arogio API or written back to Health Connect. Disconnect clears the displayed readings and stops refreshes. You can revoke permissions in Android Health Connect settings. This does not delete records from source apps.'],
      ['Sign-in on your device', 'On mobile, remembered session tokens are stored using the operating system’s secure storage. When Remember me is off, the email sign-in session is kept in memory for the current app session. The web preview uses browser storage for remembered sessions.'],
      ['Your choices', 'You can sign out from the app. The final policy must explain how to request access, correction, export, or deletion of account information. Those request processes are not yet configured here.'],
      ['Before this policy is published', 'The service operator and privacy contact, purposes and legal grounds, retention periods, hosting locations, third parties, and user rights procedures require confirmation. This draft does not make claims about backend practices that have not been verified.'],
    ],
  },
} as const;

export function LegalScreen({ document }: { document: keyof typeof documents }) {
  const content = documents[document];
  return <SafeAreaView style={styles.safe}>
    <ScrollView bounces={false} alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/signup')}><AuthIcon name="back" /></Pressable>
      <Text accessibilityRole="header" style={styles.title}>{content.title}</Text>
      <View style={styles.notice}><Text style={styles.noticeText}>Draft for review · Not yet approved for public launch</Text></View>
      {content.sections.map(([title, body]) => <View key={title} style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>{title}</Text><Text style={styles.body}>{body}</Text>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
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
