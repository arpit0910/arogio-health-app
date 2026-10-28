import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen, appStyles as a } from '../../components/app/AppScreen';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useAuth } from '../../features/auth/context/AuthContext';

export default function SettingsRoute() {
  const { user } = useAuth();
  return <AppScreen back title="Settings"><View style={{ gap: 20 }}><Text style={a.sectionTitle}>Account</Text><Text style={a.subtitle}>{user?.email || user?.mobileNumber}</Text>
    <TouchTarget accessibilityRole="link" onPress={() => router.push('/terms')}><Text style={a.edit}>Terms of Service</Text></TouchTarget><TouchTarget accessibilityRole="link" onPress={() => router.push('/privacy')}><Text style={a.edit}>Privacy Policy</Text></TouchTarget>
  </View></AppScreen>;
}
