import type { SafeUser } from "../auth/types";
import { genders, type SetupDraft, validBirthDate } from "./model.ts";

export function profileDraft(user: SafeUser): SetupDraft {
  const p = user.profileSetup ?? {};
  return {
    dateOfBirth: String(p.dateOfBirth ?? ""),
    gender: String(p.gender ?? ""),
    location: String(p.location ?? ""),
    weightValue: String(user.weightValue ?? ""),
    weightUnit: user.weightUnit ?? "kg",
    heightValue: String(user.heightValue ?? ""),
    heightUnit: user.heightUnit ?? "cm",
    activityLevel: String(p.activityLevel ?? ""),
    healthGoals: Array.isArray(p.healthGoals)
      ? (p.healthGoals as string[])
      : [],
    referralSource: String(p.referralSource ?? ""),
    healthReminders: p.healthReminders !== false,
    tipsAndInsights: p.tipsAndInsights !== false,
    productUpdates: p.productUpdates === true,
  };
}
export function formatBirthday(value: string): string {
  return validBirthDate(value)
    ? new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Not added";
}
export function ageLabel(value: string, today = new Date()): string {
  if (!validBirthDate(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const age =
    today.getFullYear() -
    year -
    (today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
      ? 1
      : 0);
  return `${age} years`;
}
export const genderLabel = (value: string) =>
  genders.find((g) => g.value === value)?.label ?? "Not added";
export const profilePhoto = (user: SafeUser) =>
  typeof user.profileSetup?.photo === "string"
    ? user.profileSetup.photo
    : undefined;
export const profileName = (user: SafeUser) =>
  user.fullName?.trim() || user.username || "Your profile";
