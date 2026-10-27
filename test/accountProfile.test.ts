import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ageLabel,
  profileDraft,
  profileName,
} from "../src/features/profile/profileViewModel.ts";
import {
  updateProfileSchema,
  type SafeUser,
} from "../src/features/auth/types.ts";
const user = {
  id: "test",
  status: "active",
  fullName: "Arpit Vijay",
  heightValue: 170,
  heightUnit: "cm",
  weightValue: 70,
  weightUnit: "kg",
  profileSetup: {
    dateOfBirth: "2001-03-17",
    gender: "male",
    healthGoals: ["lose_weight"],
    activityLevel: "lightly_active",
    healthReminders: false,
  },
} as SafeUser;
describe("Account profile", () => {
  it("calculates age across the birthday boundary and preserves existing setup preferences", () => {
    assert.equal(ageLabel("2001-03-17", new Date(2026, 2, 16)), "24 years");
    assert.equal(ageLabel("2001-03-17", new Date(2026, 2, 17)), "25 years");
    assert.equal(ageLabel(""), "");
    assert.equal(profileDraft(user).healthReminders, false);
    assert.deepEqual(profileDraft(user).healthGoals, ["lose_weight"]);
    assert.equal(profileName(user), "Arpit Vijay");
  });
  it("validates atomic profile edits and rejects empty goals, future dates and invalid photo URLs", () => {
    assert.equal(
      updateProfileSchema.safeParse({
        fullName: "Arpit Vijay",
        dateOfBirth: "2001-03-17",
        location: "Jaipur",
        healthGoals: ["lose_weight"],
        activityLevel: "lightly_active",
      }).success,
      true,
    );
    for (const input of [
      { healthGoals: [] },
      { dateOfBirth: "2999-01-01" },
      { photo: "https://untrusted.example/avatar.svg" },
      { fullName: "A" },
    ])
      assert.equal(updateProfileSchema.safeParse(input).success, false);
  });
});
