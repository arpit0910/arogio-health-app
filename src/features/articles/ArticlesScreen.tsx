import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import {
  ActivityIndicator,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AppScreen } from "../../components/app/AppScreen";
import { useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { publicApi as apiClient } from "../care-directory/api";
import {
  articleDetailSchema,
  loadArticles,
  type Article,
} from "../../services/api/healthResourcesApi";
import { ArticleThumbnail } from "./ArticleThumbnail";

export function ArticleRow({
  article,
  hindi: preferredHindi,
}: {
  article: Article;
  hindi?: boolean;
}) {
  const router = useRouter();
  const { t: tr, language, locale } = useTranslation();
  const hindi = preferredHindi ?? language === "hi";
  const c = useCareStyles(),
    colors = usePalette(),
    { width } = useWindowDimensions();
  return (
    <TouchTarget
      onPress={() => router.push(`/articles/${article.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${tr("Read")} ${(hindi && article.title_hi) || article.title_en}`}
      style={({ pressed }) => ({
        paddingVertical: 18,
        gap: 14,
        flexDirection: "row",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ArticleThumbnail
        category={article.category}
        uri={article.thumbnail_url || article.image_url}
        style={{
          width: width < 360 ? 80 : 100,
          height: width < 360 ? 96 : 112,
          borderRadius: 12,
          backgroundColor: colors.subtle,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          style={[
            c.text,
            { fontSize: 12, lineHeight: 18, color: colors.primary },
          ]}
        >
          {(hindi && article.category_hi) || article.category}
        </Text>
        <Text style={[c.title, { fontSize: 17, lineHeight: 24 }]}>
          {(hindi && article.title_hi) || article.title_en}
        </Text>
        <Text
          numberOfLines={2}
          style={[c.text, { fontSize: 14, lineHeight: 21 }]}
        >
          {(hindi && article.excerpt_hi) || article.excerpt_en}
        </Text>
        <Text style={[c.text, { fontSize: 12, lineHeight: 18 }]}>
          {article.author_name || tr("Arogio editorial")} ·{" "}
          {new Date(article.created_at).toLocaleDateString(locale)}
        </Text>
      </View>
    </TouchTarget>
  );
}
export function HomeArticles() {
  const router = useRouter();
  const { t: tr } = useTranslation(),
    c = useCareStyles();
  const query = useQuery({
    queryKey: ["articles", "home"],
    queryFn: ({ signal }) => loadArticles("", 1, signal, { limit: 3 }),
    staleTime: 300000,
  });
  return (
    <View style={{ marginTop: 28, gap: 12 }}>
      <Text style={c.title}>{tr("Read for your wellbeing")}</Text>
      <Text style={c.text}>
        {tr("Ideas and perspectives for your everyday health.")}
      </Text>
      {query.isPending ? (
        <ActivityIndicator accessibilityLabel={tr("Loading articles")} />
      ) : query.isError ? (
        <>
          <Text style={c.text}>{tr("Articles could not load.")}</Text>
          <Button
            title={tr("Retry articles")}
            variant="secondary"
            onPress={() => void query.refetch()}
          />
        </>
      ) : query.data.items.length ? (
        query.data.items
          .slice(0, 3)
          .map((article) => <ArticleRow key={article.id} article={article} />)
      ) : (
        <Text style={c.text}>
          {tr("New articles will appear here when published.")}
        </Text>
      )}
      <Button
        title={tr("Browse all articles")}
        variant="secondary"
        onPress={() => router.push("/articles")}
      />
    </View>
  );
}
export { ArticlesLibraryScreen as ArticlesScreen } from "./ArticlesLibraryScreen";

export function ArticleScreen() {
  const { t: tr, language, locale } = useTranslation(),
    { id } = useLocalSearchParams<{ id: string }>(),
    c = useCareStyles(),
    colors = usePalette();
  const hindi = language === "hi";
  const query = useQuery({
    queryKey: ["articles", id],
    queryFn: async ({ signal }) =>
      articleDetailSchema.parse(
        await apiClient.request({
          path: `/public/articles/${encodeURIComponent(id)}`,
          signal,
        }),
      ),
  });
  const article = query.data;
  return (
    <AppScreen title={tr("Article")} back>
      <View style={{ gap: 18 }}>
        {query.isPending ? (
          <ActivityIndicator accessibilityLabel={tr("Loading articles")} />
        ) : query.isError || !article ? (
          <>
            <Text style={c.text}>
              {tr(
                "This article is unavailable. It may have been unpublished, or your connection was interrupted.",
              )}
            </Text>
            <Button title={tr("Retry")} onPress={() => void query.refetch()} />
          </>
        ) : (
          <>
            <View style={{width: '100%', aspectRatio: 1.8, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.subtle}}><ArticleThumbnail
              category={article.category}
              uri={article.thumbnail_url || article.image_url}
              style={{
                width: "100%",
                height: '100%',
                backgroundColor: colors.subtle,
              }}
            /></View>
            <Text style={[c.text, { color: colors.primary }]}>
              {(hindi && article.category_hi) || article.category}
            </Text>
            <Text style={c.heading}>
              {(hindi && article.title_hi) || article.title_en}
            </Text>
            <Text style={c.text}>
              {article.author_name || tr("Arogio editorial")} ·{" "}
              {new Date(article.created_at).toLocaleDateString(locale)}
            </Text>
            <Text
              selectable
              style={[
                c.text,
                { fontSize: 17, lineHeight: 29, color: colors.ink },
              ]}
            >
              {(hindi && article.content_hi) || article.content_en}
            </Text>
            <Text style={c.text}>
              {tr(
                "For general information. Speak with a qualified clinician about your own care.",
              )}
            </Text>
          </>
        )}
      </View>
    </AppScreen>
  );
}
