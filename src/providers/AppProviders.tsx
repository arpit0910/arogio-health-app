import { AccessibilityPreferencesProvider } from '../features/accessibility/AccessibilityPreferences';
import { LanguageProvider, useLanguage } from '../localization/LanguageProvider';
import { LaunchSequence } from '../features/app-launch/LaunchSequence';
import { AppAccessGate } from '../features/account-onboarding/AppAccess';
import { InboxProvider } from '../features/notifications/InboxProvider';
import { AppearanceProvider } from '../theme/AppearanceProvider';
import { PhoneStepsProvider } from '../features/activity/PhoneStepsProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { prepareLaunchAssets } from '../components/app/FigmaAsset';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';

import { queryClient } from '../services/api/queryClient';
import { AuthProvider } from '../features/authentication/context/AuthContext';
import { SidebarProvider } from '../navigation/AppSidebar';
import { HealthSyncProvider } from '../features/health-connections/HealthSyncProvider';
import { WellnessProvider } from '../features/personal-wellness/WellnessContext';

export function AppProviders({ children }: PropsWithChildren) {
  const [artworkReady, setArtworkReady] = useState(false);
  useEffect(() => { let alive = true; void prepareLaunchAssets().finally(() => { if (alive) setArtworkReady(true); }); return () => { alive = false; }; }, []);
  const [fontsLoaded, fontError] = useFonts({ PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, DMSans_400Regular, DMSans_500Medium });
  if (fontError) throw fontError;
  return (
    <AccessibilityPreferencesProvider><LanguageProvider><AppearanceProvider><SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider><AppLaunch ready={fontsLoaded && artworkReady}><InboxProvider><HealthSyncProvider><WellnessProvider><PhoneStepsProvider><AppAccessGate><SidebarProvider>{children}</SidebarProvider></AppAccessGate></PhoneStepsProvider></WellnessProvider></HealthSyncProvider></InboxProvider></AppLaunch></AuthProvider>
    </QueryClientProvider>
    </SafeAreaProvider></AppearanceProvider></LanguageProvider></AccessibilityPreferencesProvider>
  );
}

function AppLaunch({ ready, children }: PropsWithChildren<{ ready: boolean }>) {
  const language = useLanguage();
  if (!ready || !language.ready) return <View style={{ flex: 1, backgroundColor: '#F6FAF7' }} />;
  return <LaunchSequence>{children}</LaunchSequence>;
}
