import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SvgXml } from "react-native-svg";
import { useAuth } from "../auth/context/AuthContext";
import { authAssets } from "../auth/assets/authAssets";
import { AppScreen, appStyles as a } from "../../components/app/AppScreen";
import { Avatar } from "../../components/app/Avatar";
import { AppIcon } from "../../components/app/AppIcon";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { appTheme as t } from "../../theme/appTheme";
import { profilePhoto } from "../profile/profileViewModel";

const services: {
  title: string;
  subtitle: string;
  image: import("react-native").ImageSourcePropType;
  tint: string;
}[] = [
  {
    title: "Blood Banks",
    subtitle: "Find nearby blood banks",
    image: require("../../../assets/home/blood.png"),
    tint: "#FFF0F1",
  },
  {
    title: "Medicine Reminder",
    subtitle: "Stay on time",
    image: require("../../../assets/home/medicine.png"),
    tint: "#EAF5FC",
  },
  {
    title: "Health Tracking",
    subtitle: "Log your vitals",
    image: require("../../../assets/home/tracking.png"),
    tint: "#EEF9EA",
  },
  {
    title: "My Reports",
    subtitle: "Upload & manage",
    image: require("../../../assets/home/reports.png"),
    tint: "#E9F7FF",
  },
  {
    title: "Nani Dadi ke Nuskhe",
    subtitle: "Traditional wisdom",
    image: require("../../../assets/home/wisdom.png"),
    tint: "#F2F9E9",
  },
  {
    title: "Health Articles",
    subtitle: "Learn & stay informed",
    image: require("../../../assets/home/articles.png"),
    tint: "#FFF5E8",
  },
];
const openFeature = (name: string) =>
  router.push({ pathname: "/feature", params: { name } });
export function HomeScreen() {
  const { user } = useAuth();
  if (!user) return null;
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good Morning,"
      : hour < 17
        ? "Good Afternoon,"
        : "Good Evening,";
  const name =
    user.fullName?.trim().split(/\s+/)[0] || user.username || "there";
  return (
    <AppScreen>
      <View style={s.header}>
        <View style={s.brand}>
          <View style={s.wordmark}>
            <SvgXml xml={authAssets.brand} width={38} height={36} />
            <Text style={s.brandName}>Arogio</Text>
          </View>
          <Text style={s.tagline}>Your Health Companion</Text>
        </View>
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => openFeature("Notifications")}
          style={s.smallButton}
        >
          <AppIcon name="bell" color={t.muted} />
        </TouchTarget>
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.navigate("/profile")}
          style={s.smallButton}
        >
          <Avatar photo={profilePhoto(user)} size={38} />
        </TouchTarget>
      </View>
      <View style={s.greeting}>
        <Image
          source={require("../../../assets/home/hero.png")}
          style={s.hero}
          resizeMode="contain"
        />
        <View style={s.greetingCopy}>
          <Text style={s.goodMorning}>{greeting}</Text>
          <Text style={s.name}>
            {name} <Text style={{ fontSize: 25 }}>👋</Text>
          </Text>
          <Text style={s.message}>
            Small steps today,{"\n"}a healthier tomorrow.
          </Text>
        </View>
      </View>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel="Today's Reminder. No reminders for now"
        onPress={() => openFeature("Reminders")}
        style={[a.card, s.reminder]}
      >
        <View style={s.calendar}>
          <AppIcon name="calendar" size={28} />
        </View>
        <View style={s.flex}>
          <Text style={s.reminderTitle}>Today&apos;s Reminder</Text>
          <Text style={s.reminderCopy}>No reminders for now</Text>
        </View>
        <AppIcon name="right" color={t.muted} size={18} />
      </TouchTarget>
      <View style={s.grid}>
        {services.map((item) => (
          <TouchTarget
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
            onPress={() => openFeature(item.title)}
            style={[a.card, s.tile, { backgroundColor: item.tint + "50" }]}
          >
            <Image source={item.image} style={s.serviceIcon} />
            <Text style={s.tileTitle}>{item.title}</Text>
            <Text style={s.tileCopy}>{item.subtitle}</Text>
          </TouchTarget>
        ))}
      </View>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel="Ask Jeeva"
        onPress={() => router.navigate("/jeeva")}
        style={s.ask}
      >
        <Image
          source={require("../../../assets/home/robot.png")}
          style={s.robot}
          resizeMode="contain"
        />
        <View style={s.flex}>
          <Text style={s.askTitle}>Ask Jeeva</Text>
          <Text style={s.askCopy}>
            Get instant answers to your health questions
          </Text>
        </View>
        <View style={s.askArrow}>
          <AppIcon name="right" color="#FFFFFF" size={21} />
        </View>
      </TouchTarget>
    </AppScreen>
  );
}
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 5 },
  brand: { flex: 1 },
  wordmark: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandName: {
    fontFamily: t.fonts.bold,
    color: t.ink,
    fontSize: 25,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: t.fonts.regular,
    color: t.muted,
    fontSize: 13,
    marginTop: 1,
  },
  smallButton: { width: 40, alignItems: "center", justifyContent: "center" },
  greeting: { minHeight: 151, marginTop: 18, justifyContent: "center" },
  hero: {
    position: "absolute",
    right: -12,
    bottom: 0,
    width: "55%",
    height: 150,
  },
  greetingCopy: { width: "57%", paddingVertical: 8 },
  goodMorning: { fontFamily: t.fonts.medium, color: t.muted, fontSize: 15 },
  name: {
    fontFamily: t.fonts.bold,
    color: t.ink,
    fontSize: 28,
    marginTop: 3,
    lineHeight: 35,
  },
  message: {
    fontFamily: t.fonts.regular,
    color: t.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  reminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 14,
    minHeight: 78,
  },
  calendar: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "#EFF9F5",
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  reminderTitle: { fontFamily: t.fonts.semibold, color: t.ink, fontSize: 14 },
  reminderCopy: {
    fontFamily: t.fonts.regular,
    color: t.muted,
    fontSize: 13,
    marginTop: 6,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11, marginTop: 16 },
  tile: {
    flexBasis: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 9,
    paddingBottom: 10,
    minHeight: 112,
  },
  serviceIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  tileTitle: {
    fontFamily: t.fonts.semibold,
    color: t.ink,
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
  },
  tileCopy: {
    color: t.muted,
    fontFamily: t.fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 4,
  },
  ask: {
    backgroundColor: "#E8F7F1",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
    marginTop: 19,
    paddingRight: 13,
    overflow: "hidden",
    gap: 9,
  },
  robot: { width: 77, height: 88, alignSelf: "flex-end" },
  askTitle: { fontFamily: t.fonts.bold, color: t.ink, fontSize: 18 },
  askCopy: {
    fontFamily: t.fonts.regular,
    color: t.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  askArrow: {
    width: 37,
    height: 37,
    borderRadius: 20,
    backgroundColor: "#008C85",
    alignItems: "center",
    justifyContent: "center",
  },
});
