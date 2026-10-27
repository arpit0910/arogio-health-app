import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { AppScreen, appStyles as a } from "../../../components/app/AppScreen";
import { Avatar } from "../../../components/app/Avatar";
import { AppIcon, type AppIconName } from "../../../components/app/AppIcon";
import { TouchTarget } from "../../../components/ui/TouchTarget";
import { appTheme as t } from "../../../theme/appTheme";
import {
  ageLabel,
  formatBirthday,
  genderLabel,
  profileDraft,
  profileName,
  profilePhoto,
} from "../profileViewModel";
import { accountGoals } from "../profileOptions";

export function AccountProfileScreen() {
  const { user } = useAuth();
  if (!user) return null;
  const draft = profileDraft(user);
  const goals = accountGoals.filter((goal) =>
    draft.healthGoals.includes(goal.value),
  );
  const edit = () => router.push("/edit-profile");
  return (
    <AppScreen>
      <View style={a.sectionHeader}>
        <Text accessibilityRole="header" style={a.title}>
          Profile
        </Text>
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push("/settings")}
          style={s.settings}
        >
          <AppIcon name="settings" />
        </TouchTarget>
      </View>
      <Text style={a.subtitle}>
        Manage your personal information{"\n"}and health preferences.
      </Text>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={edit}
        style={[a.card, s.identity]}
      >
        <Avatar photo={profilePhoto(user)} size={82} />
        <View style={s.flex}>
          <Text style={s.name}>{profileName(user)}</Text>
          <Text style={s.demographic}>
            {[
              ageLabel(draft.dateOfBirth),
              draft.gender ? genderLabel(draft.gender) : "",
            ]
              .filter(Boolean)
              .join("  •  ") || "Add your personal details"}
          </Text>
        </View>
        <AppIcon name="right" size={18} color={t.muted} />
      </TouchTarget>
      <View style={a.section}>
        <SectionHeader title="Personal Details" onEdit={edit} />
        <View style={[a.card, s.details]}>
          {(
            [
              {
                label: "Date of birth",
                value: formatBirthday(draft.dateOfBirth),
                icon: "calendar",
              },
              {
                label: "Gender",
                value: genderLabel(draft.gender),
                icon: "user",
              },
              {
                label: "Location",
                value: draft.location || "Not added",
                icon: "location",
              },
            ] as { label: string; value: string; icon: AppIconName }[]
          ).map((row, i) => (
            <TouchTarget
              key={row.label}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${row.label.toLowerCase()}`}
              onPress={edit}
              style={[s.detailRow, i > 0 && s.border]}
            >
              <AppIcon name={row.icon} size={25} />
              <View style={s.flex}>
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailValue}>{row.value}</Text>
              </View>
              <AppIcon name="right" size={16} color={t.muted} />
            </TouchTarget>
          ))}
        </View>
      </View>
      <View style={a.section}>
        <SectionHeader title="Body Details" onEdit={edit} />
        <View style={s.bodyRow}>
          {(
            [
              {
                label: "Weight",
                value: user.weightValue
                  ? `${user.weightValue} ${user.weightUnit === "lb" ? "lbs" : "kg"}`
                  : "Not added",
                icon: "weight",
              },
              {
                label: "Height",
                value: user.heightValue
                  ? `${user.heightValue} ${user.heightUnit === "in" ? "inch" : "cm"}`
                  : "Not added",
                icon: "height",
              },
              {
                label: "BMI",
                value: user.bmi?.toFixed(1) ?? "—",
                icon: "trend",
              },
            ] as { label: string; value: string; icon: AppIconName }[]
          ).map((item) => (
            <TouchTarget
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={`Edit body details. ${item.label}: ${item.value}`}
              onPress={edit}
              style={s.bodyCard}
            >
              <View style={s.metric}>
                <AppIcon name={item.icon} size={20} />
                <Text style={s.metricValue}>{item.value}</Text>
              </View>
              <Text style={s.metricLabel}>{item.label}</Text>
            </TouchTarget>
          ))}
        </View>
      </View>
      <View style={a.section}>
        <SectionHeader
          title="Health Goals"
          onEdit={() => router.push("/edit-health-goals")}
        />
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Edit health goals"
          onPress={() => router.push("/edit-health-goals")}
          style={s.goal}
        >
          <AppIcon name="goal" size={36} />
          <View style={s.flex}>
            <Text style={s.goalTitle}>
              {goals.map((goal) => goal.title).join(", ") ||
                "Choose your health goals"}
            </Text>
            <Text style={s.goalCopy}>
              {goals.length === 1
                ? goals[0].subtitle
                : "Your health priorities and preferences"}
            </Text>
          </View>
          <AppIcon name="right" size={18} color={t.muted} />
        </TouchTarget>
      </View>
    </AppScreen>
  );
}
function SectionHeader({
  title,
  onEdit,
}: {
  title: string;
  onEdit: () => void;
}) {
  return (
    <View style={a.sectionHeader}>
      <Text accessibilityRole="header" style={a.sectionTitle}>
        {title}
      </Text>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel={`Edit ${title.toLowerCase()}`}
        onPress={onEdit}
        style={{
          justifyContent: "center",
          marginVertical: -10,
          minWidth: 48,
          alignItems: "flex-end",
        }}
      >
        <Text style={a.edit}>Edit</Text>
      </TouchTarget>
    </View>
  );
}
const s = StyleSheet.create({
  settings: { width: 38, alignItems: "center", justifyContent: "center" },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 12,
    marginTop: 17,
  },
  flex: { flex: 1 },
  name: {
    fontFamily: t.fonts.bold,
    fontSize: 19,
    lineHeight: 25,
    color: t.ink,
  },
  demographic: {
    fontFamily: t.fonts.regular,
    fontSize: 13,
    color: t.muted,
    lineHeight: 20,
    marginTop: 5,
  },
  details: { paddingHorizontal: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 10,
    minHeight: 55,
  },
  border: { borderTopWidth: 1, borderColor: "#EFF1F6" },
  detailLabel: { fontFamily: t.fonts.regular, color: t.muted, fontSize: 11.5 },
  detailValue: {
    fontFamily: t.fonts.medium,
    color: t.ink,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  bodyRow: { flexDirection: "row", gap: 10 },
  bodyCard: {
    flex: 1,
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 9,
    backgroundColor: "#F1FAF7",
    borderWidth: 1,
    borderColor: "#DDF1EB",
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  metricValue: { fontFamily: t.fonts.semibold, fontSize: 13, color: t.ink },
  metricLabel: { fontFamily: t.fonts.regular, fontSize: 12, color: t.muted },
  goal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    backgroundColor: "#EAF8F4",
    borderRadius: 17,
    padding: 16,
    minHeight: 70,
  },
  goalTitle: {
    fontFamily: t.fonts.semibold,
    color: t.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  goalCopy: {
    fontFamily: t.fonts.regular,
    color: t.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
