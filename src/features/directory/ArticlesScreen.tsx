import { useTranslation } from "../../localization/LanguageProvider";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import { useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { apiClient } from "../../services/api/client";
import { articleDetailSchema, loadArticles, type Article } from "./api";
export function ArticleRow({
  article,
  hindi: preferredHindi,
}: {
  article: Article;
  hindi?: boolean;
}) {
  const { t: tr, language, locale } = useTranslation();
  const hindi = preferredHindi ?? language === 'hi';
  const c = useCareStyles(),
    colors = usePalette();
  return (
    <TouchTarget
      onPress={() => router.push(`/articles/${article.id}`)}
      accessibilityRole="button"
      accessibilityLabel={tr(`Read ${(hindi && article.title_hi) || article.title_en}`)}
      style={{
        paddingVertical: 20,
        gap: 8,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <AppIcon name="book" size={18} />
        <Text style={c.text}>{article.category}</Text>
      </View>
      <Text style={c.title}>
        {(hindi && article.title_hi) || article.title_en}
      </Text>
      <Text numberOfLines={3} style={c.text}>
        {(hindi && article.excerpt_hi) || article.excerpt_en}
      </Text>
      <Text style={c.text}>
        {article.author_name || "Arogio editorial"} ·{" "}
        {new Date(article.created_at).toLocaleDateString(locale)}
      </Text>
    </TouchTarget>
  );
}
export function HomeArticles() {
  const { t: tr } = useTranslation();
  const c = useCareStyles();
  const query = useQuery({
    queryKey: ["articles", "home"],
    queryFn: ({ signal }) => loadArticles("", 1, signal),
    staleTime: 300000,
  });
  return (
    <View style={{ marginTop: 28, gap: 12 }}>
      <Text style={c.title}>{tr("Read for your wellbeing")}</Text>
      <Text style={c.text}>
        {tr("Ideas and perspectives for your everyday health.")}</Text>
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
          {tr("New articles will appear here when published.")}</Text>
      )}
      <Button
        title={tr("Browse all articles")}
        variant="secondary"
        onPress={() => router.push("/articles")}
      />
    </View>
  );
}
export function ArticlesScreen() {
  const { t: tr, language } = useTranslation();
  const c = useCareStyles(),
    colors = usePalette();
  const [search, setSearch] = useState(""),
    [term, setTerm] = useState(""),
    [page, setPage] = useState(1),
    [override, setHindi] = useState<boolean | null>(null);
  const hindi = override ?? language === 'hi';
  const query = useQuery({
    queryKey: ["articles", term, page],
    queryFn: ({ signal }) => loadArticles(term, page, signal),
  });
  return (
    <AppScreen
      title={tr("Articles")}
      back
      onRefresh={() => void query.refetch()}
      refreshing={query.isRefetching}
    >
      <View style={{ gap: 16 }}>
        <Text style={c.heading}>{tr("A little knowledge. Better everyday care.")}</Text>
        <Button
          title={tr(hindi ? "Read in English" : "हिन्दी में पढ़ें")}
          variant="secondary"
          onPress={() => setHindi(!hindi)}
        />
        <TextInput
          accessibilityLabel={tr("Search articles")}
          placeholder={tr("Search titles or categories")}
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          maxLength={150}
          onSubmitEditing={() => {
            setTerm(search.trim());
            setPage(1);
          }}
          style={{
            color: colors.ink,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 14,
            minHeight: 52,
          }}
        />
        <Button
          title={tr("Search articles")}
          onPress={() => {
            setTerm(search.trim());
            setPage(1);
          }}
        />
        {query.isPending ? (
          <ActivityIndicator />
        ) : query.isError ? (
          <>
            <Text style={c.text}>
              {tr("Could not load articles. Check your connection and try again.")}</Text>
            <Button title={tr("Retry")} onPress={() => void query.refetch()} />
          </>
        ) : (
          <>
            {query.data.items.length ? (
              query.data.items.map((article) => (
                <ArticleRow key={article.id} article={article} hindi={hindi} />
              ))
            ) : (
              <Text style={c.text}>
                {tr("No articles found. Try another title or category.")}</Text>
            )}
            <View style={{ gap: 8 }}>
              <Text style={c.text}>{tr("Page ")}{page}</Text>
              <Button
                title={tr("Previous page")}
                variant="secondary"
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
              />
              <Button
                title={tr("Next page")}
                variant="secondary"
                disabled={!query.data.hasNext}
                onPress={() => setPage(page + 1)}
              />
            </View>
          </>
        )}
      </View>
    </AppScreen>
  );
}
export function ArticleScreen() {
  const { t: tr, language, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>(),
    c = useCareStyles();
  const [override, setHindi] = useState<boolean | null>(null);
  const hindi = override ?? language === 'hi';

  const query = useQuery({
    queryKey: ["articles", id],
    queryFn: async ({ signal }) =>
      articleDetailSchema.parse(
        await apiClient.request({
          path: `/articles/${encodeURIComponent(id)}`,
          signal,
        }),
      ),
  });
  const article = query.data;
  return (
    <AppScreen title={tr("Article")} back>
      <View style={{ gap: 18 }}>
        {query.isPending ? (
          <ActivityIndicator />
        ) : query.isError || !article ? (
          <>
            <Text style={c.text}>
              {tr("This article is unavailable. It may have been unpublished, or your connection was interrupted.")}</Text>
            <Button title={tr("Retry")} onPress={() => void query.refetch()} />
          </>
        ) : (
          <>
            <Text style={c.heading}>
              {(hindi && article.title_hi) || article.title_en}
            </Text>
            <Text style={c.text}>
              {article.category} · {article.author_name || "Arogio editorial"}
            </Text>
            <Text style={c.text}>
              {new Date(article.created_at).toLocaleDateString(locale)}
            </Text>
            {!!article.content_hi && (
              <Button
                title={tr(hindi ? "Read in English" : "हिन्दी में पढ़ें")}
                variant="secondary"
                onPress={() => setHindi(!hindi)}
              />
            )}
            <Text selectable style={[c.text, { fontSize: 17, lineHeight: 29 }]}>
              {(hindi && article.content_hi) || article.content_en}
            </Text>
            <Text style={c.text}>
              {tr("For general information. Speak with a qualified clinician about your own care.")}</Text>
          </>
        )}
      </View>
    </AppScreen>
  );
}
