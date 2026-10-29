import '../features/health-sync/backgroundHealth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '../providers/AppProviders';
import { LaunchSequence } from '../features/launch/LaunchSequence';
import { colors } from '../theme/tokens';

// Hold the native logo until fonts and the first branded layout are ready.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <LaunchSequence><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></LaunchSequence>
    </AppProviders>
  );
}
