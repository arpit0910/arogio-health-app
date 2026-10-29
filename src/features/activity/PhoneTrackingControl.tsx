import { Platform, Text, View } from "react-native";
import { usePhoneSteps } from "./PhoneStepsProvider";
import { useCareStyles } from "../../components/app/CareUI";
import { usePalette } from "../../theme/AppearanceProvider";
import { AppIcon } from "../../components/app/AppIcon";
import { Button } from "../../components/ui/Button";
export function PhoneTrackingControl() {
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
        <Text style={[c.title, { flex: 1 }]}>Count steps with this phone</Text>
      </View>
      <Text style={c.text}>
        No health app needed. On supported phones, Arogio counts steps while it
        is open. You can turn counting off at any time.
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        style={[c.text, { color: colors.ink }]}
      >
        {phone.status}
      </Text>
      {Platform.OS !== "web" ? (
        <Button
          title={
            phone.enabled ? "Turn off phone counting" : "Start counting steps"
          }
          variant={phone.enabled ? "secondary" : "primary"}
          loading={phone.busy}
          disabled={!phone.ready}
          onPress={() => void phone.toggle()}
        />
      ) : (
        <Text style={c.text}>
          Phone step counting is available in the installed app. You can enter
          totals here.
        </Text>
      )}
    </View>
  );
}
