import { useTranslation } from "../../localization/LanguageProvider";
import { Platform, Text, View } from "react-native";
import { usePhoneSteps } from "./PhoneStepsProvider";
import { useCareStyles } from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import { AppIcon } from "../../components/app/AppIcon";
export function PhoneTrackingControl() {
  const { t: tr } = useTranslation();
  const phone = usePhoneSteps(),
    colors = usePalette(),
    c = useCareStyles();
  return (
    <View
      style={{
        paddingVertical: 20,
        gap: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AppIcon name="device" size={22} />
        <Text style={[c.title, { flex: 1 }]}>{tr("Count steps with this phone")}</Text>
      </View>
      <Text style={c.text}>
        {tr(Platform.OS === 'android' ? 'No health app needed. On supported Android phones, counting continues when you close Arogio, with a step-counting notification. Force-stop or battery restrictions can interrupt counting.' : 'No health app needed. On supported phones, Arogio counts steps while it is open.')} {tr(" You can turn counting off in Settings.")}</Text>
      <Text
        accessibilityLiveRegion="polite"
        style={[c.text, { color: colors.ink }]}
      >
        {tr(phone.status)}
      </Text>
      {!phone.enabled && <Text style={c.text}>{tr("Manage access once in Settings. You can enter totals here without a step sensor.")}</Text>}
    </View>
  );
}
