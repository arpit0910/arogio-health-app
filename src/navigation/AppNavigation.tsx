import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchTarget } from "../components/ui/TouchTarget";
import { AppIcon, type AppIconName } from "../components/app/AppIcon";
import { appTheme as t } from "../theme/appTheme";

export const appTabs: { name: string; title: string; icon: AppIconName }[] = [
  { name: "home", title: "Home", icon: "home" },
  { name: "health", title: "Health", icon: "heart" },
  { name: "jeeva", title: "Jeeva AI", icon: "goal" },
  { name: "explore", title: "Explore", icon: "explore" },
  { name: "profile", title: "Profile", icon: "user" },
];
export function AppNavigation({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const { bottom, top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const expanded = width >= 768;
  return (
    <View style={[s.container, { paddingBottom: Math.max(bottom, 10) }, expanded && [s.rail, { paddingTop: top + 24 }]]}>
      <View style={[s.bar, expanded && s.railBar]}>
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
              style={[s.tab, expanded && s.railTab]}
            >
              {tab.name === "jeeva" ? <Image source={require("../../assets/home/jeeva.png")} accessible={false} style={[s.jeeva, expanded && s.railJeeva, selected && s.activeJeeva]} /> : <View style={[s.icon]}>
                <AppIcon
                  name={tab.icon}
                  size={24}
                  color={selected ? t.teal : t.muted}
                  filled={selected}
                />
              </View>}
              <Text
                style={[s.label, { color: selected ? t.teal : t.muted }]}
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
    backgroundColor: t.background,
    borderTopWidth: 1,
    borderColor: t.border,
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
  label: { fontFamily: t.fonts.medium, fontSize: 12, lineHeight: 18 },
  icon: { width: 52, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  activeJeeva: { borderWidth: 2, borderColor: t.teal },
  rail: { width: 96, height: '100%', borderTopWidth: 0, borderRightWidth: 1 },
  railBar: { flexDirection: 'column', gap: 20, width: '100%', maxWidth: undefined, paddingTop: 0 },
  railTab: { flex: 0, minHeight: 76, paddingHorizontal: 8, justifyContent: 'center' },
  railJeeva: { width: 56, height: 56, borderRadius: 28, marginTop: 0, marginBottom: 0 },
  jeeva: {
    width: 61,
    height: 61,
    marginTop: -29,
    marginBottom: -2,
    borderRadius: 31,
  },
});
