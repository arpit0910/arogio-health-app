export const activities = [
  { value: 'sedentary', title: 'Sedentary', subtitle: 'Little to no exercise', icon: 'sedentary' },
  { value: 'lightly_active', title: 'Lightly active', subtitle: 'Light exercise 1\u20133 days/week', icon: 'activity' },
  { value: 'moderately_active', title: 'Moderately active', subtitle: 'Exercise 3\u20135 days/week', icon: 'activity' },
  { value: 'very_active', title: 'Very active', subtitle: 'Exercise 6+ days/week', icon: 'fitness' },
];
export const goals = [
  { value: 'weight_management', title: 'Weight Management', subtitle: 'Lose, gain or maintain weight', icon: 'management' },
  { value: 'fitness_activity', title: 'Fitness & Activity', subtitle: 'Be more active and build strength', icon: 'activity' },
  { value: 'better_eating', title: 'Better Eating Habits', subtitle: 'Make healthier food choices', icon: 'food' },
  { value: 'improve_sleep', title: 'Improve Sleep', subtitle: 'Get better rest and more energy', icon: 'sleep' },
  { value: 'manage_stress', title: 'Manage Stress', subtitle: 'Feel calmer and more balanced', icon: 'stress' },
];
export const genders = [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }, { value: 'other', label: 'Other' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' }];
export type SetupDraft = {
  dateOfBirth: string; weightValue: string; weightUnit: 'kg' | 'lb'; heightValue: string; heightUnit: 'cm' | 'in';
  activityLevel: string; healthGoals: string[]; gender: string; location: string; referralSource: string;
  healthReminders: boolean; tipsAndInsights: boolean; productUpdates: boolean;
};
export function validBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date() && date.getUTCFullYear() >= 1900;
}
export function validatePersonal(draft: SetupDraft): string | null {
  if (!validBirthDate(draft.dateOfBirth)) return 'Enter a valid date of birth in the past.';
  const weight = Number(draft.weightValue) * (draft.weightUnit === 'lb' ? 0.45359237 : 1);
  const height = Number(draft.heightValue) * (draft.heightUnit === 'in' ? 2.54 : 1);
  if (!Number.isFinite(weight) || weight < 2 || weight > 500) return 'Enter a weight between 2 and 500 kg (or its equivalent in lbs).';
  if (!Number.isFinite(height) || height < 50 || height > 300) return 'Enter a height between 50 and 300 cm (or its equivalent in inches).';
  return null;
}
export function convertMeasurement(value: string, factor: number) {
  return value && Number.isFinite(Number(value)) ? String(Math.round(Number(value) * factor * 10) / 10) : value;
}
