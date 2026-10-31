import { useLanguage } from '../localization/LanguageProvider';
import { useAppearance } from '../theme/AppearanceProvider';
import '../features/health-sync/backgroundHealth';
import { Stack, ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
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
  const language = useLanguage();
  const { colors, scheme, ready } = useAppearance();
  useEffect(() => { if (ready) void SystemUI.setBackgroundColorAsync(colors.background).catch(() => {}); }, [colors.background, ready]);
  if (!ready || !language.ready) return null;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: colors.background, card: colors.background, text: colors.ink, primary: colors.primary, border: colors.border } };
  return <ThemeProvider value={theme}><View style={{ flex: 1, backgroundColor: colors.background }}><NavigationBar style={scheme === 'dark' ? 'light' : 'dark'} /><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /><LaunchSequence><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></LaunchSequence></View></ThemeProvider>;
}
