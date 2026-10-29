import { useAppearance } from '../theme/AppearanceProvider';
import '../features/health-sync/backgroundHealth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '../providers/AppProviders';
import { LaunchSequence } from '../features/launch/LaunchSequence';

// Hold the native logo until fonts and the first branded layout are ready.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {

  return (
    <AppProviders>
      <ThemedRoot />
    </AppProviders>
  );
}

function ThemedRoot() {
  const { colors, scheme, ready } = useAppearance();
  if (!ready) return null;
  return <><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /><LaunchSequence><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></LaunchSequence></>;
}
