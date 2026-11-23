import { useState } from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import { env } from "../../configuration/environment";

const covers = {
  ayurveda: require("../../../assets/articles/library/ayurveda-feature.jpg"),
  diabetes: require("../../../assets/articles/library/nutrition-meal.jpg"),
  cardiacSleep: require("../../../assets/articles/library/cardiac-sleep.jpg"),
  kadha: require("../../../assets/articles/library/ayurvedic-kadha.jpg"),
  hydration: require("../../../assets/articles/library/herbal-hydration.jpg"),
  diagnostics: require("../../../assets/articles/library/thyroid-diagnostics.jpg"),
  care: require("../../../assets/articles/care.jpg"),
  family: require("../../../assets/articles/family.jpg"),
  mindfulness: require("../../../assets/articles/mindfulness.jpg"),
  movement: require("../../../assets/articles/movement.jpg"),
  nutrition: require("../../../assets/homepage/reference-5.jpg"),
  seasonal: require("../../../assets/homepage/reference-6.jpg"),
  sleep: require("../../../assets/articles/sleep.jpg"),
  walking: require("../../../assets/articles/walking.jpg"),
  wellbeing: require("../../../assets/articles/wellbeing.jpg"),
  yoga: require("../../../assets/articles/yoga.jpg"),
};
const topic: Record<string, keyof typeof covers> = {
  "Food & Nutrition": "diabetes",
  "Ayush Care": "ayurveda",
  "Diabetes Care": "diabetes",
  "Heart Health": "cardiacSleep",
  "Ayush Certified": "kadha",
  "Daily Wellness": "hydration",
  "Diagnostics": "diagnostics",
  "Yoga & Breathing": "yoga",
  "Mental Wellbeing": "mindfulness",
  "Exercise & Movement": "movement",
  "Sleep & Rest": "sleep",
  "Family & Children": "family",
  "Healthy Aging": "walking",
  "Remedies & Supplements": "care",
  "Ayurvedic Wisdom": "ayurveda",
  "Preventive Care": "nutrition",
  "Heart & Blood Pressure": "care",
  "Common Health Conditions": "care",
  "Prevention & Checkups": "care",
  "First Aid & Safety": "care",
  "Women's Health": "walking",
  "Men's Health": "movement",
  "Sexual Wellness (Adults)": "family",
  "Skin & Oral Care": "care",
};
export function ArticleThumbnail({
  category,
  uri,
  style,
}: {
  category: string;
  uri?: string;
  style: StyleProp<ImageStyle>;
}) {
  const [failed, setFailed] = useState<string>();
  const fallback = covers[topic[category] ?? "wellbeing"];
  // Bundled topic images avoid network requests and work offline. Admin-provided
  // HTTPS photos load anonymously and fall back to the same local topic image.
  const remote = uri?.startsWith("https://")
    ? uri
    : uri?.startsWith("/admin-assets/")
      ? new URL(uri, env.apiUrl).toString()
      : undefined;
  const bundled = uri?.match(
    /^\/admin-assets\/article-thumbnails\/(\w+)\.jpg$/,
  )?.[1] as keyof typeof covers | undefined;
  const source =
    bundled && covers[bundled]
      ? covers[bundled]
      : remote && failed !== remote
        ? { uri: remote }
        : fallback;
  return (
    <Image
      accessible={false}
      source={source}
      defaultSource={fallback}
      onError={() => setFailed(remote)}
      resizeMode="cover"
      style={style}
    />
  );
}
