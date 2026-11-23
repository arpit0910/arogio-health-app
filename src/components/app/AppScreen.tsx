import { useAppTheme, usePalette } from '../../theme/AppearanceProvider';
import { FocusScrollView } from '../ui/FocusScrollView';
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./AppHeader";
import { ui } from '../../theme/tokens';
import { StandaloneAppNavigation } from '../../navigation/AppNavigation';

export function AppScreen({
  children,
  title,
  back = false,
  action,
  onRefresh,
  refreshing = false,
  scrollable = true,
  navigation,
  footer,
  onBack,
  scrollKey,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  action?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  scrollable?: boolean;
  navigation?: string;
  footer?: ReactNode;
  onBack?: () => void;
  scrollKey?: string | number;
}) {
  const s = useStyles();
  const colors = usePalette();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView
      edges={
        back && !navigation ? ["top", "left", "right", "bottom"] : ["top", "left", "right"]
      }
      style={s.safe}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.safe}
      >
        <AppHeader back={back} title={title} action={action} onBack={onBack} />
        {scrollable ? <FocusScrollView key={scrollKey}
          keyboardShouldPersistTaps="handled"
          bounces={Boolean(onRefresh)}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
          overScrollMode="never"
          contentContainerStyle={s.scroll}
        >
          <View style={[s.content, width >= 1024 && { maxWidth: 880 }]} >{children}</View>
        </FocusScrollView> : <View style={[s.content, { flex: 1, paddingHorizontal: 0, paddingTop: 0 }, width >= 1024 && { maxWidth: 880 }]}>{children}</View>}
        {footer}
        {navigation && <StandaloneAppNavigation selected={navigation} />}
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
    fontSize: 26,
    lineHeight: 34,
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
  section: { gap: 12, marginTop: 24 },
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
  card: { borderRadius: ui.radius.card, backgroundColor: t.white },
  button: {
    borderRadius: ui.radius.field,
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
    maxWidth: ui.content,
    alignSelf: "center",
    paddingHorizontal: ui.space.inset,
    paddingTop: 16,
  },
});
};
