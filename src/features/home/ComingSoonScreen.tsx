import { Text, View } from "react-native";
import { AppScreen, appStyles as a } from "../../components/app/AppScreen";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";
import { appTheme as t } from "../../theme/appTheme";
export function ComingSoonScreen({
  title,
  icon = "heart",
  back = false,
}: {
  title: string;
  icon?: AppIconName;
  back?: boolean;
}) {
  return (
    <AppScreen back={back} title={title}>
      <View style={{ gap: 14, paddingTop: 48, alignItems: "center" }}>
        <AppIcon name={icon} size={40} />
        <Text accessibilityRole="header" style={a.title}>
          {title}
        </Text>
        <Text style={[a.sectionTitle, { color: t.teal }]}>Coming soon</Text>
        <Text style={[a.subtitle, { textAlign: "center" }]}>
          We&apos;re working on this feature. You can continue managing your
          profile and health preferences.
        </Text>
      </View>
    </AppScreen>
  );
}
