import { AppAccessGate } from '../features/onboarding/AppAccess';
import { InboxProvider } from '../features/notifications/InboxProvider';
import { AppearanceProvider } from '../theme/AppearanceProvider';
import { PhoneStepsProvider } from '../features/activity/PhoneStepsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';

import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { LaunchArtwork } from '../features/launch/LaunchSequence';
import { SidebarProvider } from '../navigation/AppSidebar';
import { HealthSyncProvider } from '../features/health-sync/HealthSyncProvider';
import { WellnessProvider } from '../features/wellness/WellnessContext';

export function AppProviders({ children }: PropsWithChildren) {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, PlusJakartaSans_600SemiBold, DMSans_400Regular });
  if (fontError) throw fontError;
  return (
    <AppearanceProvider><SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider><InboxProvider><HealthSyncProvider><WellnessProvider><PhoneStepsProvider>{fontsLoaded ? <AppAccessGate><SidebarProvider>{children}</SidebarProvider></AppAccessGate> : <LaunchArtwork />}</PhoneStepsProvider></WellnessProvider></HealthSyncProvider></InboxProvider></AuthProvider>
    </QueryClientProvider>
    </SafeAreaProvider></AppearanceProvider>
  );
}
