import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppScreen } from "../../components/app/AppScreen";
import { AppIcon } from "../../components/app/AppIcon";
import {
  IconButton,
  LibraryHeader,
  LibraryArticleCard,
  LibraryQuestion,
} from "./ArticlesLibraryContent";
import { articleLibraryStyles as s } from "./articleLibraryStyles";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../localization/LanguageProvider";
import { publicApi } from "../care-directory/api";
import {
  articleDetailSchema,
  loadArticleCategories,
  loadArticles,
  type ArticleSort,
} from "../../services/api/healthResourcesApi";
import { loadArticleBookmarks, saveArticleBookmarks } from "./articleBookmarks";
import {
  estimateReadingMinutes,
  filterSavedArticles,
} from "./articleLibraryModel";

export function ArticlesLibraryScreen() {
  const params = useLocalSearchParams<{ search?: string; category?: string }>();
  const initialSearch = typeof params.search === 'string' ? params.search : '';
  const initialCategory = typeof params.category === 'string' ? params.category : '';
  return <LibrarySession key={JSON.stringify([initialSearch, initialCategory])} initialSearch={initialSearch} initialCategory={initialCategory} />;
}
function LibrarySession({ initialSearch, initialCategory }: { initialSearch: string; initialCategory: string }) {
  const { language, t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch),
    [term, setTerm] = useState(initialSearch),
    [category, setCategory] = useState(initialCategory);

  const [sort, setSort] = useState<ArticleSort>("newest"),
    [filtersOpen, setFiltersOpen] = useState(false),
    [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]),
    [saving, setSaving] = useState(false),
    [bookmarksReady, setBookmarksReady] = useState(false),
    [bookmarkError, setBookmarkError] = useState("");
  const [question, setQuestion] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    loadArticleBookmarks()
      .then((ids) => {
        if (alive) {
          setSavedIds(ids);
          setBookmarksReady(true);
        }
      })
      .catch(() => {
        if (alive)
          setBookmarkError(
            "Saved articles could not be restored. Try reopening this page.",
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);
  const categories = useQuery({
    queryKey: ["article-categories"],
    queryFn: ({ signal }) => loadArticleCategories(signal),
    staleTime: 300000,
  });
  const query = useInfiniteQuery({
    queryKey: ["articles", "browse-infinite", term, category, sort, language],
    initialPageParam: 1,
    enabled: !savedOnly,
    queryFn: ({ signal, pageParam }) =>
      loadArticles(term, pageParam, signal, { category, sort, language }),
    getNextPageParam: (page) =>
      page.hasNext && page.items.length ? page.page + 1 : undefined,
  });
  const bookmarks = useQuery({
    queryKey: ["articles", "saved", savedIds],
    enabled: savedOnly && bookmarksReady,
    queryFn: async ({ signal }) =>
      Promise.all(
        savedIds.map(async (id) => {
          try {
            const article = articleDetailSchema.parse(
              await publicApi.request({
                path: `/public/articles/${encodeURIComponent(id)}`,
                signal,
              }),
            );
            return {
              ...article,
              reading_minutes_en: estimateReadingMinutes(article.content_en),
              reading_minutes_hi: estimateReadingMinutes(
                article.content_hi || article.content_en,
              ),
            };
          } catch (error) {
            if (
              error &&
              typeof error === "object" &&
              "status" in error &&
              error.status === 404
            )
              return null;
            throw error;
          }
        }),
      ),
  });
  const loaded = useMemo(
    () =>
      Array.from(
        new Map(
          query.data?.pages
            .flatMap((page) => page.items)
            .map((article) => [article.id, article]) ?? [],
        ).values(),
      ),
    [query.data],
  );
  const articles = savedOnly
    ? filterSavedArticles(
        (bookmarks.data ?? []).filter((article) => article !== null),
        term,
        category,
        language === "hi",
      )
        .map((item) => item.article)
        .sort((a, b) =>
          sort === "title_asc" || sort === "title_desc"
            ? (language === "hi"
                ? a.title_hi || a.title_en
                : a.title_en
              ).localeCompare(
                language === "hi" ? b.title_hi || b.title_en : b.title_en,
                language,
              ) * (sort === "title_desc" ? -1 : 1)
            : (new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()) *
              (sort === "newest" ? -1 : 1),
        )
    : loaded;
  async function toggleSaved(id: string) {
    if (lock.current || !bookmarksReady) return;
    if (!savedIds.includes(id) && savedIds.length >= 40) {
      setBookmarkError(
        "Your reading list is full. Remove an article before saving another.",
      );
      return;
    }
    lock.current = true;
    setSaving(true);
    setBookmarkError("");
    const next = savedIds.includes(id)
      ? savedIds.filter((value) => value !== id)
      : [...savedIds, id];
    try {
      await saveArticleBookmarks(next);
      setSavedIds(next);
    } catch {
      setBookmarkError("This article could not be saved. Please try again.");
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  const activeQuery = savedOnly ? bookmarks : query;
  const reset = () => {
    setSearch("");
    setTerm("");
    setCategory("");
    setSort("newest");
  };
  const refresh = () => {
    void activeQuery.refetch();
    void categories.refetch();
  };
  const loadMore = () => {
    if (
      !savedOnly &&
      query.hasNextPage &&
      !query.isFetching &&
      !query.isFetchNextPageError
    )
      void query.fetchNextPage({ cancelRefetch: false });
  };
  const topics = categories.data ?? query.data?.pages[0]?.categoryDetails ?? [];
  return (
    <AppScreen
      title={t("Wellness Library")}
      back
      scrollable={false}
      navigation="articles"
      action={
        <View style={s.row}>
          <IconButton
            icon="bookmark"
            label={savedOnly ? "Show all articles" : "Show saved articles"}
            selected={savedOnly}
            onPress={() => setSavedOnly(!savedOnly)}
          />
          <TouchTarget
            accessibilityRole="button"
            accessibilityLabel={t("Profile")}
            onPress={() => router.push("/profile")}
            style={s.iconButton}
          >
            <View style={s.profile}>
              <AppIcon name="user" size={18} color="#FFFFFF" />
            </View>
          </TouchTarget>
        </View>
      }
    >
      <FlatList
        data={articles.slice(1)}
        keyExtractor={(article) => article.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={s.list}
        contentContainerStyle={s.content}
        ListHeaderComponent={
          <LibraryHeader
            search={search}
            setSearch={setSearch}
            submitSearch={() => setTerm(search.trim())}
            category={category}
            setCategory={setCategory}
            topics={topics}
            total={savedOnly ? articles.length : query.data?.pages[0]?.total}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            sort={sort}
            setSort={setSort}
            savedOnly={savedOnly}
            reset={reset}
            featured={articles[0]}
            savedIds={savedIds}
            toggleSaved={toggleSaved}
            saving={saving || !bookmarksReady}
            error={bookmarkError}
          />
        }
        renderItem={({ item }) => (
          <LibraryArticleCard
            article={item}
            saved={savedIds.includes(item.id)}
            toggleSaved={() => void toggleSaved(item.id)}
            saving={saving || !bookmarksReady}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={activeQuery.isRefetching && !query.isFetchingNextPage}
        onRefresh={refresh}
        ListEmptyComponent={
          !articles.length ? (
            <View style={s.state}>
              {activeQuery.isPending ? (
                <ActivityIndicator
                  accessibilityLabel={t("Loading articles")}
                  color="#087D65"
                />
              ) : activeQuery.isError ? (
                <>
                  <Text accessibilityRole="alert" style={s.body}>
                    {t(
                      "Could not load articles. Check your connection and try again.",
                    )}
                  </Text>
                  <Button title={t("Retry")} onPress={refresh} />
                </>
              ) : (
                <>
                  <Text style={s.cardTitle}>
                    {t(
                      savedOnly
                        ? "Your saved articles"
                        : "No matching articles",
                    )}
                  </Text>
                  <Text style={s.body}>
                    {t(
                      savedOnly
                        ? "Tap the bookmark on an article to keep it here. Unpublished articles are no longer available."
                        : "Try another search or clear your filters.",
                    )}
                  </Text>
                  <Button
                    title={t("Clear filters")}
                    variant="secondary"
                    onPress={reset}
                  />
                </>
              )}
            </View>
          ) : undefined
        }
        ListFooterComponent={
          <View>
            {query.isFetchingNextPage && !savedOnly && (
              <ActivityIndicator
                accessibilityLabel={t("Loading more articles")}
                color="#087D65"
              />
            )}
            {((query.isFetchNextPageError && !savedOnly) ||
              (activeQuery.isRefetchError && articles.length > 0)) && (
              <View style={s.state}>
                <Text accessibilityRole="alert" style={s.body}>
                  {t(
                    "More articles could not load. Your articles are still here.",
                  )}
                </Text>
                <Button
                  title={t("Retry")}
                  onPress={() => {
                    if (!savedOnly && query.isFetchNextPageError)
                      void query.fetchNextPage();
                    else refresh();
                  }}
                />
              </View>
            )}
            <LibraryQuestion
              question={question}
              setQuestion={setQuestion}
              onSend={() => {
                const draft = question.trim();
                if (draft)
                  router.push({ pathname: "/jeeva", params: { draft } });
              }}
            />
            <Text style={s.disclaimer}>
              {t(
                "Arogio Knowledge Hub content is created for educational and awareness purposes only. Always consult a qualified medical professional or registered doctor for diagnosing personal medical conditions, severe symptoms, or treatment protocols.",
              )}
            </Text>
          </View>
        }
      />
    </AppScreen>
  );
}
