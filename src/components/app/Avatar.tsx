import { useTranslation } from "../../localization/LanguageProvider";
import { Image, StyleSheet, View } from "react-native";
import { AppIcon } from "./AppIcon";
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
  return (
    <View style={{ width: size, height: size }}>
      <Image
        accessibilityLabel={tr("Profile photo")}
        source={
          photo ? { uri: photo } : require("../../../assets/home/avatar.png")
        }
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
      {camera && (
        <View style={s.camera}>
          <AppIcon name="camera" color="#FFFFFF" size={18} />
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
