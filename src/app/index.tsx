import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../features/auth/context/AuthContext";
import { WelcomeScreen } from "../features/auth/components/WelcomeScreen";
import { colors } from "../theme/tokens";
export default function EntryRoute() {
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
        <ActivityIndicator accessibilityLabel="Loading Arogio" />
      </View>
    );
  if (!user) return <WelcomeScreen />;
  return (
    <Redirect href={user.profileCompletedAt ? "/home" : "/setup-profile"} />
  );
}
