import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  healthSummary,
  comparisonCopy,
} from "../src/features/health-sync/insights.ts";
import {
  referralLink,
  referralMessage,
  normalizeInviteCode,
  validInviteCode,
} from "../src/features/referrals/model.ts";
import { registerSchema, safeUserSchema } from "../src/features/auth/types.ts";
import type { HealthSnapshot } from "../src/features/health-sync/model.ts";
const snapshot: HealthSnapshot = {
  syncedAt: "2026-10-29T08:00:00Z",
  granted: ["Steps"],
  latestWeight: null,
  failed: [],
  days: [null, 0, 6000, 3000].map((value, i) => ({
    day: `2026-10-${26 + i}`,
    readings: { Steps: { value, sources: ["fixture"] } },
  })),
};
describe("Health comparisons", () => {
  it("excludes the partial current day and missing days but keeps a real zero", () => {
    const summary = healthSummary(snapshot, "Steps", "2026-10-29");
    assert.equal(summary.recorded, 3);
    assert.equal(summary.completed, 2);
    assert.equal(summary.average, 3000);
    assert.equal(summary.comparison?.difference, 6000);
    assert.equal(summary.comparison?.percent, null);
    assert.match(
      comparisonCopy(snapshot, "Steps", "2026-10-29"),
      /28 Oct.*6,000 higher.*27 Oct/,
    );
  });
  it("does not fabricate comparisons for absent readings", () => {
    const summary = healthSummary(snapshot, "HeartRate", "2026-10-29");
    assert.equal(summary.average, null);
    assert.equal(summary.comparison, null);
    assert.match(
      comparisonCopy(snapshot, "HeartRate", "2026-10-29"),
      /Two completed days/,
    );
  });
});
describe("Referral links and signup", () => {
  it("normalizes codes and creates links only on the approved domain", () => {
    const code = normalizeInviteCode([" a1b2c3d4e5f6 ", "ignored"]);
    assert.equal(code, "A1B2C3D4E5F6");
    assert.equal(validInviteCode(code), true);
    assert.equal(referralLink(code), "https://arogio.com/invite/A1B2C3D4E5F6");
    assert.match(referralMessage(code), /A1B2C3D4E5F6/);
    assert.throws(() => referralLink("https://evil.test"), /not available/);
  });
  it("accepts optional or normalized referral codes and preserves server referral fields", () => {
    const input = {
      email: "friend@example.test",
      password: "PassWord123",
      referralCode: " a1b2c3d4e5f6 ",
    };
    assert.equal(registerSchema.parse(input).referralCode, "A1B2C3D4E5F6");
    assert.equal(
      registerSchema.safeParse({ ...input, referralCode: "short" }).success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({ email: input.email, password: input.password })
        .success,
      true,
    );
    assert.equal(
      safeUserSchema.parse({
        id: "fixture",
        status: "active",
        referralCode: "A1B2C3D4E5F6",
        hasReferrer: true,
      }).hasReferrer,
      true,
    );
  });
});
