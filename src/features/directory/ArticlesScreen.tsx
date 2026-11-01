import { useTranslation } from "../../localization/LanguageProvider";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import { useCareStyles } from "../../components/app/CareUI";
import { Button } from "../../components/ui/Button";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { usePalette } from "../../theme/AppearanceProvider";
import { apiClient } from "../../services/api/client";
import {
  articleDetailSchema,
  loadArticleCategories,
  loadArticles,
  type Article,
  type ArticleSort,
} from "./api";
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
    queryFn: ({ signal }) => loadArticles("", 1, signal, { sort: "random", limit: 3 }),
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
const sorts: { value: ArticleSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
];
export function ArticlesScreen() {
  const { t: tr, language } = useTranslation(),
    c = useCareStyles(),
    colors = usePalette();
  const [search, setSearch] = useState(""),
    [term, setTerm] = useState(""),
    [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<ArticleSort>("newest"),
    [sortOpen, setSortOpen] = useState(false);
  const hindi = language === "hi",
    readingLanguage = hindi ? "hi" : "en";
  const categories = useQuery({
    queryKey: ["article-categories"],
    queryFn: ({ signal }) => loadArticleCategories(signal),
    staleTime: 300000,
  });
  const query = useQuery({
    queryKey: [
      "articles",
      "browse",
      term,
      page,
      category,
      sort,
      readingLanguage,
    ],
    queryFn: ({ signal }) =>
      loadArticles(term, page, signal, {
        category,
        sort,
        language: readingLanguage,
      }),
  });
  const reset = () => {
    setSearch("");
    setTerm("");
    setCategory("");
    setSort("newest");
    setPage(1);
  };
  const topics = categories.data ?? query.data?.categoryDetails ?? [],
    selected = topics.find((item) => item.name === category);
  return (
    <AppScreen
      key={page}
      title={tr("Articles")}
      back
      onRefresh={() => {
        void query.refetch();
        void categories.refetch();
      }}
      refreshing={query.isRefetching}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={c.heading}>{tr("Find your next healthy habit.")}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}
        >
          <AppIcon name="search" size={20} />
          <TextInput
            accessibilityLabel={tr("Search articles")}
            placeholder={tr("Search titles or categories")}
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              if (!value) {
                setTerm("");
                setPage(1);
              }
            }}
            maxLength={150}
            returnKeyType="search"
            onSubmitEditing={() => {
              setTerm(search.trim());
              setPage(1);
            }}
            style={[
              c.text,
              {
                color: colors.ink,
                flex: 1,
                minWidth: 0,
                minHeight: 52,
                paddingVertical: 12,
              },
            ]}
          />
          <TouchTarget
            accessibilityRole="button"
            accessibilityLabel={tr("Search articles")}
            style={{width: 48, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              setTerm(search.trim());
              setPage(1);
            }}
          >
            <AppIcon name="right" size={20} />
          </TouchTarget>
        </View>
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text style={[c.title, {flex: 1}]}>{tr("Browse by topic")}</Text>
            <TouchTarget
              accessibilityRole="button"
              accessibilityState={{ selected: !category }}
              onPress={() => {
                setCategory("");
                setPage(1);
              }}
              style={{
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: !category ? colors.primary : colors.subtle,
                justifyContent: "center",
              }}
            >
              <Text
                style={[
                  c.text,
                  { color: !category ? colors.onPrimary : colors.ink },
                ]}
              >
                {tr("All topics")}
              </Text>
            </TouchTarget>
          </View>
          {categories.isPending ? (
            <ActivityIndicator accessibilityLabel={tr("Loading topics")} />
          ) : categories.isError && !topics.length ? (
            <Button
              title={tr("Retry topics")}
              variant="secondary"
              onPress={() => void categories.refetch()}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
              {topics.map((topic) => (
                <TouchTarget
                  key={topic.name}
                  accessibilityRole="button"
                  accessibilityLabel={`${(hindi && topic.name_hi) || topic.name}, ${topic.count} ${tr("articles")}`}
                  accessibilityState={{ selected: category === topic.name }}
                  onPress={() => {
                    setCategory(topic.name);
                    setPage(1);
                  }}
                  style={{
                    width: 128,
                    gap: 8,
                    padding: 6,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      category === topic.name ? colors.primary : "transparent",
                    backgroundColor:
                      category === topic.name ? colors.subtle : "transparent",
                  }}
                >
                  <ArticleThumbnail
                    category={topic.name}
                    uri={topic.image_url}
                    style={{
                      width: "100%",
                      height: 64,
                      borderRadius: 8,
                      backgroundColor: colors.subtle,
                    }}
                  />
                  <Text
                    style={[
                      c.text,
                      {
                        color:
                          category === topic.name ? colors.primary : colors.ink,
                        fontSize: 13,
                        lineHeight: 19,
                      },
                    ]}
                  >
                    {(hindi && topic.name_hi) || topic.name}
                  </Text>
                  <Text style={[c.text, { fontSize: 12, lineHeight: 18 }]}>
                    {topic.count} {tr("articles")}
                  </Text>
                </TouchTarget>
              ))}
            </ScrollView>
          )}
        </View>
        <View
          style={{
            gap: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          {!!selected?.description && (
            <Text style={c.text}>
              {hindi ? selected.name_hi || selected.name : selected.description}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text
              accessibilityLiveRegion="polite"
              style={[c.text, { flex: 1 }]}
            >
              {query.data?.total != null
                ? `${query.data.total} ${tr("articles")}`
                : tr("Articles")}
              {term ? ` · “${term}”` : ""}
            </Text>
            <TouchTarget
              accessibilityRole="button"
              accessibilityLabel={`${tr("Sort articles")}: ${tr(sorts.find((item) => item.value === sort)!.label)}`}
              accessibilityState={{ expanded: sortOpen }}
              onPress={() => setSortOpen(!sortOpen)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={[c.text, { color: colors.primary }]}>
                {tr(sorts.find((item) => item.value === sort)!.label)}
              </Text>
              <AppIcon name={sortOpen ? "up" : "down"} size={16} />
            </TouchTarget>
          </View>
          {sortOpen && (
            <View
              accessibilityRole="radiogroup"
              style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
            >
              {sorts.map((item) => (
                <TouchTarget
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: item.value === sort }}
                  onPress={() => {
                    setSort(item.value);
                    setPage(1);
                    setSortOpen(false);
                  }}
                  style={{
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    justifyContent: "center",
                    backgroundColor:
                      item.value === sort ? colors.primary : colors.subtle,
                  }}
                >
                  <Text
                    style={[
                      c.text,
                      {
                        color:
                          item.value === sort ? colors.onPrimary : colors.ink,
                      },
                    ]}
                  >
                    {tr(item.label)}
                  </Text>
                </TouchTarget>
              ))}
            </View>
          )}
          {!!(term || category || sort !== "newest") && (
            <TouchTarget
              accessibilityRole="button"
              onPress={reset}
              style={{ alignSelf: "flex-start" }}
            >
              <Text style={[c.text, { color: colors.primary }]}>
                {tr("Clear filters")}
              </Text>
            </TouchTarget>
          )}
        </View>
        {query.isPending ? (
          <ActivityIndicator accessibilityLabel={tr("Loading articles")} />
        ) : query.isError ? (
          <View style={{ gap: 12 }}>
            <Text style={c.text}>
              {tr(
                "Could not load articles. Check your connection and try again.",
              )}
            </Text>
            <Button title={tr("Retry")} onPress={() => void query.refetch()} />
          </View>
        ) : (
          <View>
            {query.data.items.length ? (
              query.data.items.map((article) => (
                <ArticleRow key={article.id} article={article} hindi={hindi} />
              ))
            ) : (
              <View style={{ gap: 12, paddingVertical: 20 }}>
                <AppIcon name="search" size={28} />
                <Text style={c.title}>{tr("No matching articles")}</Text>
                <Text style={c.text}>
                  {tr("Try another search or clear your filters.")}
                </Text>
                <Button
                  title={tr("Clear filters")}
                  variant="secondary"
                  onPress={reset}
                />
              </View>
            )}
            {(page > 1 || query.data.hasNext) && (
              <View style={{ gap: 12, paddingTop: 20 }}>
                <Text style={c.text}>
                  {tr("Page ")}
                  {page}
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      title={tr("Previous page")}
                      variant="secondary"
                      disabled={page === 1}
                      onPress={() => setPage(page - 1)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title={tr("Next page")}
                      variant="secondary"
                      disabled={!query.data.hasNext}
                      onPress={() => setPage(page + 1)}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </AppScreen>
  );
}
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
