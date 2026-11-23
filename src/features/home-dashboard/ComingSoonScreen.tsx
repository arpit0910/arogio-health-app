import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { useAppTheme } from '../../theme/AppearanceProvider';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { View } from "react-native";
import { AppScreen, useAppStyles } from "../../components/app/AppScreen";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";

export function ComingSoonScreen({
  title,
  icon = "heart",
  back = false,
}: {
  title: string;
  icon?: AppIconName;
  back?: boolean;
}) {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const a = useAppStyles();
  const t = useAppTheme();

  return (
    <AppScreen back={back}>
      <View style={{ gap: 14, paddingTop: 48, alignItems: "center" }}>
        <AppIcon name={icon} size={40} />
        <Text accessibilityRole="header" style={a.title}>
          {tr(title)}
        </Text>
        <Text style={[a.sectionTitle, { color: t.teal }]}>{tr("Coming soon")}</Text>
        <Text style={[a.subtitle, { textAlign: "center" }]}>
          {tr("We're working on this feature. You can continue managing your profile and health preferences.")}</Text>
        <Button title={tr("Go to daily care")} onPress={() => router.navigate('/health')} />
      </View>
    </AppScreen>
  );
}
