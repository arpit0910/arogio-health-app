import { PhoneTrackingControl } from "./PhoneTrackingControl";
import { usePalette } from "../../theme/AppearanceProvider";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";
import {
  CareDisclosure,
  CareRow,
  useCareStyles,
} from "../../components/app/CareUI";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { Button } from "../../components/ui/Button";
import { fonts } from "../../theme/tokens";
import { useWellness } from "../wellness/WellnessContext";
import { useHealthSync } from "../health-sync/HealthSyncProvider";
import { HealthChart } from "../health-sync/HealthCharts";
import { CalendarField } from "../wellness/CalendarField";
import { Field, TrackingStatus, confirmDelete } from "../wellness/TrackingUI";
import {
  TrackingFeedback,
  useTrackingFeedback,
} from "../wellness/TrackingFeedback";
import { useTrackingClock } from "../wellness/useTrackingClock";
import { addDays, localDay, validDay } from "../wellness/domain";
import {
  activityMetrics,
  activityReading,
  emptyActivity,
  parseActivityValue,
  type ActivityMetric,
} from "./model";
import { DailyTargetProgress } from "./DailyTargetProgress";
import { usePhoneSteps } from "./PhoneStepsProvider";

const icons: Record<ActivityMetric, AppIconName> = {
  Steps: "trend",
  ActiveCaloriesBurned: "bolt",
  Nutrition: "leaf",
  Distance: "location",
  ExerciseSession: "clock",
  SleepSession: "clock",
};
export function ActivityScreen() {
  const c = useCareStyles();
  const colors = usePalette();
  const s = useStyles();

  const { data, loading, busy, save } = useWellness();
  const health = useHealthSync(),
    phone = usePhoneSteps();
  const now = useTrackingClock(),
    today = localDay(now);
  const tracking = data.activityTracking ?? emptyActivity();
  const [day, setDay] = useState(today);
  const [preferredMode, setMode] = useState<"manual" | "connected">("manual");
  const mode =
    preferredMode === "connected" && health.connected ? "connected" : "manual";
  const [entryMetric, setEntryMetric] = useState<ActivityMetric | null>(null);
  const [editor, setEditor] = useState<"goals" | "entry" | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [trend, setTrend] = useState<ActivityMetric>("Steps");
  const { feedback, setFeedback } = useTrackingFeedback();
  function edit(kind: "goals" | "entry", metric: ActivityMetric | null = null) {
    const values =
      kind === "goals"
        ? tracking.goals
        : (tracking.days.find((entry) => entry.day === day)?.values ?? {});
    setDraft(
      Object.fromEntries(
        activityMetrics.map((item) => [
          item.key,
          values[item.key] == null ? "" : String(values[item.key]),
        ]),
      ),
    );
    setEntryMetric(metric);
    setEditor(kind);
    setFeedback(null);
  }
  async function commit() {
    try {
      const values = Object.fromEntries(
        activityMetrics
          .filter(
            (item) =>
              editor !== "entry" || !entryMetric || item.key === entryMetric,
          )
          .filter(
            (item) =>
              editor !== "entry" || item.key !== "Steps" || !phone.enabled,
          )
          .map((item) => [
            item.key,
            parseActivityValue(
              item.key,
              draft[item.key] ?? "",
              editor === "goals",
            ),
          ]),
      );
      if (
        await save(
          editor === "goals" ? "activity/goals" : `activity/days/${day}`,
          editor === "goals" ? { goals: values } : { values },
        )
      ) {
        setEditor(null);
        setFeedback(
          editor === "goals" ? "Daily targets saved." : "Daily totals updated.",
          "success",
        );
      }
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Check your activity values.",
      );
    }
  }
  const history = {
    syncedAt: now.toISOString(),
    granted: [trend],
    latestWeight: null,
    failed: [],
    days: Array.from({ length: 7 }, (_, index) => {
      const date = addDays(day, index - 6);
      return {
        day: date,
        readings: {
          [trend]: {
            value: activityReading(
              trend,
              date,
              mode,
              tracking,
              health.snapshot,
              phone,
            ).value,
            sources: [],
          },
        },
      };
    }),
  };
  return (
    <AppScreen back title="Daily activity & targets">
      <View style={{ gap: 8 }}>
        <Text style={c.heading}>Daily activity</Text>
        <Text style={c.text}>
          Track with Arogio, set your targets and enter the totals you want to
          keep. No other app required.
        </Text>
      </View>
      <TrackingStatus />
      <TrackingFeedback value={feedback} />
      {mode === "connected" && !!health.error && (
        <TrackingFeedback value={{ message: health.error, tone: "error" }} />
      )}
      {editor ? (
        <View style={s.section}>
          <Text style={c.title}>
            {editor === "goals"
              ? "Daily targets"
              : `${entryMetric ? activityMetrics.find((item) => item.key === entryMetric)!.title : "Daily totals"} - ${day}`}
          </Text>
          <Text style={c.text}>
            {editor === "goals"
              ? "Targets are saved to your account. Leave a target blank to remove it. A connected app shares readings; set its preferred targets here."
              : "Enter the total for this day, rather than adding the same activity twice. A blank field clears that entered value."}
          </Text>
          {activityMetrics
            .filter(
              (item) =>
                editor !== "entry" || !entryMetric || item.key === entryMetric,
            )
            .map((item) =>
              editor === "entry" && item.key === "Steps" && phone.enabled ? (
                <Text key={item.key} style={c.text}>
                  Phone counting is selected for steps. Turn it off to use an
                  entered step total.
                </Text>
              ) : (
                <Field
                  key={item.key}
                  label={`${item.title} (${item.unit})`}
                  placeholder={
                    editor === "goals"
                      ? "Optional daily target"
                      : "Total for this day"
                  }
                  value={draft[item.key] ?? ""}
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, [item.key]: value }))
                  }
                  numeric
                  decimal={!item.whole}
                  icon={icons[item.key]}
                />
              ),
            )}
          <Button
            title={
              editor === "goals" ? "Save daily targets" : "Save entered totals"
            }
            loading={busy}
            onPress={() => void commit()}
          />
          <Button
            title="Cancel"
            variant="secondary"
            disabled={busy}
            onPress={() => {
              setEditor(null);
              setFeedback(null);
            }}
          />
        </View>
      ) : (
        <>
          <View style={s.section}>
            <View style={{ gap: 12 }}>
              <Text style={c.title}>
                {day === today
                  ? "Today"
                  : new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "long",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(`${day}T12:00:00Z`))}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                accessibilityRole="radiogroup"
                accessibilityLabel="Activity date"
                contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
              >
                {Array.from({ length: 7 }, (_, index) =>
                  addDays(today, index - 6),
                ).map((date) => (
                  <TouchTarget
                    key={date}
                    accessibilityRole="radio"
                    accessibilityLabel={date}
                    accessibilityState={{ checked: day === date }}
                    onPress={() => {
                      setDay(date);
                      setFeedback(null);
                    }}
                    style={{
                      minWidth: 48,
                      minHeight: 64,
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 4,
                      borderBottomWidth: day === date ? 2 : 1,
                      borderColor:
                        day === date ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={s.small}>
                      {new Intl.DateTimeFormat("en-IN", {
                        weekday: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(`${date}T12:00:00Z`))}
                    </Text>
                    <Text
                      style={[
                        s.value,
                        { color: day === date ? colors.primary : colors.ink },
                      ]}
                    >
                      {Number(date.slice(-2))}
                    </Text>
                  </TouchTarget>
                ))}
              </ScrollView>
            </View>
            <CareDisclosure title="Choose another date">
              <CalendarField
                label="Activity day"
                mode="date"
                value={day}
                onChange={(value) => {
                  if (
                    !validDay(value) ||
                    value > today ||
                    value < addDays(today, -89)
                  ) {
                    setFeedback(
                      "Choose a day within the last 90 days, through today.",
                    );
                    return;
                  }
                  setDay(value);
                  setFeedback(null);
                }}
              />
            </CareDisclosure>
            {day !== today && (
              <Button
                title="View today"
                variant="secondary"
                onPress={() => setDay(today)}
              />
            )}
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Activity data source"
              style={s.modes}
            >
              {(
                [
                  "manual",
                  ...(health.connected ? ["connected" as const] : []),
                ] as const
              ).map((value) => (
                <TouchTarget
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: mode === value,
                    disabled: value === "connected" && !health.connected,
                  }}
                  disabled={value === "connected" && !health.connected}
                  onPress={() => setMode(value)}
                  style={[
                    s.mode,
                    mode === value && s.selected,
                    value === "connected" &&
                      !health.connected && { opacity: 0.55 },
                  ]}
                >
                  <Text
                    style={[
                      s.label,
                      mode === value && { color: colors.onPrimary },
                    ]}
                  >
                    {value === "manual" ? "Arogio tracking" : "Connected app"}
                  </Text>
                </TouchTarget>
              ))}
            </View>
            <Text style={c.text}>
              {mode === "connected"
                ? `Readings from ${health.source?.name ?? "your selected app"} only. Missing values stay empty.`
                : "Your entered totals and, when enabled, phone-counted steps. Your records stay separate from readings imported from another app."}
            </Text>
            {mode === "manual" && (
              <Button
                title="Log or edit daily totals"
                disabled={loading || busy}
                onPress={() => edit("entry")}
              />
            )}
            <Button
              title={
                Object.keys(tracking.goals).length
                  ? "Edit daily targets"
                  : "Set daily targets"
              }
              variant="secondary"
              disabled={loading || busy}
              onPress={() => edit("goals")}
            />
            {mode === "manual" && <PhoneTrackingControl />}
          </View>
          {!loading &&
            activityMetrics.map((item) => {
              const reading = activityReading(
                item.key,
                day,
                mode,
                tracking,
                health.snapshot,
                phone,
              );
              return (
                <View key={item.key} style={s.metric}>
                  <View style={s.metricHeader}>
                    <AppIcon name={icons[item.key]} size={22} />
                    <Text style={[s.label, { flex: 1 }]}>{item.title}</Text>
                    <Text style={s.value}>
                      {reading.value == null
                        ? "No reading"
                        : reading.value.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                      {reading.value == null ? "" : ` ${item.unit}`}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text style={[s.small, { flex: 1 }]}>{reading.source}</Text>
                    {mode === "manual" &&
                      !(item.key === "Steps" && phone.enabled) && (
                        <TouchTarget
                          accessibilityRole="button"
                          accessibilityLabel={`Log ${item.title.toLowerCase()}`}
                          disabled={busy}
                          onPress={() => edit("entry", item.key)}
                          style={{
                            minHeight: 48,
                            paddingHorizontal: 12,
                            justifyContent: "center",
                          }}
                        >
                          <Text style={[s.label, { color: colors.primary }]}>
                            Log
                          </Text>
                        </TouchTarget>
                      )}
                  </View>
                  {tracking.goals[item.key] != null && (
                    <DailyTargetProgress
                      value={reading.value}
                      goal={tracking.goals[item.key]}
                      unit={item.unit}
                    />
                  )}
                </View>
              );
            })}
          <View style={s.section}>
            <Text style={c.title}>Last 7 days</Text>
            <Text style={s.small}>
              For the selected source, ending on {day}. Empty days stay empty.
            </Text>
            <View style={s.modes}>
              {activityMetrics.map((item) => (
                <TouchTarget
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: trend === item.key }}
                  onPress={() => setTrend(item.key)}
                  style={[s.mode, trend === item.key && s.selected]}
                >
                  <Text
                    style={[
                      s.label,
                      trend === item.key && { color: colors.onPrimary },
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchTarget>
              ))}
            </View>
            <HealthChart
              snapshot={history}
              metric={trend}
              emptyMessage={
                mode === "manual"
                  ? "No totals recorded for these days. Enter daily totals to start a trend."
                  : undefined
              }
            />
          </View>
          <View style={s.section}>
            <CareRow
              title="Optional health connections"
              detail={
                health.source?.name ??
                "Add another data source only if you want one"
              }
              onPress={() => router.push("/connected-health-settings")}
            />
            <CareDisclosure title="Your activity data">
              <Text style={c.text}>
                Targets and entered totals are saved to your account. Phone
                counts are encrypted on this device and kept for 30 days. Synced
                readings remain on the device and are never added to your
                entered totals.
              </Text>
              <Button
                title="Delete activity targets and entries"
                variant="danger"
                disabled={busy || phone.busy || !phone.ready}
                onPress={() =>
                  confirmDelete(
                    "Delete activity tracking?",
                    "This removes your Arogio activity targets, entered totals and saved phone counts. Water, cycle and medicine tracking stay available.",
                    () =>
                      void (async () => {
                        if (await save("activity/data", undefined, "DELETE")) {
                          try {
                            await phone.clear();
                            setFeedback(
                              "Activity tracking cleared.",
                              "success",
                            );
                          } catch {
                            setFeedback(
                              "Account entries were cleared. Device step history could not be cleared; try again.",
                            );
                          }
                        }
                      })(),
                  )
                }
              />
            </CareDisclosure>
          </View>
        </>
      )}
    </AppScreen>
  );
}
const useStyles = () => {
  const c = useCareStyles();
  const colors = usePalette();
  return StyleSheet.create({
    section: { marginTop: 32, gap: 12 },
    modes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    mode: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      justifyContent: "center",
    },
    selected: { backgroundColor: colors.primary, borderColor: colors.primary },
    label: {
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 23,
      color: colors.ink,
    },
    small: { ...c.text, fontSize: 13, lineHeight: 20 },
    value: {
      fontFamily: fonts.semibold,
      fontSize: 18,
      lineHeight: 26,
      color: colors.ink,
      flexShrink: 1,
    },
    metric: {
      gap: 8,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    metricHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
    },
  });
};
