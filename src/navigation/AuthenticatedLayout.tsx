import { useTranslation } from "../localization/LanguageProvider";
import { canEnterApp } from '../features/profile/setupStatus';
import { usePalette } from '../theme/AppearanceProvider';
import { Redirect, Tabs, usePathname } from "expo-router";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { useAuth } from "../features/authentication/context/AuthContext";
import { AppNavigation, appTabs } from "./AppNavigation";
import type { ReactNode } from "react";
import { isPublicAccountPath } from './publicAccess';

export function AuthenticatedLayout() {
  const colors = usePalette();
  const { width } = useWindowDimensions();
  return (
      <Tabs
        tabBar={(props) => <AppNavigation {...props} />}
        screenOptions={{ sceneStyle: { backgroundColor: colors.background }, headerShown: false, animation: "none", tabBarPosition: width >= 768 ? 'left' : 'bottom' }}
      >
        {appTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title }}
          />
        ))}
        {/* Custom AppNavigation omits this route. SDK 58 href:null redirects it away. */}
        <Tabs.Screen name="meditation" options={{ title: "Calm Zone" }} />
        <Tabs.Screen name="explore" options={{ title: "Discover" }} />
      </Tabs>
  );
}
export function AccountGuard({ children }: { children: ReactNode }) {
  const { t: tr } = useTranslation();
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator accessibilityLabel={tr("Loading your account")} />
      </View>
    );
  if (!user) return <Redirect href="/login" />;
  if (!canEnterApp(user)) return <Redirect href="/setup-profile" />;
  return children;
}

export function PublicOrAccountGuard({ children }: { children: ReactNode }) {
  const path = usePathname();
  const publicRoute = isPublicAccountPath(path);
  return publicRoute ? children : <AccountGuard>{children}</AccountGuard>;
}
