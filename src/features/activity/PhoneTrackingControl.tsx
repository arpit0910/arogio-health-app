import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { Platform, View } from "react-native";
import { usePhoneSteps } from "./PhoneStepsProvider";
import { useCareStyles } from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import { AppIcon } from "../../components/app/AppIcon";
import { Button } from "../../components/ui/Button";
import { localDay } from "../personal-wellness/domain";
import { useTrackingClock } from "../personal-wellness/useTrackingClock";
export function PhoneTrackingControl() {
  const { t: tr } = useTranslation();
  const phone = usePhoneSteps(),
    colors = usePalette(),
    c = useCareStyles();
  const today = phone.totals[localDay(useTrackingClock())];
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
        {tr(Platform.OS === 'android' ? 'Allow physical activity access to count steps on this phone, even when Arogio is closed. You can turn counting off here at any time.' : 'Allow motion access to count steps while Arogio is open.')}</Text>
      {phone.enabled && today != null && <Text style={c.title}>{today.toLocaleString()} {tr('phone steps today')}</Text>}
      <Text
        accessibilityLiveRegion="polite"
        style={[c.text, { color: colors.ink }]}
      >
        {tr(phone.status)}
      </Text>
      <Button title={tr(phone.enabled ? 'Turn off phone steps' : 'Turn on phone steps')} variant="secondary" disabled={!phone.ready} loading={phone.busy} onPress={() => void phone.toggle()} />
    </View>
  );
}
