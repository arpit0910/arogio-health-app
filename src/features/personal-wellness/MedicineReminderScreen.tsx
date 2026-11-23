import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, BackHandler, Keyboard, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Crypto from "expo-crypto";
import { AppScreen } from "../../components/app/AppScreen";
import { AccessibleText as Text } from "../../components/ui/AccessibleText";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { DocumentPhotoInput } from "../../components/ui/DocumentPhotoInput";
import { AppIcon } from "../../components/app/AppIcon";
import { useTranslation } from "../../localization/LanguageProvider";
import { colors } from "../../theme/tokens";
import { useWellness } from "./WellnessContext";
import {
  getNotificationAccess,
  openReminderSettings,
  requestReminderPermission,
} from "./notifications";
import { CalendarField } from "./CalendarField";
import { ReminderTimePicker } from "./ReminderTimePicker";
import {
  ReminderChoice,
  ReminderDisclosure,
  ReminderField,
  ReminderText,
  r,
} from "./ReminderFormUI";
import {
  newReminder,
  recurrenceLabel,
  reminderDateLabel,
  reminderStepError,
} from "./reminderForm";
import { addDays, localDay, type Medicine } from "./domain";
import { formatClock } from "../../shared/date-time";

export function MedicineReminderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    wellness = useWellness(),
    router = useRouter();
  if (
    id &&
    (!wellness.ready || !wellness.data.medicines?.some((m) => m.id === id))
  )
    return (
      <AppScreen back title="Medicine reminder">
        <View style={r.page}>
          <ReminderText title>
            {wellness.ready ? "Medicine unavailable" : "Loading medicine..."}
          </ReminderText>
          <ReminderText>
            {wellness.error || "Restoring your saved medicine details."}
          </ReminderText>
          <Button title="Try again" onPress={() => void wellness.refresh()} />
          <Button
            title="Go back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </AppScreen>
    );
  return <ReminderEditor key={id ?? "new"} />;
}
function ReminderEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    router = useRouter(),
    { t, locale } = useTranslation();
  const { data, save, busy, error: serverError } = useWellness();
  const saved = data.medicines?.find((m) => m.id === id);
  const [draft, setDraft] = useState<Medicine>(() =>
    saved
      ? { ...saved, doses: saved.doses.map((d) => ({ ...d })) }
      : newReminder(Crypto.randomUUID()),
  );
  const initial = useRef(JSON.stringify(draft)),
    expectedStock = useRef(saved?.stock ?? null);
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [notificationAccess, setNotificationAccess] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (step !== 2) return;
    let active = true;
    const check = () => {
      void getNotificationAccess()
        .then((value) => {
          if (active) setNotificationAccess(value);
        })
        .catch(() => {
          if (active) setNotificationAccess("unavailable");
        });
    };
    check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [step]);
  const lock = useRef(false),
    working = submitting || busy;
  const change = (patch: Partial<Medicine>) => {
    setDraft((value) => ({ ...value, ...patch }));
    setError("");
  };
  const toggle = (key: string) =>
    setOpen((value) => ({ ...value, [key]: !value[key] }));
  const doseChange = (
    index: number,
    patch: Partial<Medicine["doses"][number]>,
  ) =>
    change({
      doses: draft.doses.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    });
  const leave = useCallback(() => {
    if (lock.current || busy) return;
    const close = () =>
      router.canGoBack() ? router.back() : router.replace("/medicines");
    if (JSON.stringify(draft) === initial.current) {
      close();
      return;
    }
    Alert.alert(
      t("Leave without saving?"),
      t("Your changes have not been saved."),
      [
        { text: t("Keep editing"), style: "cancel" },
        { text: t("Leave"), style: "destructive", onPress: close },
      ],
    );
  }, [busy, draft, router, t]);
  const previous = useCallback(() => {
    if (lock.current || busy) return;
    Keyboard.dismiss();
    setError("");
    if (step > 0) setStep((value) => value - 1);
    else leave();
  }, [busy, leave, step]);
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          previous();
          return true;
        },
      );
      return () => subscription.remove();
    }, [previous]),
  );
  function next() {
    const message = reminderStepError(draft, step);
    if (message) {
      setError(message);
      return;
    }
    Keyboard.dismiss();
    setError("");
    setStep((value) => value + 1);
  }
  async function submit() {
    if (lock.current || busy) return;
    const message = reminderStepError(draft, 2);
    if (message) {
      setError(message);
      if (reminderStepError(draft, 0)) setStep(0);
      else if (reminderStepError(draft, 1)) setStep(1);
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const enabled =
        draft.enabled && draft.recurrence !== "sos"
          ? await requestReminderPermission(false)
          : false;
      const { id: medicineId, ...body } = draft;
      if (
        await save(`medicines/${medicineId}`, {
          ...body,
          name: body.name.trim(),
          expectedStock: expectedStock.current,
          enabled,
        })
      ) {
        const done = () =>
          router.canGoBack() ? router.back() : router.replace("/medicines");
        if (draft.enabled && draft.recurrence !== "sos" && !enabled)
          Alert.alert(
            t("Medicine saved"),
            t("Notifications are off. You can still log doses in Arogio."),
            [{ text: t("Done"), onPress: done }],
          );
        else done();
      } else
        setError(
          "Could not save your reminder. Your changes are still here. Try again.",
        );
    } catch {
      setError(
        "Could not save your reminder. Your changes are still here. Try again.",
      );
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }
  const footer = (
    <View style={r.footer}>
      {!!(error || serverError) && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={r.error}
        >
          {t(error || serverError || "")}
        </Text>
      )}
      <Button
        size="large"
        title={
          step === 2
            ? "Save reminder"
            : step === 0
              ? "Continue to times"
              : "Check my reminder"
        }
        loading={working}
        onPress={step === 2 ? () => void submit() : next}
      />
      {step > 0 && (
        <Button
          size="large"
          title="Back"
          variant="secondary"
          disabled={working}
          onPress={previous}
        />
      )}
    </View>
  );
  return (
    <AppScreen
      back
      title={saved ? "Edit reminder" : "Add medicine"}
      onBack={previous}
      scrollKey={step}
      footer={footer}
      action={
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel={t("Cancel setup")}
          disabled={working}
          onPress={leave}
          style={{ paddingHorizontal: 8, justifyContent: "center" }}
        >
          <Text style={[r.hint, { color: colors.primary }]}>{t("Cancel")}</Text>
        </TouchTarget>
      }
    >
      <View
        style={[r.page, { width: "100%", maxWidth: 480, alignSelf: "center" }]}
      >
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t("Reminder setup")}
          accessibilityValue={{
            min: 0,
            max: 3,
            now: step + 1,
            text: t(`Step ${step + 1} of 3`),
          }}
          style={{ gap: 10 }}
        >
          <Text style={r.hint}>
            {t(`Step ${step + 1} of 3`)} /{" "}
            {t(["Medicine", "Times", "Check"][step])}
          </Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: i <= step ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>
        </View>
        {step === 0 && (
          <>
            <View style={{ gap: 10 }}>
              <ReminderText title>Which medicine is this?</ReminderText>
              <ReminderText>
                Copy the name from the packet or prescription.
              </ReminderText>
            </View>
            <ReminderField
              label="Medicine name"
              placeholder="Write the medicine name"
              value={draft.name}
              onChangeText={(name) => change({ name })}
              maxLength={80}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Text style={r.hint}>
              {t(
                "For a child, a parent or caregiver should set up the reminder.",
              )}
            </Text>
            <ReminderDisclosure
              title="Read a prescription photo (optional)"
              open={!!open.scan}
              onPress={() => toggle("scan")}
            >
              <DocumentPhotoInput
                disabled={working}
                limit={1000}
                useLabel="Keep as medicine notes"
                onText={(notes) => change({ notes })}
              />
              <ReminderText>
                Check the text. Enter the medicine name above; we will not
                choose a medicine or dose.
              </ReminderText>
            </ReminderDisclosure>
            <ReminderDisclosure
              title="Medicine details (optional)"
              open={!!open.identity}
              onPress={() => toggle("identity")}
            >
              <ReminderText>What type of medicine?</ReminderText>
              <View accessibilityRole="radiogroup">
                {[
                  "Tablet",
                  "Capsule",
                  "Syrup",
                  "Drops",
                  "Inhaler",
                  "Injection",
                ].map((form) => (
                  <View key={form} style={{ marginBottom: 8 }}>
                    <ReminderChoice
                      label={form}
                      selected={(draft.form ?? "Tablet") === form}
                      onPress={() => change({ form })}
                    />
                  </View>
                ))}
              </View>
              <ReminderField
                label="Strength on the label"
                hint="Leave blank if the medicine name already includes it."
                placeholder="Copy from the label"
                value={draft.strength ?? ""}
                onChangeText={(strength) => change({ strength })}
                maxLength={30}
              />
              <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                {["mg", "ml", "mcg"].map((unit) => (
                  <ReminderChoice
                    key={unit}
                    label={unit}
                    selected={(draft.unit ?? "mg") === unit}
                    onPress={() => change({ unit })}
                  />
                ))}
              </View>
            </ReminderDisclosure>
          </>
        )}
        {step === 1 && (
          <>
            <View style={{ gap: 10 }}>
              <ReminderText title>When should we remind you?</ReminderText>
              <ReminderText>
                Use the times and amounts written on the medicine label.
              </ReminderText>
            </View>
            <View style={{ gap: 8 }}>
              <View style={{ gap: 6 }}>
                <Text style={r.label}>{t(recurrenceLabel(draft))}</Text>
                <Text style={r.hint}>
                  {t(
                    draft.recurrence === "sos"
                      ? "No automatic time reminders"
                      : "Repeat this schedule",
                  )}
                </Text>
              </View>
              <ReminderDisclosure
                title="Change which days"
                open={!!open.repeat}
                onPress={() => toggle("repeat")}
              >
                <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                  {(
                    [
                      ["daily", "Every day"],
                      ["weekly", "On selected days"],
                      ["cycle", "Medicine days, then a pause"],
                      ["sos", "Only when needed"],
                    ] as const
                  ).map(([recurrence, label]) => (
                    <ReminderChoice
                      key={recurrence}
                      label={label}
                      selected={(draft.recurrence ?? "daily") === recurrence}
                      onPress={() =>
                        change({
                          recurrence,
                          cycleOnDays: draft.cycleOnDays,
                          cycleOffDays: draft.cycleOffDays,
                        })
                      }
                    />
                  ))}
                </View>
              </ReminderDisclosure>
            </View>
            {draft.recurrence === "weekly" && (
              <View style={{ gap: 8 }}>
                <ReminderText title>Which days?</ReminderText>
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((label, i) => (
                  <ReminderChoice
                    key={label}
                    role="checkbox"
                    label={label}
                    selected={(draft.weekdays ?? []).includes(i)}
                    onPress={() =>
                      change({
                        weekdays: draft.weekdays?.includes(i)
                          ? draft.weekdays.filter((d) => d !== i)
                          : [...(draft.weekdays ?? []), i],
                      })
                    }
                  />
                ))}
              </View>
            )}
            {draft.recurrence === "cycle" && (
              <>
                <ReminderField
                  label="Days to take the medicine"
                  hint="Copy the number of days from the prescription."
                  keyboardType="number-pad"
                  value={String(draft.cycleOnDays ?? "")}
                  onChangeText={(v) => change({ cycleOnDays: Number(v) })}
                />
                <ReminderField
                  label="Days to pause before repeating"
                  keyboardType="number-pad"
                  value={String(draft.cycleOffDays ?? "")}
                  onChangeText={(v) => change({ cycleOffDays: Number(v) })}
                />
              </>
            )}
            {draft.recurrence === "sos" && (
              <ReminderText>
                These slots help you record an as-needed dose. They will not
                ring. Follow the prescription.
              </ReminderText>
            )}
            {draft.doses.map((dose, index) => (
              <View key={index} style={r.reminder}>
                <Text accessibilityRole="header" style={r.label}>
                  {t(`Reminder ${index + 1}`)}
                </Text>
                <ReminderTimePicker
                  label={
                    draft.recurrence === "sos"
                      ? "Time slot for your records"
                      : "Reminder time"
                  }
                  value={dose.time}
                  onChange={(time) => doseChange(index, { time })}
                />
                <ReminderField
                  label="Amount to take"
                  hint="Copy the exact amount and unit from the label."
                  placeholder="Amount written on the label"
                  value={dose.amount}
                  maxLength={80}
                  onChangeText={(amount) => doseChange(index, { amount })}
                />
                <ReminderDisclosure
                  title={
                    dose.meal && dose.meal !== "any"
                      ? dose.meal === "before"
                        ? "Before food"
                        : "After food"
                      : "Food instructions (optional)"
                  }
                  open={!!open[`meal${index}`]}
                  onPress={() => toggle(`meal${index}`)}
                >
                  <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                    {(
                      [
                        ["any", "No food instruction"],
                        ["before", "Before food"],
                        ["after", "After food"],
                      ] as const
                    ).map(([meal, label]) => (
                      <ReminderChoice
                        key={meal}
                        label={label}
                        selected={(dose.meal ?? "any") === meal}
                        onPress={() => doseChange(index, { meal })}
                      />
                    ))}
                  </View>
                </ReminderDisclosure>
                {draft.doses.length > 1 && (
                  <Button
                    title="Remove this time"
                    variant="secondary"
                    onPress={() =>
                      change({
                        doses: draft.doses.filter((_, i) => i !== index),
                      })
                    }
                  />
                )}
              </View>
            ))}
            <Button
              title="Add another time"
              variant="secondary"
              disabled={draft.doses.length >= 12}
              leading={<AppIcon name="clock" color={colors.primary} />}
              onPress={() =>
                change({ doses: [...draft.doses, { time: "", amount: "" }] })
              }
            />
          </>
        )}
        {step === 2 && (
          <>
            <View style={{ gap: 10 }}>
              <ReminderText title>Does this look right?</ReminderText>
              <ReminderText>
                Check this with the medicine label before saving.
              </ReminderText>
            </View>
            <View style={r.review}>
              <Text style={r.title}>{draft.name}</Text>
              {!!draft.strength && (
                <Text style={r.body}>
                  {draft.strength} {draft.unit ?? "mg"}
                </Text>
              )}
              <Text style={r.label}>{t(recurrenceLabel(draft))}</Text>
              {draft.recurrence === "weekly" && (
                <Text style={r.body}>
                  {(draft.weekdays ?? [])
                    .slice()
                    .sort()
                    .map((day) =>
                      t(
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][day],
                      ),
                    )
                    .join(", ")}
                </Text>
              )}
              {draft.recurrence === "cycle" && (
                <Text style={r.body}>
                  {t("{0} days of medicine, then {1} days of pause")
                    .replace("{0}", String(draft.cycleOnDays))
                    .replace("{1}", String(draft.cycleOffDays))}
                </Text>
              )}
              {draft.doses.map((dose, i) => (
                <View
                  key={i}
                  style={{
                    gap: 4,
                    borderTopWidth: 1,
                    borderColor: colors.border,
                    paddingTop: 16,
                  }}
                >
                  <Text style={[r.title, { color: colors.primary }]}>
                    {formatClock(dose.time)}
                  </Text>
                  <Text style={r.body}>{dose.amount}</Text>
                  {dose.meal && dose.meal !== "any" && (
                    <Text style={r.body}>
                      {t(dose.meal === "before" ? "Before food" : "After food")}
                    </Text>
                  )}
                </View>
              ))}
              <Button
                title="Change medicine"
                variant="secondary"
                onPress={() => {
                  setStep(0);
                  setError("");
                }}
              />
              <Button
                title="Change times or amounts"
                variant="secondary"
                onPress={() => {
                  setStep(1);
                  setError("");
                }}
              />
            </View>
            {draft.recurrence !== "sos" && (
              <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
                <ReminderChoice
                  label="Remind me"
                  detail="A notification at each saved time"
                  icon="bell"
                  selected={draft.enabled}
                  onPress={() => change({ enabled: true })}
                />
                <ReminderChoice
                  label="Save without notifications"
                  detail="Keep a record without an alert"
                  selected={!draft.enabled}
                  onPress={() => change({ enabled: false })}
                />
              </View>
            )}
            {draft.enabled &&
              draft.recurrence !== "sos" &&
              notificationAccess &&
              notificationAccess !== "allowed" && (
                <View
                  style={{
                    gap: 12,
                    padding: 16,
                    backgroundColor: colors.mintSurface,
                    borderRadius: 12,
                  }}
                >
                  <ReminderText>
                    Notifications are off on this phone. Turn them on to receive
                    reminders.
                  </ReminderText>
                  <Button
                    title="Open notification settings"
                    variant="secondary"
                    onPress={() =>
                      void openReminderSettings("wellness").catch(() =>
                        setError(
                          "Open Arogio notification settings on your phone to allow reminders.",
                        ),
                      )
                    }
                  />
                </View>
              )}
            <View style={{ gap: 8 }}>
              <Text style={r.label}>
                {t("Starts")}:{" "}
                {draft.startDate === localDay()
                  ? t("Today")
                  : draft.startDate
                    ? reminderDateLabel(draft.startDate, locale)
                    : t("Today")}
              </Text>
              <Text style={r.body}>
                {draft.endDate
                  ? `${t("Last day")}: ${reminderDateLabel(draft.endDate, locale)}`
                  : t("Keeps repeating until you change it")}
              </Text>
            </View>
            <ReminderDisclosure
              title="Dates and end date (optional)"
              open={!!open.dates}
              onPress={() => toggle("dates")}
            >
              <CalendarField
                mode="date"
                label="Start date"
                value={draft.startDate ?? localDay()}
                onChange={(startDate) => change({ startDate })}
              />
              <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                {[5, 7, 14, 30].map((days) => (
                  <ReminderChoice
                    key={days}
                    label={t("For {0} days").replace("{0}", String(days))}
                    selected={
                      draft.endDate ===
                      addDays(draft.startDate || localDay(), days - 1)
                    }
                    onPress={() =>
                      change({
                        startDate: draft.startDate || localDay(),
                        endDate: addDays(
                          draft.startDate || localDay(),
                          days - 1,
                        ),
                      })
                    }
                  />
                ))}
                <ReminderChoice
                  label="Until I change it"
                  selected={!draft.endDate}
                  onPress={() => change({ endDate: null })}
                />
              </View>
              <CalendarField
                mode="date"
                label="Choose a different last day"
                initialValue={draft.startDate || localDay()}
                value={draft.endDate ?? ""}
                onChange={(endDate) =>
                  change({ startDate: draft.startDate || localDay(), endDate })
                }
              />
            </ReminderDisclosure>
            <ReminderDisclosure
              title="Sound, refills and notes (optional)"
              open={!!open.more}
              onPress={() => toggle("more")}
            >
              <ReminderText>Reminder sound</ReminderText>
              <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                {(
                  [
                    ["default", "Standard sound"],
                    ["gentle", "Gentle sound"],
                    ["vibrate", "Vibration only"],
                  ] as const
                ).map(([alertType, label]) => (
                  <ReminderChoice
                    key={alertType}
                    label={label}
                    selected={(draft.alertType ?? "default") === alertType}
                    onPress={() => change({ alertType })}
                  />
                ))}
              </View>
              <Text style={r.hint}>
                {t("Your phone controls the final sound and volume.")}
              </Text>
              <ReminderChoice
                role="checkbox"
                label="Tell me when medicine is running low"
                selected={draft.stock != null}
                onPress={() =>
                  change({
                    stock: draft.stock == null ? 0 : null,
                    lowStockThreshold: draft.lowStockThreshold ?? 4,
                  })
                }
              />
              {draft.stock != null && (
                <>
                  <ReminderField
                    label="How much medicine is left?"
                    hint="Use the same unit as the amount for each reminder."
                    keyboardType="decimal-pad"
                    value={String(draft.stock)}
                    onChangeText={(v) => change({ stock: Number(v) })}
                  />
                  <ReminderField
                    label="Remind me when this much is left"
                    keyboardType="decimal-pad"
                    value={String(draft.lowStockThreshold ?? 4)}
                    onChangeText={(v) =>
                      change({ lowStockThreshold: Number(v) })
                    }
                  />
                </>
              )}
              <ReminderField
                label="Notes for this medicine"
                multiline
                maxLength={1000}
                value={draft.notes}
                onChangeText={(notes) => change({ notes })}
              />
            </ReminderDisclosure>
            <Text style={r.hint}>
              {t(
                "For a child, a parent or caregiver should check and save this reminder.",
              )}
            </Text>
            {saved && (
              <Button
                title="Delete this reminder"
                variant="danger"
                disabled={working}
                onPress={() =>
                  Alert.alert(
                    t("Delete this reminder?"),
                    t("This removes the medicine and its future reminders."),
                    [
                      { text: t("Keep reminder"), style: "cancel" },
                      {
                        text: t("Delete"),
                        style: "destructive",
                        onPress: () => {
                          if (lock.current) return;
                          lock.current = true;
                          void save(
                            `medicines/${draft.id}`,
                            undefined,
                            "DELETE",
                          )
                            .then((ok) => {
                              if (ok) router.back();
                              else
                                setError(
                                  "Could not delete the reminder. Try again.",
                                );
                            })
                            .finally(() => {
                              lock.current = false;
                            });
                        },
                      },
                    ],
                  )
                }
              />
            )}
          </>
        )}
      </View>
    </AppScreen>
  );
}
