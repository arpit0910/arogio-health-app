import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";
import {
  CareDisclosure,
  useCareStyles,
} from "../../components/app/CareUI";
import { DailyTargetProgress } from "../activity/DailyTargetProgress";
import type { ActivityMetric } from "../activity/model";
import { useWellness } from "../wellness/WellnessContext";
import { usePalette } from "../../theme/AppearanceProvider";
import { fonts } from "../../theme/tokens";
import { formatDateTime } from "../../lib/time";
import { localDay } from "../wellness/domain";
import { HealthChart } from "./HealthCharts";
import {
  healthMetrics,
  recordedHealthMetrics,
  hasHealthValue,
  formatHealthValue,
  type HealthMetric,
  type HealthSnapshot,
} from "./model";
import { comparisonCopy, healthSummary } from "./insights";
const icons: Record<HealthMetric, AppIconName> = {
  Steps: "trend",
  SleepSession: "moon",
  HeartRate: "heart",
  Weight: "weight",
  Distance: "location",
  Nutrition: "leaf",
  ActiveCaloriesBurned: "bolt",
  TotalCaloriesBurned: "bolt",
  ExerciseSession: "clock",
  FloorsClimbed: "trend",
  RestingHeartRate: "heart",
  Hydration: "drop",
};
export function HealthOverview({ snapshot }: { snapshot: HealthSnapshot }) {
  const c = useCareStyles(),
    colors = usePalette();
  const { data } = useWellness();
  const [chosen, setChosen] = useState<HealthMetric>("Steps");
  const [selectedDay, selectDay] = useState<string | null>(null);
  const available = recordedHealthMetrics(snapshot);
  const metric = available.includes(chosen) ? chosen : available[0];
  if (!metric) return null;
  const info = healthMetrics.find((item) => item.key === metric)!;
  const day =
    snapshot.days.find((item) => item.day === selectedDay && hasHealthValue(item.readings[metric]?.value)) ??
    snapshot.days.filter(item => hasHealthValue(item.readings[metric]?.value)).at(-1);
  const latestWeight =
    metric === "Weight" && !selectedDay ? snapshot.latestWeight : null;
  const chartDay = latestWeight
    ? snapshot.days.find(item => item.day === localDay(new Date(latestWeight.at)))?.day
    : day?.day;
  const value = latestWeight ? latestWeight.kg : day?.readings[metric]?.value;
  const summary = healthSummary(snapshot, metric);
  const goal = data.activityTracking?.goals[metric as ActivityMetric];
  const date = (value: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${value}T12:00:00Z`));
  return (
    <View style={{ marginTop: 28, gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={c.title}>
          Explore your readings
        </Text>
        <Text style={c.text}>
          Choose a metric, then tap a day to see the detail.
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        accessibilityRole="radiogroup"
        accessibilityLabel="Health metric"
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
      >
        {healthMetrics
          .filter((item) => available.includes(item.key))
          .map((item) => (
            <TouchTarget
              key={item.key}
              accessibilityRole="radio"
              accessibilityLabel={item.title}
              accessibilityState={{ checked: metric === item.key }}
              onPress={() => {
                setChosen(item.key);
                selectDay(null);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 14,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor:
                  metric === item.key
                    ? colors.primary
                    : pressed
                      ? colors.subtle
                      : colors.surface,
                borderWidth: 1,
                borderColor:
                  metric === item.key ? colors.primary : colors.border,
              })}
            >
              <AppIcon
                name={icons[item.key]}
                size={19}
                color={metric === item.key ? colors.onPrimary : colors.primary}
              />
              <Text
                style={[
                  c.text,
                  {
                    color: metric === item.key ? colors.onPrimary : colors.ink,
                  },
                ]}
              >
                {item.title}
              </Text>
            </TouchTarget>
          ))}
      </ScrollView>
      <View
        style={{
          backgroundColor: colors.subtle,
          borderRadius: 16,
          padding: 20,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <AppIcon name={icons[metric]} size={24} />
          <Text style={[c.title, { flex: 1 }]}>
            {latestWeight ? "Latest weight" : info.title}
          </Text>
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontFamily: fonts.semibold,
            fontSize: value == null ? 24 : 36,
            lineHeight: 46,
            color: colors.ink,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatHealthValue(metric, value)}
          {value != null && metric !== "SleepSession" && (
            <Text style={[c.text, { color: colors.ink }]}> {info.unit}</Text>
          )}
        </Text>
        <Text style={c.text}>
          {latestWeight
            ? `Recorded ${formatDateTime(latestWeight.at)}`
            : day
              ? `${day.day === localDay() ? "Today" : date(day.day)}${["HeartRate", "RestingHeartRate", "Weight"].includes(metric) ? " · Average of recorded measurements" : " · Daily total"}`
              : "No recorded day available"}
        </Text>
        {goal != null && day?.day === localDay() && (
          <DailyTargetProgress
            value={value ?? null}
            goal={goal}
            unit={info.unit}
          />
        )}
      </View>
      {summary.recorded > 0 && <><View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={c.title}>
          Your week
        </Text>
        <Text style={[c.text, { fontSize: 13 }]}>
          {snapshot.days[0] ? date(snapshot.days[0].day) : ""} –{" "}
          {snapshot.days.at(-1) ? date(snapshot.days.at(-1)!.day) : ""} · IST
        </Text>
      </View>
      <HealthChart
        snapshot={snapshot}
        metric={metric}
        selectedDay={chartDay}
        onSelectDay={selectDay}
      />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: 24,
          rowGap: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        {summary.average != null && <View style={{ flex: 1, minWidth: 100, gap: 5 }}>
          <Text style={c.text}>Daily average</Text>
          <Text style={c.title}>
            {formatHealthValue(metric, summary.average)}
            {summary.average != null && metric !== "SleepSession"
              ? ` ${info.unit}`
              : ""}
          </Text>
          <Text style={[c.text, { fontSize: 12 }]}>
            {summary.completed} completed days
          </Text>
        </View>}
        <View style={{ flex: 1, minWidth: 100, gap: 5 }}>
          <Text style={c.text}>Data coverage</Text>
          <Text style={c.title}>
            {summary.recorded} / {snapshot.days.length} days
          </Text>
          <Text style={[c.text, { fontSize: 12 }]}>
            Includes today if recorded
          </Text>
        </View>
      </View>
      {summary.completed >= 2 && <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <AppIcon name="trend" size={22} />
        <Text style={[c.text, { flex: 1 }]}>
          {comparisonCopy(snapshot, metric)}
        </Text>
      </View>}
      <CareDisclosure title="Daily readings & details">
        {[...snapshot.days].filter(item => hasHealthValue(item.readings[metric]?.value)).reverse().map((item) => (
          <View
            key={item.day}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={c.text}>{date(item.day)}</Text>
            <Text style={[c.text, { color: colors.ink }]}>
              {formatHealthValue(metric, item.readings[metric]?.value)}
              {item.readings[metric]?.value != null && metric !== "SleepSession"
                ? ` ${info.unit}`
                : ""}
            </Text>
          </View>
        ))}
      </CareDisclosure></>}
    </View>
  );
}
