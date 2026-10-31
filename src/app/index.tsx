import { useTranslation } from "../localization/LanguageProvider";
import { canEnterApp } from '../features/profile/setupStatus';
import { usePalette } from '../theme/AppearanceProvider';
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../features/auth/context/AuthContext";
import { WelcomeScreen } from "../features/auth/components/WelcomeScreen";

export default function EntryRoute() {
  const { t: tr } = useTranslation();
  const colors = usePalette();

  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator accessibilityLabel={tr("Loading Arogio")} />
      </View>
    );
  if (!user) return <WelcomeScreen />;
  return (
    <Redirect href={canEnterApp(user) ? "/home" : "/setup-profile"} />
  );
}
