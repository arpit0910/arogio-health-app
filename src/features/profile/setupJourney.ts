import { validatePersonal, type SetupDraft } from './model.ts';

export type SetupStep = 0 | 1 | 2;
export function resumeSetup(draft: SetupDraft): SetupStep {
  if (!draft.healthGoals.length) return 0;
  if (validatePersonal(draft)) return 1;
  return 2;
}
export function validateSetupStep(draft: SetupDraft, step: SetupStep): string | null {
  if ((step === 0 || step === 2) && !draft.healthGoals.length) return 'Choose at least one goal.';
  if (step >= 1) {
    const personal = validatePersonal(draft);
    if (personal) return personal;
  }
  if (step === 2 && !draft.activityLevel) return 'Choose the activity level that fits your routine.';
  return null;
}
export function setupPayload(draft: SetupDraft, step: SetupStep) {
  const { weightValue, heightValue, ...details } = draft;
  return {
    ...details,
    dateOfBirth: draft.dateOfBirth || undefined,
    activityLevel: draft.activityLevel || undefined,
    gender: draft.gender || undefined,
    weightUnit: weightValue ? draft.weightUnit : undefined,
    heightUnit: heightValue ? draft.heightUnit : undefined,
    ...(weightValue ? { weightValue: Number(weightValue) } : {}),
    ...(heightValue ? { heightValue: Number(heightValue) } : {}),
    // Legacy server steps let older APKs resume at the matching required task.
    step: step === 2 ? 7 : step + 1,
    complete: step === 2,
  };
}
