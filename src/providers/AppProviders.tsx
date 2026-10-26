import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
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

export function AppProviders({ children }: PropsWithChildren) {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, PlusJakartaSans_600SemiBold, DMSans_400Regular });
  if (fontError) throw fontError;
  if (!fontsLoaded) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}><ActivityIndicator color="#096E64" accessibilityLabel="Loading Arogio" /></View>;
  return (
    <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
    </SafeAreaProvider>
  );
}
