import { usePalette } from '../theme/AppearanceProvider';
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";
import { useAuth } from "../features/auth/context/AuthContext";
import { AppNavigation, appTabs } from "./AppNavigation";
import type { ReactNode } from "react";

export function AuthenticatedLayout() {
  const colors = usePalette();
  const { width } = useWindowDimensions();
  return (
    <AccountGuard>
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
      </Tabs>
    </AccountGuard>
  );
}
export function AccountGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator accessibilityLabel="Loading your account" />
      </View>
    );
  if (!user) return <Redirect href="/login" />;
  if (!user.profileCompletedAt) return <Redirect href="/setup-profile" />;
  return children;
}
