export function normalizeInviteCode(
  value: string | string[] | undefined,
): string {
  return (Array.isArray(value) ? value[0] : (value ?? "")).trim().toUpperCase();
}
export const validInviteCode = (code: string) => /^[A-F0-9]{12}$/.test(code);
export function referralLink(code: string): string {
  if (!validInviteCode(code))
    throw new Error("Referral code is not available.");
  return `https://arogio.com/invite/${code}`;
}
export const referralMessage = (code: string) =>
  `Join me on Arogio for everyday health and wellbeing. Use my referral code ${code} when creating your account, or during setup. ${referralLink(code)}`;
