import { useAppTheme } from '../../theme/AppearanceProvider';
import { FocusScrollView } from '../ui/FocusScrollView';
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./AppHeader";

export function AppScreen({
  children,
  title,
  back = false,
  action,
  onRefresh,
  refreshing = false,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  action?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const s = useStyles();

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
        <AppHeader back={back} title={title} action={action} />
        <FocusScrollView
          keyboardShouldPersistTaps="handled"
          bounces={Boolean(onRefresh)}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={s.safe.backgroundColor === '#00291E' ? '#79E6BB' : '#126349'} /> : undefined}
          overScrollMode="never"
          contentContainerStyle={s.scroll}
        >
          <View style={s.content}>{children}</View>
        </FocusScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export const useAppStyles = () => {
  const t = useAppTheme();
return StyleSheet.create({
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
  section: { gap: 12, marginTop: 32 },
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
  buttonText: { color: t.onPrimary, fontFamily: t.fonts.semibold, fontSize: 16 },
});
};
const useStyles = () => {
  const t = useAppTheme();
return StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
};
