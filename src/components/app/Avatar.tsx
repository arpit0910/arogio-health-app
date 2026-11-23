import { useTranslation } from "../../localization/LanguageProvider";
import { Image, StyleSheet, View } from "react-native";
import { AppIcon } from "./AppIcon";
import { usePalette } from '../../theme/AppearanceProvider';
export function Avatar({
  photo,
  size = 80,
  camera = false,
}: {
  photo?: string;
  size?: number;
  camera?: boolean;
}) {
  const { t: tr } = useTranslation();
  const c = usePalette();
  return (
    <View style={{ width: size, height: size }}>
      {photo ? <Image
        accessibilityLabel={tr("Profile photo")}
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      /> : <View accessibilityLabel={tr('Profile photo')} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.mintSurface, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="user" size={size * 0.45} color={c.primary} /></View>}
      {camera && (
        <View style={[s.camera, { backgroundColor: c.primary, borderColor: c.surface }]}>
          <AppIcon name="camera" color={c.onPrimary} size={18} />
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  camera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 18,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#008C85",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
