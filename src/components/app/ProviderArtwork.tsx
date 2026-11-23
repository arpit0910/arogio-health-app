import { useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePalette } from "../../theme/AppearanceProvider";
import type { CareEntry } from "../../features/care-directory/api";
import { providerImageUrl } from "../../features/care-directory/providerCatalog";
import { AppIcon } from "./AppIcon";

export function ProviderArtwork({
  entry,
  style,
}: {
  entry: CareEntry;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette(),
    [failed, setFailed] = useState<string>();
  const uri = providerImageUrl(entry.imageUrl);
  return (
    <View style={[s.frame, { backgroundColor: c.mintSurface }, style]}>
      <AppIcon
        name={
          entry.kind === "doctor"
            ? "stethoscope"
            : entry.kind === "medicine"
              ? "medicalCase"
              : "hospital"
        }
        color={c.primary}
        size={30}
      />
      {uri && failed !== uri && (
        <Image
          source={{ uri }}
          resizeMode="cover"
          accessible={Boolean(entry.imageAlt)}
          accessibilityLabel={entry.imageAlt}
          onError={() => setFailed(uri)}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  frame: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
