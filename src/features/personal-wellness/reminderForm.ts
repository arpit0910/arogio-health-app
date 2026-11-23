import { localDay, validDay, type Medicine } from "./domain.ts";

export function newReminder(id: string): Medicine {
  return {
    id,
    name: "",
    notes: "",
    enabled: true,
    startDate: localDay(),
    form: "Tablet",
    unit: "mg",
    strength: "",
    doses: [{ time: "", amount: "" }],
  };
}

/** Each step names the exact field to fix, without clearing the user's work. */
export function reminderStepError(
  draft: Medicine,
  step: number,
): string | null {
  if (!draft.name.trim()) return "Write the medicine name to continue.";
  if (draft.name.trim().length > 80)
    return "Keep the medicine name to 80 characters or fewer.";
  if (step === 0) return null;
  if (!draft.doses.length) return "Add at least one reminder time.";
  for (let i = 0; i < draft.doses.length; i++) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.doses[i].time))
      return `Choose a time for reminder ${i + 1}.`;
    if (!draft.doses[i].amount.trim())
      return `Write the amount for reminder ${i + 1}, as shown on the label.`;
  }
  if (new Set(draft.doses.map((d) => d.time)).size !== draft.doses.length)
    return "Two reminders have the same time. Change one or remove the extra reminder.";
  if (draft.recurrence === "weekly" && !draft.weekdays?.length)
    return "Choose at least one day of the week.";
  if (
    draft.recurrence === "cycle" &&
    ![draft.cycleOnDays, draft.cycleOffDays].every(
      (n) => n != null && Number.isInteger(n) && n >= 1 && n <= 365,
    )
  )
    return "Enter the number of medicine days and pause days from the prescription.";
  if (step === 1) return null;
  if (draft.startDate && !validDay(draft.startDate))
    return "Choose a valid start date.";
  if (
    draft.endDate &&
    (!validDay(draft.endDate) ||
      draft.endDate < (draft.startDate ?? localDay()))
  )
    return "Choose an end date on or after the start date.";
  if (draft.stock != null && (!Number.isFinite(draft.stock) || draft.stock < 0))
    return "Enter how much medicine is left, using a number of zero or more.";
  if (
    draft.stock != null &&
    (!Number.isFinite(draft.lowStockThreshold ?? 4) ||
      (draft.lowStockThreshold ?? 4) < 0)
  )
    return "Enter a refill level of zero or more.";
  return null;
}

export function recurrenceLabel(draft: Medicine) {
  return draft.recurrence === "weekly"
    ? "On selected days"
    : draft.recurrence === "cycle"
      ? "Medicine days, then a pause"
      : draft.recurrence === "sos"
        ? "Only when needed"
        : "Every day";
}

export function reminderDateLabel(day: string, locale: string) {
  return validDay(day)
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(`${day}T12:00:00Z`))
    : day;
}
