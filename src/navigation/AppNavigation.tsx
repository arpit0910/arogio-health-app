import { AccessibleText as Text } from '../components/ui/AccessibleText';
import { useTranslation } from "../localization/LanguageProvider";
import { useAppTheme } from '../theme/AppearanceProvider';
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchTarget } from "../components/ui/TouchTarget";
import { AppIcon, type AppIconName } from "../components/app/AppIcon";
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';


export const appTabs: { name: string; title: string; icon: AppIconName }[] = [
  { name: "home", title: "Home", icon: "home" },
  { name: "find-care", title: "Find Care", icon: "stethoscope" },
  { name: "jeeva", title: "Jeeva AI", icon: "goal" },
  { name: "health", title: "Health", icon: "report" },
  { name: "profile", title: "Profile", icon: "user" },
];
export function StandaloneAppNavigation({ selected = 'health' }: { selected?: string }) {
  const router = useRouter();
  return (
    <NavBarShell
      isSelected={(tab) => tab.name === selected}
      onSelect={(tab) =>
        router.navigate(`/${tab.name}` as '/home' | '/find-care' | '/jeeva' | '/health' | '/profile')
      }
    />
  );
}

export function AppNavigation({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  return (
    <NavBarShell
      isSelected={(tab) => {
        const index = state.routes.findIndex((route) => route.name === tab.name);
        return index >= 0 && state.index === index;
      }}
      isAvailable={(tab) => state.routes.some((route) => route.name === tab.name)}
      onSelect={(tab, selected) => {
        const route = state.routes.find((item) => item.name === tab.name);
        if (!route) return;
        const event = emitter.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });
        if (!selected && !event.defaultPrevented) {
          navigateToTab(route.key);
        }
      }}
    />
  );
}

function NavBarShell({
  isSelected,
  isAvailable,
  onSelect,
}: {
  isSelected: (tab: (typeof appTabs)[number]) => boolean;
  isAvailable?: (tab: (typeof appTabs)[number]) => boolean;
  onSelect: (tab: (typeof appTabs)[number], selected: boolean) => void;
}) {
  const { t: tr } = useTranslation();
  const t = useAppTheme();
  const s = useStyles();
  const { bottom, top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const expanded = width >= 768;

  return (
    <View style={[s.container, { paddingBottom: Math.max(bottom, 10) }, expanded && [s.rail, { paddingTop: top + 24 }]]}>
      <View style={[s.bar, expanded && s.railBar]}>
        {appTabs.map((tab) => {
          if (isAvailable && !isAvailable(tab)) return null;
          const selected = isSelected(tab);
          return (
            <TouchTarget
              key={tab.name}
              accessibilityRole="tab"
              accessibilityLabel={tr(tab.title)}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => onSelect(tab, selected)}
              style={[s.tab, expanded && s.railTab]}
            >
              {tab.name === "jeeva" ? (
                <View style={[s.jeeva, expanded && s.railJeeva]}>
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id="jeeva-tab" x1="0" y1="1" x2="1" y2="0">
                        <Stop offset="0" stopColor="#007D75" />
                        <Stop offset="1" stopColor="#20B9A6" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" rx="32" fill="url(#jeeva-tab)" />
                  </Svg>
                  <AppIcon name="sparkles" color="#FFFFFF" size={32} />
                </View>
              ) : (
                <View style={[s.icon, selected && { backgroundColor: t.mint }]}>
                  <AppIcon
                    name={tab.icon}
                    size={24}
                    color={selected ? t.teal : t.muted}
                    filled={selected}
                  />
                </View>
              )}
              <Text
                numberOfLines={1}
                style={[
                  s.label,
                  { color: selected || tab.name === "jeeva" ? t.teal : t.muted },
                  selected && { fontFamily: t.fonts.bold },
                ]}
              >
                {tr(tab.title)}
              </Text>
            </TouchTarget>
          );
        })}
      </View>
    </View>
  );
}
const useStyles = () => {
  const t = useAppTheme();
return StyleSheet.create({
  container: {
    backgroundColor: t.white,
    borderTopWidth: StyleSheet.hairlineWidth,
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
    minWidth: 0,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 5,
    minHeight: 51,
  },
  label: { fontFamily: t.fonts.medium, fontSize: 12, lineHeight: 18, textAlign: 'center', includeFontPadding: false, maxWidth: '100%' },
  icon: { width: 52, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  rail: { width: 96, height: '100%', borderTopWidth: 0, borderRightWidth: 1, borderRadius: 0 },
  railBar: { flexDirection: 'column', gap: 20, width: '100%', maxWidth: undefined, paddingTop: 0 },
  railTab: { flex: 0, minHeight: 76, paddingHorizontal: 8, justifyContent: 'center' },
  railJeeva: { width: 56, height: 56, borderRadius: 28, marginTop: 0, marginBottom: 0 },
  jeeva: {
    width: 64,
    height: 64,
    marginTop: -28,
    marginBottom: -2,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: t.teal,
    borderWidth: 4,
    borderColor: t.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
};
