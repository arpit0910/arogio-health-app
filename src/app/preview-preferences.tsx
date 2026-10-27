import { useState } from 'react';
import { View } from 'react-native';
import { AuthCanvas } from '../features/auth/components/AuthCanvas';
import { AuthIcon } from '../features/auth/components/AuthIcon';
import { ProfilePreferences } from '../features/profile/components/ProfilePreferences';
import { ProfileProgress, ProfileIcon, profileStyles } from '../features/profile/components/ProfilePrimitives';
import { profileAssets } from '../features/profile/assets/profileAssets';
import { Button } from '../components/ui/Button';
import { TouchTarget } from '../components/ui/TouchTarget';

export default function PreviewPreferences() {
  const [values, setValues] = useState({ healthReminders: true, tipsAndInsights: true, productUpdates: false });
  return <View style={{ flex: 1, width: '100%', maxWidth: 390, alignSelf: 'center' }}>
    <AuthCanvas background="backgroundSignup" backgroundXml={profileAssets.formBackground}>
      <View style={{ flexGrow: 1, flexShrink: 0, paddingBottom: 24 }}>
        <TouchTarget accessibilityRole="button" accessibilityLabel="Go back" style={{ marginLeft: 14, width: 48, alignItems: 'center', justifyContent: 'center' }}><ProfileIcon name="back" /></TouchTarget>
        <ProfileProgress step={5} />
        <View style={profileStyles.body}><ProfilePreferences values={values} onChange={(key, value) => setValues(current => ({ ...current, [key]: value }))} /></View>
        <View style={{ paddingHorizontal: 24, marginTop: 'auto', paddingTop: 24 }}><Button title="Continue" trailing={<AuthIcon name="arrow" />} /></View>
      </View>
    </AuthCanvas>
  </View>;
}
