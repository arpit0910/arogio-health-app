import { usePalette } from '../../../theme/AppearanceProvider';
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { updateProfileSchema } from "../../auth/types";
import { FormError } from "../../auth/components/AuthPrimitives";
import { AppScreen, useAppStyles } from "../../../components/app/AppScreen";
import { TouchTarget } from "../../../components/ui/TouchTarget";
import { activities } from "../model";
import { profileDraft } from "../profileViewModel";
import { accountGoals, primaryGoals } from "../profileOptions";
import { ChoiceCard } from "./ProfilePrimitives";
import { ProfilePreferences } from './ProfilePreferences';

export function EditHealthGoalsScreen() {
  const colors = usePalette();
  const a = useAppStyles();

  const { user, updateProfile, isSubmitting } = useAuth();
  const [draft, setDraft] = useState(() => profileDraft(user!));
  const [error, setError] = useState<string | null>(null);
  const options = accountGoals.filter(
    (goal) =>
      primaryGoals.some(option => option.value === goal.value) ||
      draft.healthGoals.includes(goal.value),
  );
  const save = async () => {
    if (isSubmitting) return;
    const parsed = updateProfileSchema.safeParse({
      healthGoals: draft.healthGoals,
      activityLevel: draft.activityLevel,
      healthReminders: draft.healthReminders,
      tipsAndInsights: draft.tipsAndInsights,
      productUpdates: draft.productUpdates,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    try {
      await updateProfile(parsed.data);
      router.dismissTo("/profile");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save preferences. Please try again.",
      );
    }
  };
  return (
    <AppScreen back title="Goals & preferences">
      <View style={{ gap: 12, paddingBottom: 20 }}>
        <Text accessibilityRole="header" style={a.sectionTitle}>
          Health Goals
        </Text>
        <Text style={a.subtitle}>
          Select your primary health goals. You can choose more than one.
        </Text>
        {options.map((goal) => (
          <ChoiceCard
            key={goal.value}
            {...goal}
            multiple
            selected={draft.healthGoals.includes(goal.value)}
            onPress={
              isSubmitting
                ? undefined
                : () => {
                    setError(null);
                    setDraft((d) => ({
                      ...d,
                      healthGoals: d.healthGoals.includes(goal.value)
                        ? d.healthGoals.filter((v) => v !== goal.value)
                        : [...d.healthGoals, goal.value],
                    }));
                  }
            }
          />
        ))}
        <Text
          accessibilityRole="header"
          style={[a.sectionTitle, { marginTop: 20 }]}
        >
          Activity Level
        </Text>
        <Text style={a.subtitle}>Choose how active you are in daily life.</Text>
        <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
          {activities.map((activity) => (
            <ChoiceCard
              key={activity.value}
              {...activity}
              selected={draft.activityLevel === activity.value}
              onPress={
                isSubmitting
                  ? undefined
                  : () => {
                      setDraft((d) => ({
                        ...d,
                        activityLevel: activity.value,
                      }));
                      setError(null);
                    }
              }
            />
          ))}
        </View>
        <View style={{ gap: 12, marginTop: 24 }}><ProfilePreferences values={draft} disabled={isSubmitting} onChange={(key, value) => { setDraft(current => ({ ...current, [key]: value })); setError(null); }} /></View>
        <FormError message={error} />
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Save Changes"
          disabled={isSubmitting}
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
    </AppScreen>
  );
}
