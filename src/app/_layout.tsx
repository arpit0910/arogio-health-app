import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '../providers/AppProviders';
import { LaunchSequence } from '../features/launch/LaunchSequence';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <LaunchSequence><Stack screenOptions={{ headerShown: false }} /></LaunchSequence>
    </AppProviders>
  );
}
