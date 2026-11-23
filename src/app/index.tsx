import { useTranslation } from "../localization/LanguageProvider";
import { canEnterApp } from '../features/profile/setupStatus';
import { usePalette } from '../theme/AppearanceProvider';
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../features/authentication/context/AuthContext";
import { Button } from '../components/ui/Button';

export default function EntryRoute() {
  const router = useRouter();
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
        <View style={{ padding: 24 }}><Button title={tr('Emergency contacts')} variant="danger" onPress={() => router.push('/emergency')} /></View>
      </View>
    );
  if (!user) return <Redirect href="/login" />;
  return (
    <Redirect href={canEnterApp(user) ? "/home" : "/setup-profile"} />
  );
}
