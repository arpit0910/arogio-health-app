import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchTarget } from "../components/ui/TouchTarget";
import { AppIcon, type AppIconName } from "../components/app/AppIcon";
import { appTheme as t } from "../theme/appTheme";

export const appTabs: { name: string; title: string; icon: AppIconName }[] = [
  { name: "home", title: "Home", icon: "home" },
  { name: "explore", title: "Explore", icon: "explore" },
  { name: "jeeva", title: "Jeeva AI", icon: "goal" },
  { name: "health", title: "Health", icon: "heart" },
  { name: "profile", title: "Profile", icon: "user" },
];
export function AppNavigation({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingBottom: Math.max(bottom, 10) }]}>
      <View style={s.bar}>
        {appTabs.map((tab) => {
          const index = state.routes.findIndex(
            (route) => route.name === tab.name,
          );
          const route = state.routes[index];
          if (!route) return null;
          const selected = state.index === index;
          return (
            <TouchTarget
              key={tab.name}
              accessibilityRole="tab"
              accessibilityLabel={tab.title}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented)
                  navigateToTab(route.key);
              }}
              style={s.tab}
            >
              {tab.name === "jeeva" ? (
                <Image
                  source={require("../../assets/home/jeeva.png")}
                  style={s.jeeva}
                />
              ) : (
                <AppIcon
                  name={tab.icon}
                  size={24}
                  color={selected ? t.teal : "#7C85A4"}
                  filled={selected}
                />
              )}
              <Text
                style={[s.label, { color: selected ? "#007D77" : t.muted }]}
              >
                {tab.title}
              </Text>
            </TouchTarget>
          );
        })}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#F1F5F4",
  },
  bar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingTop: 7,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    minHeight: 51,
  },
  label: { fontFamily: t.fonts.regular, fontSize: 10.5, lineHeight: 15 },
  jeeva: {
    width: 61,
    height: 61,
    marginTop: -29,
    marginBottom: -2,
    borderRadius: 31,
  },
});
