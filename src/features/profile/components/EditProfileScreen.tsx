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
import { AppScreen, appStyles as a } from "../../../components/app/AppScreen";
import { Avatar } from "../../../components/app/Avatar";
import { TouchTarget } from "../../../components/ui/TouchTarget";
import { appTheme as t } from "../../../theme/appTheme";
import { convertMeasurement, genders, validatePersonal } from "../model";
import {
  formatBirthday,
  genderLabel,
  profileDraft,
  profilePhoto,
} from "../profileViewModel";
import { ProfileBirthDatePicker } from "./ProfileBirthDatePicker";
import { ProfileDialog, UnitSelector } from "./ProfilePrimitives";
import { ProfileInput } from "./ProfileInput";

export function EditProfileScreen() {
  const { user, updateProfile, isSubmitting } = useAuth();
  const [draft, setDraft] = useState(() => profileDraft(user!));
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [photo, setPhoto] = useState(() =>
    user ? profilePhoto(user) : undefined,
  );
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"date" | "gender" | "location" | null>(
    null,
  );
  const [dialogValue, setDialogValue] = useState("");
  const set = (key: keyof typeof draft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  };
  const open = (key: "gender" | "location") => {
    Keyboard.dismiss();
    setDialogValue(draft[key]);
    setDialog(key);
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
        <ProfileInput
          label="Gender"
          icon="user"
          value={draft.gender ? genderLabel(draft.gender) : ""}
          placeholder="Select your gender"
          editable={!isSubmitting}
          onPress={() => open("gender")}
        />
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
            <ActivityIndicator color="#FFFFFF" />
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
      {(dialog === "gender" || dialog === "location") && (
        <ProfileDialog
          title={dialog === "gender" ? "Gender" : "Location"}
          subtitle={
            dialog === "location"
              ? "Enter your city and state."
              : "Choose the option you prefer."
          }
          placeholder="Enter your city and state"
          value={dialogValue}
          onChange={setDialogValue}
          options={dialog === "gender" ? genders : undefined}
          onClose={() => setDialog(null)}
          onSave={() => {
            set(dialog, dialogValue.trim());
            setDialog(null);
          }}
        />
      )}
    </AppScreen>
  );
}
const s = StyleSheet.create({
  form: { gap: 18, paddingBottom: 20 },
  avatar: {
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: -4,
  },
  body: { flexDirection: "row", gap: 20 },
  measurement: { flex: 1, gap: 11, minWidth: 0 },
});
