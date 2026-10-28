import { FocusScrollView } from '../ui/FocusScrollView';
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TouchTarget } from "../ui/TouchTarget";
import { appTheme as t } from "../../theme/appTheme";
import { AppIcon } from "./AppIcon";

export function AppScreen({
  children,
  title,
  back = false,
  action,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  action?: ReactNode;
}) {
  return (
    <SafeAreaView
      edges={
        back ? ["top", "left", "right", "bottom"] : ["top", "left", "right"]
      }
      style={s.safe}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.safe}
      >
        {back && (
          <View style={s.header}>
            <TouchTarget
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/profile")
              }
              style={s.back}
            >
              <AppIcon name="back" color={t.ink} size={22} />
            </TouchTarget>
            <Text accessibilityRole="header" style={s.headerTitle}>
              {title}
            </Text>
            <View style={s.back}>{action}</View>
          </View>
        )}
        <FocusScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={s.scroll}
        >
          <View style={s.content}>{children}</View>
        </FocusScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export const appStyles = StyleSheet.create({
  title: {
    color: t.ink,
    fontFamily: t.fonts.bold,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    color: t.muted,
    fontFamily: t.fonts.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    color: t.ink,
    fontFamily: t.fonts.semibold,
    fontSize: 19,
    lineHeight: 26,
  },
  section: { gap: 12, marginTop: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  edit: {
    color: t.teal,
    fontFamily: t.fonts.medium,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  card: { borderRadius: 14, backgroundColor: t.white },
  button: {
    borderRadius: 12,
    backgroundColor: t.teal,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonText: { color: t.white, fontFamily: t.fonts.semibold, fontSize: 16 },
});
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.background },
  scroll: { flexGrow: 1, paddingBottom: 26 },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  back: { width: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: t.ink,
    fontFamily: t.fonts.semibold,
    fontSize: 18,
  },
});
