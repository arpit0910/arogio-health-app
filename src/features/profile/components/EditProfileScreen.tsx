import { useAppTheme, usePalette } from '../../../theme/AppearanceProvider';
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useAuth } from "../../auth/context/AuthContext";
import { updateProfileSchema } from "../../auth/types";
import { FormError } from "../../auth/components/AuthPrimitives";
import { AppScreen, useAppStyles } from "../../../components/app/AppScreen";
import { Avatar } from "../../../components/app/Avatar";
import { TouchTarget } from "../../../components/ui/TouchTarget";

import { convertMeasurement, genders, validatePersonal } from "../model";
import {
  formatBirthday,
  profileDraft,
  profilePhoto,
} from "../profileViewModel";
import { ProfileBirthDatePicker } from "./ProfileBirthDatePicker";
import { UnitSelector } from "./ProfilePrimitives";
import { ProfileInput } from "./ProfileInput";

export function EditProfileScreen() {
  const a = useAppStyles();
  const t = useAppTheme();
  const colors = usePalette();
  const s = useStyles();

  const { user, updateProfile, isSubmitting } = useAuth();
  const [draft, setDraft] = useState(() => profileDraft(user!));
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [photo, setPhoto] = useState(() =>
    user ? profilePhoto(user) : undefined,
  );
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"date" | null>(null);
  const set = (key: keyof typeof draft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  };
  const choosePhoto = async () => {
    if (photoBusy || isSubmitting) return;
    setError(null);
    setPhotoBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const image = result.assets[0];
      const side = Math.min(image.width, image.height);
      const context = ImageManipulator.manipulate(image.uri);
      context
        .crop({
          originX: Math.floor((image.width - side) / 2),
          originY: Math.floor((image.height - side) / 2),
          width: side,
          height: side,
        })
        .resize({ width: 256, height: 256 });
      const rendered = await context.renderAsync();
      const encoded = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.75,
        base64: true,
      });
      if (!encoded.base64 || encoded.base64.length > 213000)
        throw new Error(
          "This photo is too large. Please choose another photo.",
        );
      setPhoto("data:image/jpeg;base64," + encoded.base64);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to open photos. Please try again.",
      );
    } finally {
      setPhotoBusy(false);
    }
  };
  const save = async () => {
    if (isSubmitting || photoBusy) return;
    const personalError = validatePersonal(draft);
    if (personalError) {
      setError(personalError);
      return;
    }
    const parsed = updateProfileSchema.safeParse({
      fullName: fullName.trim(),
      dateOfBirth: draft.dateOfBirth,
      ...(draft.gender ? { gender: draft.gender } : {}),
      location: draft.location.trim(),
      weightValue: Number(draft.weightValue),
      weightUnit: draft.weightUnit,
      heightValue: Number(draft.heightValue),
      heightUnit: draft.heightUnit,
      ...(photo && photo !== profilePhoto(user!) ? { photo } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    Keyboard.dismiss();
    setError(null);
    try {
      await updateProfile(parsed.data);
      router.dismissTo("/profile");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save changes. Please try again.",
      );
    }
  };
  return (
    <AppScreen back title="Edit Profile">
      <View style={s.form}>
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          disabled={photoBusy || isSubmitting}
          onPress={() => void choosePhoto()}
          style={s.avatar}
        >
          <Avatar photo={photo} size={106} camera />
          {photoBusy && (
            <ActivityIndicator
              accessibilityLabel="Preparing photo"
              color={t.teal}
            />
          )}
        </TouchTarget>
        <ProfileInput
          label="Full name"
          icon="user"
          value={fullName}
          placeholder="Enter your full name"
          maxLength={100}
          editable={!isSubmitting}
          onChangeText={(v) => {
            setFullName(v);
            setError(null);
          }}
        />
        <ProfileInput
          label="Date of birth"
          icon="calendar"
          value={draft.dateOfBirth ? formatBirthday(draft.dateOfBirth) : ""}
          placeholder="Select your date of birth"
          editable={!isSubmitting}
          onPress={() => {
            Keyboard.dismiss();
            setDialog("date");
          }}
        />
        <View style={s.genderGroup}>
          <Text style={a.sectionTitle}>Gender</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Gender" style={s.genderGroup}>
            {genders.map((option) => <TouchTarget key={option.value}
              accessibilityRole="radio" accessibilityLabel={option.label}
              accessibilityState={{ checked: draft.gender === option.value, disabled: isSubmitting }}
              disabled={isSubmitting} onPress={() => set("gender", option.value)}
              style={[s.genderOption, draft.gender === option.value && s.genderSelected]}>
              <Text style={[s.genderText, draft.gender === option.value && s.genderSelectedText]}>{option.label}</Text>
            </TouchTarget>)}
          </View>
        </View>
        <ProfileInput
          label="Location"
          icon="location"
          value={draft.location}
          placeholder="Enter your city"
          editable={!isSubmitting}
          onChangeText={(value) => set('location', value)}
        />
        <Text accessibilityRole="header" style={a.sectionTitle}>
          Body details
        </Text>
        <View style={s.body}>
          <View style={s.measurement}>
            <ProfileInput
              label="Weight"
              icon="weight"
              value={draft.weightValue}
              placeholder="Weight"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
              suffix={draft.weightUnit === "lb" ? "lbs" : "kg"}
              onChangeText={(v) => set("weightValue", v)}
            />
            <UnitSelector
              units={["kg", "lbs"]}
              value={draft.weightUnit === "lb" ? "lbs" : "kg"}
              onChange={(v) => {
                if (isSubmitting) return;
                const unit = v === "lbs" ? "lb" : "kg";
                if (unit !== draft.weightUnit) {
                  set(
                    "weightValue",
                    convertMeasurement(
                      draft.weightValue,
                      unit === "lb" ? 2.20462262 : 0.45359237,
                    ),
                  );
                  set("weightUnit", unit);
                }
              }}
            />
          </View>
          <View style={s.measurement}>
            <ProfileInput
              label="Height"
              icon="height"
              value={draft.heightValue}
              placeholder="Height"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
              suffix={draft.heightUnit === "in" ? "inch" : "cm"}
              onChangeText={(v) => set("heightValue", v)}
            />
            <UnitSelector
              units={["cm", "inch"]}
              value={draft.heightUnit === "in" ? "inch" : "cm"}
              onChange={(v) => {
                if (isSubmitting) return;
                const unit = v === "inch" ? "in" : "cm";
                if (unit !== draft.heightUnit) {
                  set(
                    "heightValue",
                    convertMeasurement(
                      draft.heightValue,
                      unit === "in" ? 1 / 2.54 : 2.54,
                    ),
                  );
                  set("heightUnit", unit);
                }
              }}
            />
          </View>
        </View>
        <FormError message={error} />
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Save Changes"
          accessibilityState={{ busy: isSubmitting }}
          disabled={isSubmitting || photoBusy}
          onPress={() => void save()}
          style={a.button}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={a.buttonText}>Save Changes</Text>
          )}
        </TouchTarget>
      </View>
      {dialog === "date" && (
        <ProfileBirthDatePicker
          value={draft.dateOfBirth}
          onSelect={(v) => {
            set("dateOfBirth", v);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </AppScreen>
  );
}
const useStyles = () => {
  const t = useAppTheme();
  const colors = usePalette();
return StyleSheet.create({
  genderGroup: { gap: 8 },
  genderOption: { minHeight: 52, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: t.border },
  genderSelected: { backgroundColor: t.teal, borderColor: t.teal },
  genderText: { color: t.ink, fontFamily: t.fonts.medium, fontSize: 16 },
  genderSelectedText: { color: colors.onPrimary },
  form: { gap: 18, paddingBottom: 20 },
  avatar: {
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: -4,
  },
  body: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  measurement: { flex: 1, gap: 11, minWidth: 160 },
});
};

