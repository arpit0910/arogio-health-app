import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../features/auth/context/AuthContext";
import { AppNavigation, appTabs } from "./AppNavigation";
import type { ReactNode } from "react";

export function AuthenticatedLayout() {
  return (
    <AccountGuard>
      <Tabs
        tabBar={(props) => <AppNavigation {...props} />}
        screenOptions={{ headerShown: false, animation: "none" }}
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
