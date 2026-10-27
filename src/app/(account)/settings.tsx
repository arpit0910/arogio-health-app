import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen, appStyles as a } from '../../components/app/AppScreen';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useAuth } from '../../features/auth/context/AuthContext';
import { FormError } from '../../features/auth/components/AuthPrimitives';
export default function SettingsRoute() {
  const { user, logout, isSubmitting } = useAuth();
  const [error, setError] = useState<string | null>(null);
  return <AppScreen back title="Settings"><View style={{ gap: 20 }}><Text style={a.sectionTitle}>Account</Text><Text style={a.subtitle}>{user?.email || user?.mobileNumber}</Text>
    <TouchTarget accessibilityRole="link" onPress={() => router.push('/terms')}><Text style={a.edit}>Terms of Service</Text></TouchTarget><TouchTarget accessibilityRole="link" onPress={() => router.push('/privacy')}><Text style={a.edit}>Privacy Policy</Text></TouchTarget>
    <FormError message={error} /><TouchTarget accessibilityRole="button" accessibilityLabel="Log out" disabled={isSubmitting} onPress={() => void logout().catch(() => setError('Unable to log out. Please try again.'))} style={a.button}>{isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={a.buttonText}>Log out</Text>}</TouchTarget>
  </View></AppScreen>;
}
