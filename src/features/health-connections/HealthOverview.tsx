import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { AppIcon, type AppIconName } from "../../components/app/AppIcon";
import {
  CareDisclosure,
  useCareStyles,
} from "../../components/app/CareUI";
import { DailyTargetProgress } from "../activity/DailyTargetProgress";
import type { ActivityMetric } from "../activity/model";
import { useWellness } from "../personal-wellness/WellnessContext";
import { usePalette } from "../../theme/AppearanceProvider";
import { fonts } from "../../theme/tokens";
import { formatDateTime } from "../../shared/date-time";
import { localDay } from "../personal-wellness/domain";
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
import { ProgressInsights } from './ProgressInsights';
const icons: Record<HealthMetric, AppIconName> = {
  Steps: "walk",
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
  const { t: tr, locale } = useTranslation();
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
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${value}T12:00:00Z`));
  return (
    <View style={{ marginTop: 28, gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={c.title}>
          {tr("Explore your readings")}</Text>
        <Text style={c.text}>
          {tr("Choose a metric, then tap a day to see the detail.")}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        accessibilityRole="radiogroup"
        accessibilityLabel={tr("Health metric")}
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
                {tr(item.title)}
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
            {tr(latestWeight ? "Latest weight" : info.title)}
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
          {tr(latestWeight
            ? `Recorded ${formatDateTime(latestWeight.at)}`
            : day
              ? `${day.day === localDay() ? "Today" : date(day.day)}${["HeartRate", "RestingHeartRate", "Weight"].includes(metric) ? " · Average of recorded measurements" : " · Daily total"}`
              : "No recorded day available")}
        </Text>
        {!latestWeight && day?.readings[metric]?.checkedAt && <Text style={c.text}>{tr("Reading checked ")}{formatDateTime(day.readings[metric]!.checkedAt!)}</Text>}
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
          {tr("Your week")}</Text>
        <Text style={[c.text, { fontSize: 13 }]}>
          {snapshot.days[0] ? date(snapshot.days[0].day) : ""} –{" "}
          {snapshot.days.at(-1) ? date(snapshot.days.at(-1)!.day) : ""} {tr(" · IST")}</Text>
      </View>
      <HealthChart
        snapshot={snapshot}
        metric={metric}
        selectedDay={chartDay}
        onSelectDay={selectDay}
      />
      <ProgressInsights snapshot={snapshot} metric={metric} goal={goal} />
      {summary.completed >= 2 && <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <AppIcon name="trend" size={22} />
        <Text style={[c.text, { flex: 1 }]}>
          {comparisonCopy(snapshot, metric)}
        </Text>
      </View>}
      <CareDisclosure title={tr("Daily readings & details")}>
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
              {tr(item.readings[metric]?.value != null && metric !== "SleepSession"
                ? ` ${info.unit}`
                : "")}
            </Text>
          </View>
        ))}
      </CareDisclosure></>}
    </View>
  );
}
