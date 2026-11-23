import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import {
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { AppIcon } from "../../components/app/AppIcon";
import { TouchTarget } from "../../components/ui/TouchTarget";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../localization/LanguageProvider";
import type { Article, ArticleCategory, ArticleSort } from "../../services/api/healthResourcesApi";
import { ArticleThumbnail } from "./ArticleThumbnail";
import { articleLibraryStyles as s } from "./articleLibraryStyles";

export function IconButton({
  icon,
  label,
  onPress,
  selected,
  disabled = false,
}: {
  icon: "bookmark" | "filter";
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <TouchTarget
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={s.iconButton}
    >
      <AppIcon
        name={icon}
        size={21}
        color={selected ? "#087D65" : "#5C716A"}
        filled={selected}
      />
    </TouchTarget>
  );
}

type HeaderProps = {
  search: string;
  setSearch: (text: string) => void;
  submitSearch: () => void;
  category: string;
  setCategory: (value: string) => void;
  topics: ArticleCategory[];
  total?: number;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  sort: ArticleSort;
  setSort: (sort: ArticleSort) => void;
  savedOnly: boolean;
  reset: () => void;
  featured?: Article;
  savedIds: string[];
  toggleSaved: (id: string) => Promise<void>;
  saving: boolean;
  error: string;
};
export function LibraryHeader(props: HeaderProps) {
  const { t, language } = useTranslation();
  const {
    search,
    setSearch,
    submitSearch,
    category,
    setCategory,
    topics,
    total,
    filtersOpen,
    setFiltersOpen,
    sort,
    setSort,
    featured,
  } = props;
  const trending =
    language === "hi"
      ? ["अश्वगंधा", "HbA1c", "नींद"]
      : ["Ashwagandha", "HbA1c Diet", "Sleep Quality"];
  return (
    <View>
      <View style={s.intro}>
        <View style={[s.row, { justifyContent: "space-between", gap: 8 }]}>
          <View style={[s.row, { flex: 1, gap: 6 }]}>
            <View style={s.verified}>
              <AppIcon name="shield" size={18} />
            </View>
            <Text style={s.knowledge}>{t("Wellness Knowledge")}</Text>
          </View>
          {total != null && (
            <Text accessibilityLiveRegion="polite" style={s.count}>
              {total} {t("Articles")}
            </Text>
          )}
        </View>
        <Text style={s.subtitle}>
          {t(
            "Evidence-based wellness guides, Ayurveda wisdom, and health insights for daily vitality.",
          )}
        </Text>
      </View>
      <View style={[s.row, { gap: 8 }]}>
        <View style={s.search}>
          <AppIcon name="search" color="#5C716A" size={20} />
          <TextInput
            accessibilityLabel={t("Search health articles")}
            value={search}
            onChangeText={setSearch}
            placeholder={t("Search health articles, topics, remedies")}
            placeholderTextColor="#5C716A"
            returnKeyType="search"
            maxLength={150}
            onSubmitEditing={submitSearch}
            style={s.searchInput}
          />
          {search.length > 0 && (
            <TouchTarget
              accessibilityRole="button"
              accessibilityLabel={t("Clear search")}
              onPress={() => setSearch("")}
              style={s.clear}
            >
              <AppIcon name="close" size={16} />
            </TouchTarget>
          )}
        </View>
        <View style={s.filterButton}>
          <IconButton
            icon="filter"
            label={filtersOpen ? "Close filters" : "Open article filters"}
            selected={filtersOpen}
            onPress={() => setFiltersOpen(!filtersOpen)}
          />
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.trending}
      >
        <View style={[s.row, { gap: 3 }]}>
          <AppIcon name="trend" size={12} color="#A8712B" />
          <Text style={s.trendLabel}>{t("Trending:")}</Text>
        </View>
        {trending.map((topic) => (
          <TouchTarget
            key={topic}
            accessibilityRole="button"
            onPress={() => setSearch(topic)}
            style={s.trendChip}
          >
            <Text style={s.trendText}>{topic}</Text>
          </TouchTarget>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categories}
      >
        {[
          { name: "", name_hi: "", label: "All Articles" },
          ...topics.map((topic) => ({ ...topic, label: topic.name })),
        ].map((topic, index) => (
          <TouchTarget
            key={topic.name}
            accessibilityRole="button"
            accessibilityState={{ selected: category === topic.name }}
            onPress={() => setCategory(topic.name)}
            style={[s.category, category === topic.name && s.categorySelected]}
          >
            <AppIcon
              name={
                index === 0
                  ? "grid"
                  : /food|nutrition/i.test(topic.name)
                    ? "food"
                    : "leaf"
              }
              size={18}
              color={category === topic.name ? "#FFFFFF" : "#087D65"}
            />
            <Text
              style={[
                s.categoryText,
                category === topic.name && { color: "#FFFFFF" },
              ]}
            >
              {language === "hi" && topic.name_hi
                ? topic.name_hi
                : t(topic.label)}
            </Text>
          </TouchTarget>
        ))}
      </ScrollView>
      {filtersOpen && (
        <View style={s.filters}>
          <Text style={s.cardTitle}>{t("Sort articles")}</Text>
          <View style={s.wrap}>
            {(
              [
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "title_asc", label: "Title A–Z" },
                { value: "title_desc", label: "Title Z–A" },
              ] as const
            ).map((option) => (
              <TouchTarget
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: sort === option.value }}
                onPress={() => setSort(option.value)}
                style={[
                  s.sortOption,
                  sort === option.value && s.categorySelected,
                ]}
              >
                <Text
                  style={[
                    s.small,
                    { color: sort === option.value ? "#FFFFFF" : "#087D65" },
                  ]}
                >
                  {t(option.label)}
                </Text>
              </TouchTarget>
            ))}
          </View>
          <Button
            title={t("Clear filters")}
            variant="secondary"
            onPress={props.reset}
          />
        </View>
      )}
      {!!props.error && (
        <Text accessibilityRole="alert" style={s.error}>
          {t(props.error)}
        </Text>
      )}
      {(category || search || props.savedOnly) && (
        <View
          style={[s.row, { justifyContent: "space-between", marginBottom: 12 }]}
        >
          <Text style={s.small}>
            {t(props.savedOnly ? "Saved on this device" : "Filtered articles")}
          </Text>
          <TouchTarget accessibilityRole="button" onPress={props.reset}>
            <Text style={s.link}>{t("Clear filters")}</Text>
          </TouchTarget>
        </View>
      )}
      {featured && (
        <LibraryArticleCard
          article={featured}
          featured
          saved={props.savedIds.includes(featured.id)}
          toggleSaved={() => void props.toggleSaved(featured.id)}
          saving={props.saving}
        />
      )}
      <View style={s.protocol}>
        <View style={s.protocolIcon}>
          <AppIcon name="shield" size={25} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.protocolTitle}>
            {t("Your Wellness Reading Guide")}
          </Text>
          <Text style={s.protocolBody}>
            {t(
              "Explore health information and practical wellness ideas. Discuss personal treatment decisions with a qualified clinician.",
            )}
          </Text>
        </View>
      </View>
      <View style={s.latest}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text accessibilityRole="header" style={s.sectionTitle}>
            {t("Latest Medical Insights")}
          </Text>
          <Text style={s.small}>
            {t("Explore our health and wellness library")}
          </Text>
        </View>
        <View style={s.segment}>
          {(
            [
              { value: "newest", label: "Recent" },
              { value: "title_asc", label: "A–Z" },
            ] as const
          ).map((option) => (
            <TouchTarget
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: option.value === sort }}
              onPress={() => setSort(option.value)}
              style={[
                s.segmentButton,
                option.value === sort && s.segmentSelected,
              ]}
            >
              <Text
                style={[
                  s.segmentText,
                  option.value === sort && { color: "#006653" },
                ]}
              >
                {t(option.label)}
              </Text>
            </TouchTarget>
          ))}
        </View>
      </View>
    </View>
  );
}

export function LibraryArticleCard({
  article,
  featured = false,
  saved,
  toggleSaved,
  saving = false,
}: {
  article: Article;
  featured?: boolean;
  saved: boolean;
  toggleSaved: () => void;
  saving?: boolean;
}) {
  const { language, t } = useTranslation();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const expandedText = fontScale >= 1.25;
  const stack = width < 360 && expandedText;
  const title = (language === "hi" && article.title_hi) || article.title_en,
    excerpt = (language === "hi" && article.excerpt_hi) || article.excerpt_en;
  const category =
    (language === "hi" && article.category_hi) || article.category;
  const minutes =
    language === "hi"
      ? (article.reading_minutes_hi ?? article.reading_minutes_en)
      : article.reading_minutes_en;
  const readingTime = minutes ? `${minutes} ${t("min read")}` : "";
  const open = () => router.push(`/articles/${article.id}`);
  const bookmark = (
    <IconButton
      icon="bookmark"
      selected={saved}
      disabled={saving}
      label={`${saved ? t("Remove saved article") : t("Save article")}: ${title}`}
      onPress={toggleSaved}
    />
  );
  if (featured)
    return (
      <View style={s.featured}>
        <View style={s.cover}>
          <TouchTarget
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={open}
            style={{ flex: 1 }}
          >
            <ArticleThumbnail
              category={article.category}
              uri={article.thumbnail_url || article.image_url}
              style={{ width: "100%", height: "100%" }}
            />
          </TouchTarget>
          <View pointerEvents="none" style={s.featuredTag}>
            <AppIcon name="sparkles" size={14} color="#FFFFFF" />
            <Text style={s.featuredTagText}>{t("Featured Read")}</Text>
          </View>
          <View style={s.coverBookmark}>{bookmark}</View>
          <View pointerEvents="none" style={s.coverCategory}>
            <Text style={s.coverCategoryText}>{category}</Text>
            {!!readingTime && <Text style={s.coverTime}>{readingTime}</Text>}
          </View>
        </View>
        <View style={s.featuredCopy}>
          <TouchTarget
            accessibilityRole="button"
            onPress={open}
            accessibilityLabel={title}
          >
            <Text style={s.featuredTitle}>{title}</Text>
          </TouchTarget>
          <Text numberOfLines={2} style={s.excerpt}>
            {excerpt}
          </Text>
          <TouchTarget
            accessibilityRole="button"
            accessibilityLabel={`${t("Read article")}: ${title}`}
            onPress={open}
            style={s.readAction}
          >
            <View style={[s.row, { gap: 5, flex: 1 }]}>
              <AppIcon name="clock" size={15} />
              <Text style={s.readLabel}>
                {readingTime ? `${readingTime} \u2022 ` : ""}
                {category}
              </Text>
            </View>
            <View style={s.readArrow}>
              <AppIcon name="arrow" size={19} />
            </View>
          </TouchTarget>
        </View>
      </View>
    );
  return (
    <View style={s.article}>
      <TouchTarget
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={open}
        style={[s.articleBody, stack && { flexDirection: "column-reverse" }]}
      >
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <View style={[s.row, { gap: 5, flexWrap: "wrap" }]}>
            <Text numberOfLines={1} style={s.articleCategory}>
              {category}
            </Text>
            {!!readingTime && <Text style={s.readTime}>{readingTime}</Text>}
          </View>
          <Text
            numberOfLines={expandedText ? undefined : 2}
            style={s.cardTitle}
          >
            {title}
          </Text>
          <Text
            numberOfLines={expandedText ? undefined : 2}
            style={s.articleExcerpt}
          >
            {excerpt}
          </Text>
        </View>
        <ArticleThumbnail
          category={article.category}
          uri={article.thumbnail_url || article.image_url}
          style={[
            s.thumbnail,
            stack && { width: "100%", height: 140 },
            !stack && width < 360 && { width: 80, height: 80 },
          ]}
        />
      </TouchTarget>
      <View style={s.articleBottom}>
        <Text numberOfLines={2} style={[s.small, { flex: 1 }]}>
          {article.author_name || t("Arogio editorial")}
        </Text>
        {bookmark}
      </View>
    </View>
  );
}

export function LibraryQuestion({
  question,
  setQuestion,
  onSend,
}: {
  question: string;
  setQuestion: (text: string) => void;
  onSend: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={s.question}>
      <View pointerEvents="none" style={s.questionCircle} />
      <View style={[s.row, { alignItems: "flex-start", gap: 9 }]}>
        <View style={s.robot}>
          <AppIcon name="robot" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.questionTitle}>
            {t("Have questions about these remedies?")}
          </Text>
          <Text style={s.small}>
            {t(
              "Ask Jeeva, our AI health assistant, about health information and everyday wellness.",
            )}
          </Text>
        </View>
      </View>
      <View style={[s.row, { gap: 6, marginTop: 12 }]}>
        <TextInput
          accessibilityLabel={t("Question for Jeeva")}
          placeholder={t("e.g. Can I take Ashwagandha with BP meds?")}
          placeholderTextColor="#5C716A"
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={onSend}
          returnKeyType="send"
          maxLength={2000}
          style={s.questionInput}
        />
        <TouchTarget
          accessibilityRole="button"
          accessibilityLabel={t("Ask Jeeva")}
          accessibilityState={{ disabled: !question.trim() }}
          disabled={!question.trim()}
          onPress={onSend}
          style={[s.send, !question.trim() && { opacity: 0.55 }]}
        >
          <AppIcon name="send" color="#FFFFFF" size={21} />
        </TouchTarget>
      </View>
    </View>
  );
}
